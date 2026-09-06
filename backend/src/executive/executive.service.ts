import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { EmploymentStatus, Prisma, ProjectStatus, TaskStatus } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { businessDayBoundaries } from "../common/time/business-time";
import { PrismaService } from "../prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { CreateTaskDto } from "../tasks/dto/create-task.dto";
import { UpdateTaskDto } from "../tasks/dto/update-task.dto";
import { ExecutiveEmployeeQueryDto } from "./dto/executive-employee-query.dto";
import { CreateExecutiveTaskDto } from "./dto/create-executive-task.dto";
import { UpdateExecutiveTaskDto } from "./dto/update-executive-task.dto";

const safeTaskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  completedAt: true,
  project: { select: { id: true, code: true, name: true } },
  assignee: { select: { id: true, firstName: true, lastName: true, designation: true } },
  createdByEmployee: { select: { id: true, firstName: true, lastName: true, designation: true } },
} satisfies Prisma.ProjectTaskSelect;

type SafeTask = Prisma.ProjectTaskGetPayload<{ select: typeof safeTaskSelect }>;

@Injectable()
export class ExecutiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: TasksService,
  ) {}

  async summary(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const { start } = businessDayBoundaries(new Date(), "Asia/Kolkata");
    const taskScope = { project: { organizationId } } satisfies Prisma.ProjectTaskWhereInput;
    const [employeesTotal, employeesActive, activeTasks, completedTasks, overdueTasks, activeProjects] = await Promise.all([
      this.prisma.employee.count({ where: { division: { organizationId } } }),
      this.prisma.employee.count({ where: { division: { organizationId }, employmentStatus: EmploymentStatus.ACTIVE } }),
      this.prisma.projectTask.count({ where: { ...taskScope, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } } }),
      this.prisma.projectTask.count({ where: { ...taskScope, status: TaskStatus.COMPLETED } }),
      this.prisma.projectTask.count({ where: { ...taskScope, dueDate: { lt: start }, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } } }),
      this.prisma.project.count({ where: { organizationId, status: { notIn: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] } } }),
    ]);
    return { employeesTotal, employeesActive, activeTasks, completedTasks, overdueTasks, activeProjects };
  }

  async employees(principal: Principal, query: ExecutiveEmployeeQueryDto) {
    const organizationId = this.organizationId(principal);
    const search = query.search?.trim();
    const where: Prisma.EmployeeWhereInput = {
      division: { organizationId },
      divisionId: query.divisionId,
      departmentId: query.departmentId,
      employmentStatus: query.status,
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { employeeCode: { contains: search, mode: "insensitive" } },
          { designation: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true, employeeCode: true, firstName: true, lastName: true, designation: true, employmentStatus: true,
          division: { select: { id: true, name: true, slug: true } },
          department: { select: { id: true, name: true } },
        },
      }),
    ]);
    const employeeIds = rows.map((row) => row.id);
    const { start } = businessDayBoundaries(new Date(), "Asia/Kolkata");
    const counts = employeeIds.length ? await Promise.all([
      this.prisma.projectTask.groupBy({ by: ["assigneeId", "status"], where: { assigneeId: { in: employeeIds }, project: { organizationId } }, _count: { _all: true } }),
      this.prisma.projectTask.groupBy({ by: ["assigneeId"], where: { assigneeId: { in: employeeIds }, project: { organizationId }, dueDate: { lt: start }, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } }, _count: { _all: true } }),
    ]) : [[], []];
    const statusCounts = new Map<string, Record<string, number>>();
    for (const row of counts[0] as Array<{ assigneeId: string | null; status: TaskStatus; _count: { _all: number } }>) {
      if (!row.assigneeId) continue;
      const item = statusCounts.get(row.assigneeId) ?? {};
      item[row.status] = row._count._all;
      statusCounts.set(row.assigneeId, item);
    }
    const overdueCounts = new Map<string, number>();
    for (const row of counts[1] as Array<{ assigneeId: string | null; _count: { _all: number } }>) {
      if (row.assigneeId) overdueCounts.set(row.assigneeId, row._count._all);
    }
    return {
      data: rows.map((employee) => {
        const item = statusCounts.get(employee.id) ?? {};
        const completed = item[TaskStatus.COMPLETED] ?? 0;
        const cancelled = item[TaskStatus.CANCELLED] ?? 0;
        const totalTasks = Object.values(item).reduce((sum, value) => sum + value, 0);
        return {
          id: employee.id,
          employeeCode: employee.employeeCode,
          name: `${employee.firstName} ${employee.lastName}`.trim(),
          designation: employee.designation,
          status: employee.employmentStatus,
          division: employee.division,
          department: employee.department,
          workSummary: { active: totalTasks - completed - cancelled, completed, overdue: overdueCounts.get(employee.id) ?? 0, total: totalTasks },
        };
      }),
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async employeeWork(principal: Principal, employeeId: string) {
    const organizationId = this.organizationId(principal);
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, division: { organizationId } },
      select: {
        id: true, employeeCode: true, firstName: true, lastName: true, designation: true, employmentStatus: true,
        division: { select: { id: true, name: true, slug: true } },
        department: { select: { id: true, name: true } },
      },
    });
    if (!employee) throw new NotFoundException("Employee not found");
    const taskScope: Prisma.ProjectTaskWhereInput = { assigneeId: employeeId, project: { organizationId } };
    const { start } = businessDayBoundaries(new Date(), "Asia/Kolkata");
    const [activeTasks, completedTasks, total, overdue, projects] = await Promise.all([
      this.prisma.projectTask.findMany({ where: { ...taskScope, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } }, select: safeTaskSelect, orderBy: [{ dueDate: "asc" }, { priority: "desc" }], take: 100 }),
      this.prisma.projectTask.findMany({ where: { ...taskScope, status: TaskStatus.COMPLETED }, select: safeTaskSelect, orderBy: { completedAt: "desc" }, take: 100 }),
      this.prisma.projectTask.count({ where: taskScope }),
      this.prisma.projectTask.count({ where: { ...taskScope, dueDate: { lt: start }, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } } }),
      this.prisma.project.findMany({ where: { organizationId, OR: [{ projectManagerId: employeeId }, { members: { some: { employeeId, removedAt: null } } }, { tasks: { some: { assigneeId: employeeId } } }] }, select: { id: true, code: true, name: true }, orderBy: { updatedAt: "desc" }, take: 100 }),
    ]);
    return {
      employee: { ...employee, name: `${employee.firstName} ${employee.lastName}`.trim() },
      taskSummary: { total, active: activeTasks.length, completed: completedTasks.length, overdue },
      activeTasks: activeTasks.map((task) => this.taskResponse(task)),
      completedTasks: completedTasks.map((task) => this.taskResponse(task)),
      projects,
    };
  }

  async projects(principal: Principal) {
    const organizationId = this.organizationId(principal);
    return this.prisma.project.findMany({
      where: { organizationId, status: { not: ProjectStatus.CANCELLED } },
      select: { id: true, code: true, name: true, status: true, division: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take: 200,
    });
  }

  async createTask(principal: Principal, employeeId: string, dto: CreateExecutiveTaskDto, request: RequestMetadata) {
    const task = await this.tasks.createForExecutive(principal, employeeId, dto.projectId, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate: dto.dueDate,
    } satisfies CreateTaskDto, request);
    return task;
  }

  async updateTask(principal: Principal, taskId: string, dto: UpdateExecutiveTaskDto, request: RequestMetadata) {
    return this.tasks.updateForExecutive(principal, taskId, dto satisfies UpdateTaskDto, request);
  }

  async cancelTask(principal: Principal, taskId: string, request: RequestMetadata) {
    return this.tasks.updateForExecutive(principal, taskId, { status: TaskStatus.CANCELLED }, request);
  }

  private organizationId(principal: Principal) {
    if (!principal.organizationId) throw new ForbiddenException("Organization context required");
    return principal.organizationId;
  }

  private taskResponse(task: SafeTask) {
    return {
      id: task.id, title: task.title, description: task.description, status: task.status, priority: task.priority,
      dueDate: task.dueDate, completedAt: task.completedAt,
      project: task.project,
      assignee: task.assignee ? { id: task.assignee.id, name: `${task.assignee.firstName} ${task.assignee.lastName}`.trim(), designation: task.assignee.designation } : null,
      createdBy: task.createdByEmployee ? { id: task.createdByEmployee.id, name: `${task.createdByEmployee.firstName} ${task.createdByEmployee.lastName}`.trim(), designation: task.createdByEmployee.designation } : null,
    };
  }
}
