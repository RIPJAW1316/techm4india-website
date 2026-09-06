import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, TaskStatus } from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { AuthorizationPolicy } from "../auth/policies/authorization.policy";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { DueFilter, TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { businessDayBoundaries } from "../common/time/business-time";

const taskInclude = {
  project: { select: { id: true, code: true, name: true, divisionId: true, projectManagerId: true, startDate: true, dueDate: true } },
  assignee: { select: { id: true, firstName: true, lastName: true, designation: true, userId: true } },
  createdByEmployee: { select: { id: true, firstName: true, lastName: true, designation: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.ProjectTaskInclude;

type TaskWithRelations = Prisma.ProjectTaskGetPayload<{ include: typeof taskInclude }>;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: AuthorizationPolicy,
    private readonly auditService: AuditService,
    private readonly notifications: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async my(principal: Principal, query: TaskQueryDto) {
    if (!principal.employeeId) return { data: [], meta: { page: query.page, limit: query.limit, total: 0, totalPages: 0 } };
    const where = this.taskWhere({ assigneeId: principal.employeeId, ...this.queryFilters(query) });
    return this.listWhere(where, query);
  }

  async summary(principal: Principal) {
    if (!principal.employeeId) return { total: 0, todo: 0, inProgress: 0, blocked: 0, review: 0, completed: 0, cancelled: 0, overdue: 0, dueToday: 0, upcoming: 0 };
    const { start, tomorrow, nextWeek } = businessDayBoundaries(new Date(), this.configService.get<string>("businessTimeZone"));
    const base = { assigneeId: principal.employeeId };
    const [total, todo, inProgress, blocked, review, completed, cancelled, overdue, dueToday, upcoming] = await Promise.all([
      this.prisma.projectTask.count({ where: base }),
      this.prisma.projectTask.count({ where: { ...base, status: TaskStatus.TODO } }),
      this.prisma.projectTask.count({ where: { ...base, status: TaskStatus.IN_PROGRESS } }),
      this.prisma.projectTask.count({ where: { ...base, status: TaskStatus.BLOCKED } }),
      this.prisma.projectTask.count({ where: { ...base, status: TaskStatus.REVIEW } }),
      this.prisma.projectTask.count({ where: { ...base, status: TaskStatus.COMPLETED } }),
      this.prisma.projectTask.count({ where: { ...base, status: TaskStatus.CANCELLED } }),
      this.prisma.projectTask.count({ where: { ...base, dueDate: { lt: start }, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } } }),
      this.prisma.projectTask.count({ where: { ...base, dueDate: { gte: start, lt: tomorrow }, status: { not: TaskStatus.COMPLETED } } }),
      this.prisma.projectTask.count({ where: { ...base, dueDate: { gte: tomorrow, lt: nextWeek }, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } } }),
    ]);
    return { total, todo, inProgress, blocked, review, completed, cancelled, overdue, dueToday, upcoming };
  }

  async getById(principal: Principal, id: string) {
    const task = await this.prisma.projectTask.findUnique({ where: { id }, include: taskInclude });
    if (!task) throw new NotFoundException("Task not found");
    if (!(await this.canReadTask(principal, task))) throw new ForbiddenException("Task access denied");
    return this.toResponse(task);
  }

  async create(principal: Principal, projectId: string, dto: CreateTaskDto, request: RequestMetadata) {
    return this.createInternal(principal, projectId, dto, request, "standard");
  }

  async createForExecutive(principal: Principal, employeeId: string, projectId: string, dto: CreateTaskDto, request: RequestMetadata) {
    if (!principal.permissions.includes("tasks.create_all")) throw new ForbiddenException("Executive task creation denied");
    return this.createInternal(principal, projectId, { ...dto, assigneeEmployeeId: employeeId }, request, "executive");
  }

  private async createInternal(principal: Principal, projectId: string, dto: CreateTaskDto, request: RequestMetadata, mode: "standard" | "executive") {
    const project = await this.projectScope(projectId);
    if (mode === "standard" && !this.policy.canManageProject(principal, project)) throw new ForbiddenException("Task creation denied");
    if (mode === "executive" && principal.organizationId !== project.organizationId) throw new ForbiddenException("Project organization access denied");
    let assignee: { id: string; userId: string; firstName: string; lastName: string; divisionId: string | null; employmentStatus: "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "RESIGNED" | "TERMINATED" } | null = null;
    if (dto.assigneeEmployeeId) {
      assignee = await this.prisma.employee.findUnique({ where: { id: dto.assigneeEmployeeId }, select: { id: true, userId: true, firstName: true, lastName: true, divisionId: true, employmentStatus: true } });
      if (!assignee || assignee.employmentStatus !== "ACTIVE") throw new NotFoundException("Active assignee not found");
      if (mode === "standard") {
        const isMember = await this.prisma.projectMember.findUnique({ where: { projectId_employeeId: { projectId, employeeId: dto.assigneeEmployeeId } }, select: { removedAt: true } });
        if ((!isMember || isMember.removedAt) && dto.assigneeEmployeeId !== project.projectManagerId) throw new ForbiddenException("Assignee must be an active project member");
      } else if (assignee.divisionId) {
        const assigneeDivision = await this.prisma.division.findUnique({ where: { id: assignee.divisionId }, select: { organizationId: true } });
        if (!assigneeDivision || assigneeDivision.organizationId !== project.organizationId) {
          throw new ForbiddenException("Assignee organization access denied");
        }
      }
    }
    this.validateDueDate(dto.dueDate, project.startDate, project.dueDate);
    const status = dto.status ?? TaskStatus.TODO;
    const completedAt = status === TaskStatus.COMPLETED ? new Date() : undefined;
    const task = await this.prisma.$transaction(async (tx) => {
      const created = await tx.projectTask.create({ data: { projectId, title: dto.title.trim(), description: dto.description?.trim(), assigneeId: dto.assigneeEmployeeId, createdByUserId: principal.userId, createdByEmployeeId: principal.employeeId, priority: dto.priority, status, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, completedAt }, include: taskInclude });
      if (assignee) {
        await this.notifications.create({ userId: assignee.userId, type: "TASK_ASSIGNED", title: "New task assigned", body: `You were assigned “${created.title}”.`, resourceType: "ProjectTask", resourceId: created.id, tx });
      }
      await tx.auditLog.create({ data: { action: mode === "executive" ? "FOUNDER_TASK_CREATED" : "TASK_CREATED", actorUserId: principal.userId, entityType: "ProjectTask", entityId: created.id, metadata: { projectId, employeeId: dto.assigneeEmployeeId ?? null, assigneeId: dto.assigneeEmployeeId ?? null }, ipAddress: request.ipAddress, userAgent: request.userAgent?.slice(0, 512) } });
      if (assignee) await tx.auditLog.create({ data: { action: mode === "executive" ? "TASK_REASSIGNED" : "TASK_ASSIGNED", actorUserId: principal.userId, entityType: "ProjectTask", entityId: created.id, metadata: { previousAssigneeId: null, newAssigneeId: assignee.id, employeeId: assignee.id, projectId }, ipAddress: request.ipAddress, userAgent: request.userAgent?.slice(0, 512) } });
      return created;
    });
    return this.toResponse(task);
  }

  async update(principal: Principal, id: string, dto: UpdateTaskDto, request: RequestMetadata) {
    return this.updateInternal(principal, id, dto, request, "standard");
  }

  async updateForExecutive(principal: Principal, id: string, dto: UpdateTaskDto, request: RequestMetadata) {
    if (!principal.permissions.includes("tasks.update_all")) throw new ForbiddenException("Executive task update denied");
    return this.updateInternal(principal, id, dto, request, "executive");
  }

  private async updateInternal(principal: Principal, id: string, dto: UpdateTaskDto, request: RequestMetadata, mode: "standard" | "executive") {
    const existing = await this.prisma.projectTask.findUnique({ where: { id }, include: taskInclude });
    if (!existing) throw new NotFoundException("Task not found");
    const scope = await this.projectScope(existing.projectId);
    const isAssignee = principal.employeeId === existing.assigneeId;
    const keys = Object.keys(dto).filter((key) => (dto as Record<string, unknown>)[key] !== undefined);
    if (mode === "executive" && principal.organizationId !== scope.organizationId) throw new ForbiddenException("Task organization access denied");
    if (mode === "standard" && isAssignee && !this.policy.canManageTask(principal, scope)) {
      if (!principal.permissions.includes("tasks.update_assigned") || keys.some((key) => key !== "status")) throw new ForbiddenException("Employees may only update their assigned task status");
    } else if (mode === "standard" && !this.policy.canManageTask(principal, scope)) {
      throw new ForbiddenException("Task update denied");
    }
    if (dto.assigneeEmployeeId) {
      const target = await this.prisma.employee.findUnique({ where: { id: dto.assigneeEmployeeId }, select: { id: true, userId: true, employmentStatus: true } });
      if (!target || target.employmentStatus !== "ACTIVE") throw new ForbiddenException("Assignee must be an active employee");
      if (mode === "standard") {
        const member = await this.prisma.projectMember.findUnique({ where: { projectId_employeeId: { projectId: existing.projectId, employeeId: dto.assigneeEmployeeId } }, select: { removedAt: true } });
        if ((!member || member.removedAt) && dto.assigneeEmployeeId !== scope.projectManagerId) throw new ForbiddenException("Assignee must be an active project member");
      }
    }
    this.validateDueDate(dto.dueDate, scope.startDate, scope.dueDate);
    const status = dto.status;
    const task = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.projectTask.update({ where: { id }, data: { title: dto.title?.trim(), description: dto.description?.trim(), assigneeId: dto.assigneeEmployeeId, priority: dto.priority, status, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, completedAt: status === TaskStatus.COMPLETED ? new Date() : status ? null : undefined }, include: taskInclude });
      const auditData = { actorUserId: principal.userId, entityType: "ProjectTask", entityId: id, ipAddress: request.ipAddress, userAgent: request.userAgent?.slice(0, 512) };
      const reassigned = dto.assigneeEmployeeId !== undefined && dto.assigneeEmployeeId !== existing.assigneeId;
      const action = mode === "executive"
        ? status === TaskStatus.CANCELLED && existing.status !== TaskStatus.CANCELLED ? "TASK_CANCELLED" : "FOUNDER_TASK_UPDATED"
        : status && status !== existing.status ? "TASK_STATUS_CHANGED" : "TASK_UPDATED";
      await tx.auditLog.create({ data: { ...auditData, action, metadata: { fields: keys, previousStatus: existing.status, status: status ?? existing.status, previousAssigneeId: existing.assigneeId, newAssigneeId: dto.assigneeEmployeeId ?? existing.assigneeId } } });
      if (reassigned) {
        const assignee = await tx.employee.findUnique({ where: { id: dto.assigneeEmployeeId }, select: { userId: true } });
        if (assignee) await this.notifications.create({ userId: assignee.userId, type: "TASK_ASSIGNED", title: "New task assigned", body: `You were assigned “${updated.title}”.`, resourceType: "ProjectTask", resourceId: id, tx });
        await tx.auditLog.create({ data: { ...auditData, action: mode === "executive" ? "TASK_REASSIGNED" : "TASK_ASSIGNED", metadata: { taskId: id, previousAssigneeId: existing.assigneeId, newAssigneeId: dto.assigneeEmployeeId, employeeId: dto.assigneeEmployeeId } } });
      }
      if (mode === "executive" && status === TaskStatus.CANCELLED && existing.status !== TaskStatus.CANCELLED && updated.assignee?.userId) {
        await this.notifications.create({ userId: updated.assignee.userId, type: "SYSTEM", title: "Task cancelled", body: `The task “${updated.title}” was cancelled.`, resourceType: "ProjectTask", resourceId: id, tx });
      }
      return updated;
    });
    return this.toResponse(task);
  }

  async comments(principal: Principal, taskId: string) {
    const task = await this.prisma.projectTask.findUnique({ where: { id: taskId }, include: taskInclude });
    if (!task) throw new NotFoundException("Task not found");
    if (!(await this.canReadTask(principal, task))) throw new ForbiddenException("Task access denied");
    return this.prisma.taskComment.findMany({ where: { taskId }, orderBy: { createdAt: "asc" }, include: { authorEmployee: { select: { id: true, firstName: true, lastName: true, designation: true } } } });
  }

  async addComment(principal: Principal, taskId: string, dto: CreateCommentDto, request: RequestMetadata) {
    const task = await this.prisma.projectTask.findUnique({ where: { id: taskId }, include: taskInclude });
    if (!task) throw new NotFoundException("Task not found");
    if (!(await this.canReadTask(principal, task))) throw new ForbiddenException("Task access denied");
    const comment = await this.prisma.taskComment.create({ data: { taskId, authorUserId: principal.userId, authorEmployeeId: principal.employeeId, body: dto.body.trim() }, include: { authorEmployee: { select: { id: true, firstName: true, lastName: true, designation: true } } } });
    await this.auditService.record({ action: "TASK_COMMENT_CREATED", actorUserId: principal.userId, entityType: "TaskComment", entityId: comment.id, metadata: { taskId }, request });
    return comment;
  }

  private async listWhere(where: Prisma.ProjectTaskWhereInput, query: TaskQueryDto) {
    const [total, tasks] = await this.prisma.$transaction([
      this.prisma.projectTask.count({ where }),
      this.prisma.projectTask.findMany({ where, include: taskInclude, orderBy: [{ dueDate: "asc" }, { priority: "desc" }], skip: (query.page - 1) * query.limit, take: query.limit }),
    ]);
    return { data: tasks.map((task) => this.toResponse(task)), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  private async canReadTask(principal: Principal, task: TaskWithRelations) {
    const membership = principal.employeeId ? await this.prisma.projectMember.findUnique({ where: { projectId_employeeId: { projectId: task.projectId, employeeId: principal.employeeId } }, select: { removedAt: true } }) : null;
    return this.policy.canAccessTask(principal, { divisionId: task.project.divisionId, projectManagerId: task.project.projectManagerId, assigneeId: task.assigneeId, memberEmployeeIds: membership && !membership.removedAt && principal.employeeId ? [principal.employeeId] : [] });
  }

  private async projectScope(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true, organizationId: true, divisionId: true, projectManagerId: true, startDate: true, dueDate: true } });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  private queryFilters(query: TaskQueryDto): Prisma.ProjectTaskWhereInput {
    const { start, tomorrow } = businessDayBoundaries(new Date(), this.configService.get<string>("businessTimeZone"));
    const base: Prisma.ProjectTaskWhereInput = { status: query.status, priority: query.priority, projectId: query.projectId };
    if (query.due === DueFilter.TODAY) return { ...base, dueDate: { gte: start, lt: tomorrow } };
    if (query.due === DueFilter.OVERDUE) return { ...base, dueDate: { lt: start }, status: query.status ?? { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } };
    if (query.due === DueFilter.UPCOMING) return { ...base, dueDate: { gte: tomorrow }, status: query.status ?? { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } };
    return base;
  }

  private taskWhere(where: Prisma.ProjectTaskWhereInput) { return where; }

  private toResponse(task: TaskWithRelations) {
    return { id: task.id, title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate, completedAt: task.completedAt, project: { id: task.project.id, code: task.project.code, name: task.project.name }, assignee: task.assignee ? { id: task.assignee.id, name: `${task.assignee.firstName} ${task.assignee.lastName}`.trim(), designation: task.assignee.designation } : null, createdBy: task.createdByEmployee ? { id: task.createdByEmployee.id, name: `${task.createdByEmployee.firstName} ${task.createdByEmployee.lastName}`.trim(), designation: task.createdByEmployee.designation } : null, commentsCount: task._count.comments };
  }

  private validateDueDate(due?: string, start?: Date | null, projectDue?: Date | null) {
    if (!due) return;
    const date = new Date(due);
    if (Number.isNaN(date.getTime()) || (start && date < start) || (projectDue && date > projectDue)) throw new ForbiddenException("Task due date is outside the project date range");
  }
}
