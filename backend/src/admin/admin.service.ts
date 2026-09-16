import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TaskStatus, UserStatus } from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { businessDayBoundaries } from "../common/time/business-time";
import { PrismaService } from "../prisma/prisma.service";
import { ADMINISTRATIVE_ROLE_NAMES, OFFICIAL_ROLE_NAMES, roleCatalogueEntry } from "./role-catalog";
import { AdminUserQueryDto } from "./dto/admin.dto";

const taskSelect = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  completedAt: true,
  project: { select: { id: true, code: true, name: true, status: true } },
} satisfies Prisma.ProjectTaskSelect;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async users(principal: Principal, query: AdminUserQueryDto) {
    const organizationId = this.organizationId(principal);
    const search = query.search?.trim();
    const where: Prisma.UserWhereInput = {
      status: query.accountStatus,
      roles: query.role ? { some: { role: { name: query.role } } } : undefined,
      employee: {
        is: {
          division: { organizationId },
          divisionId: query.division,
          departmentId: query.department,
          employmentStatus: query.employmentStatus,
          ...(search
            ? {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { employeeCode: { contains: search, mode: "insensitive" } },
                  {
                    user: { email: { contains: search, mode: "insensitive" } },
                  },
                ],
              }
            : {}),
        },
      },
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: [{ employee: { lastName: "asc" } }, { employee: { firstName: "asc" } }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: this.userListSelect(),
      }),
    ]);
    return {
      data: rows.map((row) => this.safeUser(row)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async user(principal: Principal, id: string) {
    const organizationId = this.organizationId(principal);
    const user = await this.prisma.user.findFirst({
      where: { id, employee: { is: { division: { organizationId } } } },
      select: {
        ...this.userListSelect(),
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            phone: true,
            designation: true,
            employmentType: true,
            employmentStatus: true,
            joiningDate: true,
            division: { select: { id: true, name: true, slug: true } },
            department: { select: { id: true, name: true } },
            branch: { select: { id: true, code: true, name: true } },
            manager: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                designation: true,
              },
            },
            directReports: {
              where: { employmentStatus: { notIn: ["EXITED", "TERMINATED"] } },
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                designation: true,
              },
            },
            teamMemberships: {
              where: { removedAt: null },
              select: {
                role: true,
                team: { select: { id: true, code: true, name: true } },
              },
            },
            employmentHistory: {
              orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
              take: 25,
              select: {
                id: true,
                eventType: true,
                effectiveDate: true,
                summary: true,
              },
            },
          },
        },
      },
    });
    if (!user?.employee) throw new NotFoundException("User not found");
    const employeeId = user.employee.id;
    const { start } = businessDayBoundaries(new Date(), "Asia/Kolkata");
    const todayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const today = new Date(`${todayKey}T00:00:00.000Z`);
    const taskScope = {
      assigneeId: employeeId,
      project: { organizationId },
    } satisfies Prisma.ProjectTaskWhereInput;
    const [
      activeTasks,
      completedTasks,
      cancelledTasks,
      overdueCount,
      projects,
      todayAttendance,
      recentAttendance,
      recentLeave,
      pendingLeave,
      activeSessions,
    ] = await Promise.all([
      this.prisma.projectTask.findMany({
        where: {
          ...taskScope,
          status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
        },
        select: taskSelect,
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
        take: 100,
      }),
      this.prisma.projectTask.findMany({
        where: { ...taskScope, status: TaskStatus.COMPLETED },
        select: taskSelect,
        orderBy: { completedAt: "desc" },
        take: 100,
      }),
      this.prisma.projectTask.findMany({
        where: { ...taskScope, status: TaskStatus.CANCELLED },
        select: taskSelect,
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
      this.prisma.projectTask.count({
        where: {
          ...taskScope,
          dueDate: { lt: start },
          status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
        },
      }),
      this.prisma.project.findMany({
        where: {
          organizationId,
          OR: [
            { projectManagerId: employeeId },
            { members: { some: { employeeId, removedAt: null } } },
            { tasks: { some: { assigneeId: employeeId } } },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          priority: true,
          dueDate: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
      this.prisma.attendanceRecord.findFirst({
        where: { employeeId, businessDate: today },
        select: {
          id: true,
          businessDate: true,
          checkInAt: true,
          checkOutAt: true,
          status: true,
          source: true,
        },
      }),
      this.prisma.attendanceRecord.findMany({
        where: { employeeId },
        orderBy: { businessDate: "desc" },
        take: 7,
        select: {
          id: true,
          businessDate: true,
          checkInAt: true,
          checkOutAt: true,
          status: true,
          source: true,
        },
      }),
      this.prisma.leaveApplication.findMany({
        where: { employeeId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          startDate: true,
          endDate: true,
          dayCount: true,
          reason: true,
          status: true,
          createdAt: true,
          leaveType: { select: { id: true, code: true, name: true } },
        },
      }),
      this.prisma.leaveApplication.count({
        where: { employeeId, status: "PENDING" },
      }),
      this.prisma.refreshSession.count({
        where: { userId: id, revokedAt: null, expiresAt: { gt: new Date() } },
      }),
    ]);
    return {
      ...this.safeUser(user),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activeSessions,
      employee: {
        ...user.employee,
        name: `${user.employee.firstName} ${user.employee.lastName}`.trim(),
        manager: user.employee.manager
          ? {
              ...user.employee.manager,
              name: `${user.employee.manager.firstName} ${user.employee.manager.lastName}`.trim(),
            }
          : null,
        directReports: user.employee.directReports.map((employee) => ({
          ...employee,
          name: `${employee.firstName} ${employee.lastName}`.trim(),
        })),
        teams: user.employee.teamMemberships.map((membership) => ({
          ...membership.team,
          role: membership.role,
        })),
        employmentHistory: user.employee.employmentHistory,
      },
      work: {
        summary: {
          active: activeTasks.length,
          completed: completedTasks.length,
          overdue: overdueCount,
          cancelled: cancelledTasks.length,
          projects: projects.length,
        },
        activeTasks,
        completedTasks,
        cancelledTasks,
        projects,
      },
      attendance: { today: todayAttendance, recent: recentAttendance },
      leave: { pending: pendingLeave, recent: recentLeave },
    };
  }

  async roles(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const roles = await this.prisma.role.findMany({
      where: { name: { in: [...OFFICIAL_ROLE_NAMES] } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          select: {
            permission: { select: { id: true, key: true, description: true } },
          },
        },
      },
    });
    const assignments = await this.prisma.userRole.findMany({
      where: {
        user: { employee: { is: { division: { organizationId } } } },
        role: { name: { in: [...OFFICIAL_ROLE_NAMES] } },
      },
      select: { roleId: true },
    });
    const counts = new Map<string, number>();
    for (const assignment of assignments)
      counts.set(assignment.roleId, (counts.get(assignment.roleId) ?? 0) + 1);
    return roles.map((role) => {
      const catalogue = roleCatalogueEntry(role.name);
      return {
        id: role.id,
        name: role.name,
        displayName: catalogue?.displayName ?? role.name.replaceAll("_", " "),
        description: role.description ?? catalogue?.description ?? null,
        capabilityState: catalogue?.capabilityState ?? "RESERVED_FUTURE",
        assignedUserCount: counts.get(role.id) ?? 0,
        permissions: role.permissions
          .map(({ permission }) => permission)
          .sort((a, b) => a.key.localeCompare(b.key)),
      };
    });
  }

  async permissions(principal: Principal) {
    this.organizationId(principal);
    const permissions = await this.prisma.permission.findMany({
      orderBy: { key: "asc" },
      select: {
        id: true,
        key: true,
        description: true,
        roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });
    return permissions.map((permission) => ({
      id: permission.id,
      key: permission.key,
      description: permission.description,
      category: permission.key.split(".")[0],
      roles: permission.roles
        .map(({ role }) => role)
        .filter((role) =>
          OFFICIAL_ROLE_NAMES.includes(role.name as (typeof OFFICIAL_ROLE_NAMES)[number]),
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }

  async assignRole(principal: Principal, userId: string, roleId: string, request: RequestMetadata) {
    const target = await this.target(principal, userId);
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, name: { in: [...OFFICIAL_ROLE_NAMES] } },
      select: { id: true, name: true },
    });
    if (!role) throw new NotFoundException("Role not found");
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing) return { userId, role, assignedAt: existing.assignedAt, created: false };
    const assignment = await this.prisma.$transaction(async (tx) => {
      const row = await tx.userRole.create({ data: { userId, roleId } });
      await tx.auditLog.create({
        data: {
          action: "USER_ROLE_ASSIGNED",
          actorUserId: principal.userId,
          entityType: "User",
          entityId: userId,
          metadata: { targetUserId: target.id, roleId, roleName: role.name },
          ipAddress: request.ipAddress,
          userAgent: request.userAgent?.slice(0, 512),
        },
      });
      return row;
    });
    return { userId, role, assignedAt: assignment.assignedAt, created: true };
  }

  async removeRole(principal: Principal, userId: string, roleId: string, request: RequestMetadata) {
    const target = await this.target(principal, userId);
    const assignment = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
      include: { role: { select: { id: true, name: true } } },
    });
    if (
      !assignment ||
      !OFFICIAL_ROLE_NAMES.includes(assignment.role.name as (typeof OFFICIAL_ROLE_NAMES)[number])
    )
      throw new NotFoundException("Role assignment not found");
    if (
      userId === principal.userId &&
      ADMINISTRATIVE_ROLE_NAMES.includes(
        assignment.role.name as (typeof ADMINISTRATIVE_ROLE_NAMES)[number],
      )
    ) {
      const remainingAdministrativeRoles = await this.prisma.userRole.count({
        where: {
          userId,
          role: {
            name: {
              in: [...ADMINISTRATIVE_ROLE_NAMES],
              not: assignment.role.name,
            },
          },
        },
      });
      if (remainingAdministrativeRoles === 0)
        throw new ConflictException("You cannot remove your own final administrative role");
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.delete({
        where: { userId_roleId: { userId, roleId } },
      });
      await tx.auditLog.create({
        data: {
          action: "USER_ROLE_REMOVED",
          actorUserId: principal.userId,
          entityType: "User",
          entityId: userId,
          metadata: {
            targetUserId: target.id,
            roleId,
            roleName: assignment.role.name,
          },
          ipAddress: request.ipAddress,
          userAgent: request.userAgent?.slice(0, 512),
        },
      });
    });
    return { userId, role: assignment.role, removed: true };
  }

  async activate(principal: Principal, userId: string, request: RequestMetadata) {
    const target = await this.target(principal, userId);
    if (target.status === UserStatus.ACTIVE)
      return {
        id: target.id,
        email: target.email,
        status: target.status,
        changed: false,
      };
    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE },
        select: { id: true, email: true, status: true },
      });
      await tx.auditLog.create({
        data: {
          action: "USER_ACTIVATED",
          actorUserId: principal.userId,
          entityType: "User",
          entityId: userId,
          metadata: {
            previousStatus: target.status,
            nextStatus: UserStatus.ACTIVE,
          },
          ipAddress: request.ipAddress,
          userAgent: request.userAgent?.slice(0, 512),
        },
      });
      return updated;
    });
    return { ...user, changed: true };
  }

  async deactivate(principal: Principal, userId: string, request: RequestMetadata) {
    const target = await this.target(principal, userId);
    if (userId === principal.userId)
      throw new ConflictException("You cannot deactivate your own account");
    if (target.roles.some(({ role }) => role.name === "SUPER_ADMIN")) {
      const activeSuperAdmins = await this.prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          roles: { some: { role: { name: "SUPER_ADMIN" } } },
          employee: {
            is: {
              division: { organizationId: this.organizationId(principal) },
            },
          },
        },
      });
      if (activeSuperAdmins <= 1)
        throw new ConflictException("The only active Super Admin cannot be deactivated");
    }
    if (target.status === UserStatus.DISABLED)
      return {
        id: target.id,
        email: target.email,
        status: target.status,
        changed: false,
      };
    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.DISABLED },
        select: { id: true, email: true, status: true },
      });
      await tx.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          action: "USER_DEACTIVATED",
          actorUserId: principal.userId,
          entityType: "User",
          entityId: userId,
          metadata: {
            previousStatus: target.status,
            nextStatus: UserStatus.DISABLED,
            sessionsRevoked: true,
          },
          ipAddress: request.ipAddress,
          userAgent: request.userAgent?.slice(0, 512),
        },
      });
      return updated;
    });
    return { ...user, changed: true };
  }

  private async target(principal: Principal, userId: string) {
    const target = await this.prisma.user.findFirst({
      where: {
        id: userId,
        employee: {
          is: { division: { organizationId: this.organizationId(principal) } },
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
        roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });
    if (!target) throw new NotFoundException("User not found");
    return target;
  }

  private userListSelect() {
    return {
      id: true,
      email: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      roles: {
        orderBy: { assignedAt: "asc" as const },
        select: {
          assignedAt: true,
          role: { select: { id: true, name: true, description: true } },
        },
      },
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          designation: true,
          employmentStatus: true,
          employmentType: true,
          joiningDate: true,
          division: { select: { id: true, name: true, slug: true } },
          department: { select: { id: true, name: true } },
          branch: { select: { id: true, code: true, name: true } },
          manager: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    } satisfies Prisma.UserSelect;
  }

  private safeUser<
    T extends {
      id: string;
      email: string;
      status: UserStatus;
      roles: Array<{
        assignedAt: Date;
        role: { id: string; name: string; description: string | null };
      }>;
      employee: {
        firstName: string;
        lastName: string;
        manager?: { firstName: string; lastName: string } | null;
      } | null;
    },
  >(user: T) {
    return {
      ...user,
      roles: user.roles.map(({ assignedAt, role }) => ({
        ...role,
        displayName: roleCatalogueEntry(role.name)?.displayName ?? role.name.replaceAll("_", " "),
        assignedAt,
      })),
      employee: user.employee
        ? {
            ...user.employee,
            name: `${user.employee.firstName} ${user.employee.lastName}`.trim(),
            ...(user.employee.manager
              ? {
                  manager: {
                    ...user.employee.manager,
                    name: `${user.employee.manager.firstName} ${user.employee.manager.lastName}`.trim(),
                  },
                }
              : {}),
          }
        : null,
    };
  }

  private organizationId(principal: Principal) {
    if (!principal.organizationId) throw new ForbiddenException("Organization context required");
    return principal.organizationId;
  }
}
