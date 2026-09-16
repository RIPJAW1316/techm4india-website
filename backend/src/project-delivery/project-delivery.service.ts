import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  ProjectMilestoneStatus,
  ProjectRiskStatus,
  ProjectSprintStatus,
} from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import {
  CreateMilestoneDto,
  CreateRiskDto,
  CreateSprintDto,
  CreateTimeLogDto,
  PagingDto,
  UpdateRiskDto,
} from "./dto/project-delivery.dto";

@Injectable()
export class ProjectDeliveryService extends V2ServiceBase {
  private async project(principal: Principal, projectId: string) {
    const row = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: this.organizationId(principal) },
      select: { id: true },
    });
    if (!row) throw new NotFoundException("Project not found");
    return row;
  }

  // ----- Milestones --------------------------------------------------------

  async listMilestones(principal: Principal, projectId: string, query: PagingDto) {
    await this.project(principal, projectId);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.ProjectMilestoneWhereInput = {
      organizationId: this.organizationId(principal),
      projectId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.projectMilestone.findMany({ where, orderBy: [{ dueDate: "asc" }], skip, take }),
      this.prisma.projectMilestone.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createMilestone(
    principal: Principal,
    projectId: string,
    dto: CreateMilestoneDto,
    request?: RequestMetadata,
  ) {
    await this.project(principal, projectId);
    const row = await this.prisma.projectMilestone.create({
      data: {
        organizationId: this.organizationId(principal),
        projectId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        dueDate: new Date(dto.dueDate),
        createdByUserId: principal.userId,
      },
    });
    await this.record("PROJECT_MILESTONE_CREATED", principal, "ProjectMilestone", row.id, request, {
      projectId,
    });
    return row;
  }

  async transitionMilestone(
    principal: Principal,
    id: string,
    action: "start" | "complete" | "miss",
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.projectMilestone.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Milestone not found");
    const transitions: Record<
      typeof action,
      { from: ProjectMilestoneStatus[]; to: ProjectMilestoneStatus }
    > = {
      start: { from: [ProjectMilestoneStatus.PENDING], to: ProjectMilestoneStatus.IN_PROGRESS },
      complete: {
        from: [ProjectMilestoneStatus.PENDING, ProjectMilestoneStatus.IN_PROGRESS],
        to: ProjectMilestoneStatus.COMPLETED,
      },
      miss: {
        from: [ProjectMilestoneStatus.PENDING, ProjectMilestoneStatus.IN_PROGRESS],
        to: ProjectMilestoneStatus.MISSED,
      },
    };
    const transition = transitions[action];
    if (!transition.from.includes(current.status)) {
      throw new ConflictException(`Cannot ${action} a milestone in ${current.status} status`);
    }
    const row = await this.prisma.projectMilestone.update({
      where: { id },
      data: {
        status: transition.to,
        completedAt: action === "complete" ? new Date() : current.completedAt,
      },
    });
    await this.record(
      `PROJECT_MILESTONE_${action.toUpperCase()}`,
      principal,
      "ProjectMilestone",
      id,
      request,
      {
        from: current.status,
        to: row.status,
      },
    );
    return row;
  }

  // ----- Risks -------------------------------------------------------------

  async listRisks(principal: Principal, projectId: string, query: PagingDto) {
    await this.project(principal, projectId);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.ProjectRiskWhereInput = {
      organizationId: this.organizationId(principal),
      projectId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.projectRisk.findMany({
        where,
        include: { owner: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.projectRisk.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createRisk(
    principal: Principal,
    projectId: string,
    dto: CreateRiskDto,
    request?: RequestMetadata,
  ) {
    await this.project(principal, projectId);
    if (dto.ownerEmployeeId) {
      await this.employeeInOrganization(principal, dto.ownerEmployeeId, "Risk owner");
    }
    const row = await this.prisma.projectRisk.create({
      data: {
        organizationId: this.organizationId(principal),
        projectId,
        ownerEmployeeId: dto.ownerEmployeeId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        severity: dto.severity ?? "MEDIUM",
        likelihood: dto.likelihood ?? "MEDIUM",
        mitigation: dto.mitigation?.trim(),
        createdByUserId: principal.userId,
      },
    });
    await this.record("PROJECT_RISK_CREATED", principal, "ProjectRisk", row.id, request, {
      projectId,
    });
    return row;
  }

  async updateRisk(
    principal: Principal,
    id: string,
    dto: UpdateRiskDto,
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.projectRisk.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Risk not found");
    const closing =
      dto.status === ProjectRiskStatus.CLOSED || dto.status === ProjectRiskStatus.ACCEPTED;
    const row = await this.prisma.projectRisk.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.severity ? { severity: dto.severity } : {}),
        ...(dto.mitigation !== undefined ? { mitigation: dto.mitigation.trim() } : {}),
        ...(closing ? { closedAt: new Date() } : {}),
      },
    });
    await this.record("PROJECT_RISK_UPDATED", principal, "ProjectRisk", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }

  // ----- Sprints -----------------------------------------------------------

  async listSprints(principal: Principal, projectId: string, query: PagingDto) {
    await this.project(principal, projectId);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.ProjectSprintWhereInput = {
      organizationId: this.organizationId(principal),
      projectId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.projectSprint.findMany({ where, orderBy: [{ startsOn: "desc" }], skip, take }),
      this.prisma.projectSprint.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createSprint(
    principal: Principal,
    projectId: string,
    dto: CreateSprintDto,
    request?: RequestMetadata,
  ) {
    await this.project(principal, projectId);
    if (new Date(dto.endsOn).getTime() < new Date(dto.startsOn).getTime()) {
      throw new BadRequestException("Sprint end date must be on or after the start date");
    }
    let row;
    try {
      row = await this.prisma.projectSprint.create({
        data: {
          organizationId: this.organizationId(principal),
          projectId,
          name: dto.name.trim(),
          goal: dto.goal?.trim(),
          startsOn: new Date(dto.startsOn),
          endsOn: new Date(dto.endsOn),
          createdByUserId: principal.userId,
        },
      });
    } catch (error) {
      this.duplicate(error, "A sprint with this name already exists for the project");
    }
    await this.record("PROJECT_SPRINT_CREATED", principal, "ProjectSprint", row.id, request, {
      projectId,
    });
    return row;
  }

  async transitionSprint(
    principal: Principal,
    id: string,
    action: "start" | "complete" | "cancel",
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.projectSprint.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Sprint not found");
    const transitions: Record<
      typeof action,
      { from: ProjectSprintStatus[]; to: ProjectSprintStatus }
    > = {
      start: { from: [ProjectSprintStatus.PLANNED], to: ProjectSprintStatus.ACTIVE },
      complete: { from: [ProjectSprintStatus.ACTIVE], to: ProjectSprintStatus.COMPLETED },
      cancel: {
        from: [ProjectSprintStatus.PLANNED, ProjectSprintStatus.ACTIVE],
        to: ProjectSprintStatus.CANCELLED,
      },
    };
    const transition = transitions[action];
    if (!transition.from.includes(current.status)) {
      throw new ConflictException(`Cannot ${action} a sprint in ${current.status} status`);
    }
    const row = await this.prisma.projectSprint.update({
      where: { id },
      data: { status: transition.to },
    });
    await this.record(
      `PROJECT_SPRINT_${action.toUpperCase()}`,
      principal,
      "ProjectSprint",
      id,
      request,
      {
        from: current.status,
        to: row.status,
      },
    );
    return row;
  }

  // ----- Time logs ---------------------------------------------------------

  async listTimeLogs(principal: Principal, projectId: string, query: PagingDto) {
    await this.project(principal, projectId);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.ProjectTimeLogWhereInput = {
      organizationId: this.organizationId(principal),
      projectId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.projectTimeLog.findMany({
        where,
        include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: [{ workDate: "desc" }],
        skip,
        take,
      }),
      this.prisma.projectTimeLog.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createTimeLog(
    principal: Principal,
    projectId: string,
    dto: CreateTimeLogDto,
    request?: RequestMetadata,
  ) {
    await this.project(principal, projectId);
    const employeeId = dto.employeeId ?? principal.employeeId;
    if (!employeeId) throw new BadRequestException("No employee context for the time log");
    if (
      employeeId !== principal.employeeId &&
      !principal.permissions.includes("projects.delivery.manage")
    ) {
      throw new ForbiddenException("Only delivery managers can log time for other employees");
    }
    await this.employeeInOrganization(principal, employeeId, "Employee");
    const row = await this.prisma.projectTimeLog.create({
      data: {
        organizationId: this.organizationId(principal),
        projectId,
        taskId: dto.taskId,
        employeeId,
        workDate: new Date(dto.workDate),
        hours: new Prisma.Decimal(dto.hours),
        note: dto.note?.trim(),
        createdByUserId: principal.userId,
      },
    });
    await this.record("PROJECT_TIME_LOGGED", principal, "ProjectTimeLog", row.id, request, {
      projectId,
      employeeId,
      hours: dto.hours,
    });
    return row;
  }
}
