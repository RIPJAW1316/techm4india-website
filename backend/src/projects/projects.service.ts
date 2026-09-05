import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, ProjectStatus } from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { AuthorizationPolicy } from "../auth/policies/authorization.policy";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { businessDayBoundaries } from "../common/time/business-time";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectQueryDto } from "./dto/project-query.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

const projectInclude = {
  division: { select: { id: true, slug: true, name: true } },
  projectManager: { select: { id: true, firstName: true, lastName: true, designation: true } },
  members: {
    where: { removedAt: null },
    orderBy: { joinedAt: "asc" },
    include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, designation: true, divisionId: true } } },
  },
  tasks: { select: { status: true, dueDate: true } },
} satisfies Prisma.ProjectInclude;

type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: AuthorizationPolicy,
    private readonly auditService: AuditService,
    private readonly notifications: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async my(principal: Principal, query: ProjectQueryDto) {
    if (!principal.employeeId) return { data: [], meta: { page: query.page, limit: query.limit, total: 0, totalPages: 0 } };
    const where: Prisma.ProjectWhereInput = {
      organizationId: principal.organizationId,
      status: query.status,
      priority: query.priority,
      ...(query.divisionId ? { divisionId: query.divisionId } : {}),
      ...(query.search ? { OR: [{ code: { contains: query.search.trim(), mode: "insensitive" } }, { name: { contains: query.search.trim(), mode: "insensitive" } }] } : {}),
      OR: [
        { projectManagerId: principal.employeeId },
        { members: { some: { employeeId: principal.employeeId, removedAt: null } } },
      ],
    };
    return this.listWithWhere(where, query, principal);
  }

  async list(principal: Principal, query: ProjectQueryDto) {
    const membershipOrManager: Prisma.ProjectWhereInput[] = principal.employeeId
      ? [{ projectManagerId: principal.employeeId }, { members: { some: { employeeId: principal.employeeId, removedAt: null } } }]
      : [];
    const canReadDivision = principal.permissions.includes("projects.read_division") && Boolean(principal.divisionId);
    const canReadAll = this.policy.isOrganizationWide(principal) && (
      principal.permissions.includes("projects.read_all") || principal.permissions.includes("projects.read_division") || principal.permissions.includes("projects.manage")
    );
    const access: Prisma.ProjectWhereInput[] = canReadAll
      ? [{}]
      : [...membershipOrManager, ...(canReadDivision ? [{ divisionId: principal.divisionId }] : [])];
    if (!access.length) throw new ForbiddenException("Project directory access denied");
    const where: Prisma.ProjectWhereInput = {
      organizationId: principal.organizationId,
      status: query.status,
      priority: query.priority,
      ...(query.divisionId ? { divisionId: query.divisionId } : {}),
      ...(query.search ? { OR: [{ code: { contains: query.search.trim(), mode: "insensitive" } }, { name: { contains: query.search.trim(), mode: "insensitive" } }] } : {}),
      OR: access,
    };
    return this.listWithWhere(where, query, principal);
  }

  async getById(principal: Principal, id: string) {
    const project = await this.prisma.project.findUnique({ where: { id }, include: projectInclude });
    if (!project) throw new NotFoundException("Project not found");
    if (!this.canRead(principal, project)) throw new ForbiddenException("Project access denied");
    return this.toResponse(project, true);
  }

  async create(principal: Principal, dto: CreateProjectDto, request: RequestMetadata) {
    if (!principal.permissions.includes("projects.manage")) throw new ForbiddenException("Project creation denied");
    const division = await this.prisma.division.findUnique({ where: { id: dto.divisionId }, select: { id: true, organizationId: true, name: true, slug: true, status: true } });
    if (!division || division.status !== "ACTIVE" || (principal.organizationId && division.organizationId !== principal.organizationId)) throw new NotFoundException("Division not found");
    if (!this.policy.isOrganizationWide(principal) && principal.divisionId !== division.id) throw new ForbiddenException("Project division access denied");
    const dates = this.validateDates(dto.startDate, dto.dueDate);
    if (dto.projectManagerId) await this.assertManager(dto.projectManagerId, division.id, principal);
    try {
      const project = await this.prisma.project.create({
        data: {
          organizationId: division.organizationId,
          divisionId: division.id,
          code: dto.code.trim(),
          name: dto.name.trim(),
          description: dto.description?.trim(),
          projectManagerId: dto.projectManagerId,
          createdByUserId: principal.userId,
          status: dto.status ?? ProjectStatus.PLANNING,
          priority: dto.priority,
          progress: dto.progress ?? 0,
          startDate: dates.startDate,
          dueDate: dates.dueDate,
        },
        include: projectInclude,
      });
      await this.auditService.record({ action: "PROJECT_CREATED", actorUserId: principal.userId, entityType: "Project", entityId: project.id, metadata: { code: project.code }, request });
      return this.toResponse(project, true);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictException("Project code already exists");
      throw error;
    }
  }

  async update(principal: Principal, id: string, dto: UpdateProjectDto, request: RequestMetadata) {
    const existing = await this.prisma.project.findUnique({ where: { id }, include: projectInclude });
    if (!existing) throw new NotFoundException("Project not found");
    if (!this.policy.canManageProject(principal, { divisionId: existing.divisionId, projectManagerId: existing.projectManagerId, memberEmployeeIds: existing.members.map((m) => m.employeeId) })) throw new ForbiddenException("Project update denied");
    const dates = this.validateDates(dto.startDate ?? existing.startDate?.toISOString(), dto.dueDate ?? existing.dueDate?.toISOString());
    if (dto.projectManagerId) await this.assertManager(dto.projectManagerId, existing.divisionId, principal);
    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name?.trim(), description: dto.description?.trim(), status: dto.status, priority: dto.priority,
        progress: dto.progress, startDate: dates.startDate, dueDate: dates.dueDate, projectManagerId: dto.projectManagerId,
      },
      include: projectInclude,
    });
    await this.auditService.record({ action: "PROJECT_UPDATED", actorUserId: principal.userId, entityType: "Project", entityId: id, metadata: { fields: Object.keys(dto) }, request });
    return this.toResponse(project, true);
  }

  async members(principal: Principal, id: string) {
    const project = await this.getProjectScope(id);
    if (!this.canRead(principal, project)) throw new ForbiddenException("Project access denied");
    return project.members.map((member) => ({
      employee: { id: member.employee.id, employeeCode: member.employee.employeeCode, name: `${member.employee.firstName} ${member.employee.lastName}`.trim(), designation: member.employee.designation },
      joinedAt: member.joinedAt,
    }));
  }

  async addMember(principal: Principal, id: string, dto: AddProjectMemberDto, request: RequestMetadata) {
    const project = await this.getProjectScope(id);
    if (!this.policy.canManageProject(principal, project)) throw new ForbiddenException("Project membership management denied");
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId }, select: { id: true, userId: true, firstName: true, lastName: true, divisionId: true, employmentStatus: true } });
    if (!employee || employee.employmentStatus !== "ACTIVE") throw new NotFoundException("Active employee not found");
    if (employee.divisionId !== project.divisionId && !this.policy.isOrganizationWide(principal)) throw new ForbiddenException("Cross-division membership requires organization-wide authorization");
    const result = await this.prisma.$transaction(async (tx) => {
      const member = await tx.projectMember.upsert({ where: { projectId_employeeId: { projectId: id, employeeId: dto.employeeId } }, update: { removedAt: null }, create: { projectId: id, employeeId: dto.employeeId }, include: { employee: { select: { id: true, firstName: true, lastName: true, designation: true } } } });
      await this.notifications.create({ userId: employee.userId, type: "PROJECT_MEMBER_ADDED", title: "Added to project", body: `You were added to ${project.name}.`, resourceType: "Project", resourceId: id, tx });
      await tx.auditLog.create({ data: { action: "PROJECT_MEMBER_ADDED", actorUserId: principal.userId, entityType: "ProjectMember", entityId: `${id}:${dto.employeeId}`, metadata: { projectId: id, employeeId: dto.employeeId }, ipAddress: request.ipAddress, userAgent: request.userAgent?.slice(0, 512) } });
      return member;
    });
    return { employee: result.employee, projectId: id };
  }

  async removeMember(principal: Principal, id: string, employeeId: string, request: RequestMetadata) {
    const project = await this.getProjectScope(id);
    if (!this.policy.canManageProject(principal, project)) throw new ForbiddenException("Project membership management denied");
    const member = await this.prisma.projectMember.findUnique({ where: { projectId_employeeId: { projectId: id, employeeId } } });
    if (!member || member.removedAt) throw new NotFoundException("Active project member not found");
    const updated = await this.prisma.projectMember.update({ where: { projectId_employeeId: { projectId: id, employeeId } }, data: { removedAt: new Date() } });
    await this.auditService.record({ action: "PROJECT_MEMBER_REMOVED", actorUserId: principal.userId, entityType: "ProjectMember", entityId: `${id}:${employeeId}`, metadata: { projectId: id, employeeId }, request });
    return { projectId: updated.projectId, employeeId: updated.employeeId, removedAt: updated.removedAt };
  }

  private async listWithWhere(where: Prisma.ProjectWhereInput, query: ProjectQueryDto, principal: Principal) {
    const [total, projects] = await this.prisma.$transaction([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({ where, include: projectInclude, orderBy: { updatedAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }),
    ]);
    return { data: projects.map((project) => this.toResponse(project, false, principal)), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  private async getProjectScope(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id }, include: projectInclude });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  private canRead(principal: Principal, project: ProjectWithRelations) {
    return this.policy.canAccessProject(principal, { divisionId: project.divisionId, projectManagerId: project.projectManagerId, memberEmployeeIds: project.members.map((member) => member.employeeId) });
  }

  private toResponse(project: ProjectWithRelations, includeTasks: boolean, principal?: Principal) {
    const businessDayStart = businessDayBoundaries(new Date(), this.configService.get<string>("businessTimeZone")).start;
    const counts = project.tasks.reduce<Record<string, number>>((result, task) => { result[task.status] = (result[task.status] ?? 0) + 1; if (task.dueDate && task.dueDate < businessDayStart && task.status !== "COMPLETED" && task.status !== "CANCELLED") result.overdue = (result.overdue ?? 0) + 1; return result; }, {});
    const member = principal?.employeeId ? project.members.find((item) => item.employeeId === principal.employeeId) : undefined;
    return {
      id: project.id, code: project.code, name: project.name, description: project.description, status: project.status, priority: project.priority, progress: project.progress,
      startDate: project.startDate, dueDate: project.dueDate,
      division: project.division,
      projectManager: project.projectManager ? { id: project.projectManager.id, name: `${project.projectManager.firstName} ${project.projectManager.lastName}`.trim(), designation: project.projectManager.designation } : null,
      ...(includeTasks ? { members: project.members.map((item) => ({ employee: { id: item.employee.id, employeeCode: item.employee.employeeCode, name: `${item.employee.firstName} ${item.employee.lastName}`.trim(), designation: item.employee.designation }, joinedAt: item.joinedAt })), taskSummary: { total: project.tasks.length, todo: counts.TODO ?? 0, inProgress: counts.IN_PROGRESS ?? 0, blocked: counts.BLOCKED ?? 0, review: counts.REVIEW ?? 0, completed: counts.COMPLETED ?? 0, overdue: counts.overdue ?? 0 } } : { myMembership: member ? { role: "MEMBER" } : null }),
    };
  }

  private validateDates(start?: string, due?: string) {
    const startDate = start ? new Date(start) : undefined;
    const dueDate = due ? new Date(due) : undefined;
    if (startDate && Number.isNaN(startDate.getTime())) throw new ForbiddenException("Invalid start date");
    if (dueDate && Number.isNaN(dueDate.getTime())) throw new ForbiddenException("Invalid due date");
    if (startDate && dueDate && dueDate < startDate) throw new ForbiddenException("Due date cannot precede start date");
    return { startDate, dueDate };
  }

  private async assertManager(employeeId: string, divisionId: string, principal: Principal) {
    const manager = await this.prisma.employee.findUnique({ where: { id: employeeId }, select: { id: true, divisionId: true, employmentStatus: true } });
    if (!manager || manager.employmentStatus !== "ACTIVE") throw new NotFoundException("Project manager not found");
    if (manager.divisionId !== divisionId && !this.policy.isOrganizationWide(principal)) throw new ForbiddenException("Project manager division mismatch");
  }
}
