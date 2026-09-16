import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LeaveStatus, NotificationType, Prisma } from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  LeaveApplicationDto,
  LeaveQueryDto,
  LeaveReviewDto,
  LeaveTypeDto,
  BalanceAdjustmentDto,
} from "./dto/leave.dto";

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}
  private org(p: Principal) {
    if (!p.organizationId) throw new ForbiddenException("Organization context unavailable");
    return p.organizationId;
  }
  private date(s: string) {
    const d = new Date(`${s}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) throw new BadRequestException("Invalid date");
    return d;
  }
  private employee(p: Principal) {
    if (!p.employeeId) throw new ForbiddenException("Employee profile unavailable");
    return p.employeeId;
  }
  private management(p: Principal) {
    return p.roles.some((r) =>
      [
        "SUPER_ADMIN",
        "FOUNDER_CEO",
        "DIRECTOR",
        "HR_MANAGER",
        "HR_EXECUTIVE",
        "DIVISION_HEAD",
      ].includes(r),
    );
  }
  private reviewer(p: Principal) {
    if (
      !p.permissions.includes("leave.review") ||
      !p.roles.some((r) =>
        ["SUPER_ADMIN", "FOUNDER_CEO", "HR_MANAGER", "DIVISION_HEAD"].includes(r),
      )
    )
      throw new ForbiddenException("Leave review denied");
  }
  private async dayCount(
    start: Date,
    end: Date,
    organizationId: string,
    divisionId?: string | null,
    branchId?: string | null,
  ) {
    if (end < start) throw new BadRequestException("End date must be on or after start date");
    const holidays = await this.prisma.holiday.findMany({
      where: { organizationId, date: { gte: start, lte: end } },
      select: { date: true, divisionId: true, branchId: true },
    });
    const holidaySet = new Set(
      holidays
        .filter(
          (h) =>
            (!h.divisionId || h.divisionId === divisionId) &&
            (!h.branchId || h.branchId === branchId),
        )
        .map((h) => h.date.toISOString().slice(0, 10)),
    );
    let count = 0;
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1))
      if (!holidaySet.has(cursor.toISOString().slice(0, 10))) count++;
    return count;
  }
  async types(p: Principal) {
    const rows = await this.prisma.leaveType.findMany({
      where: {
        organizationId: this.org(p),
        ...(this.management(p) ? {} : { isActive: true }),
      },
      orderBy: { name: "asc" },
    });
    return rows;
  }
  async createType(p: Principal, dto: LeaveTypeDto) {
    if (
      !p.permissions.includes("leave.manage_types") ||
      !p.roles.some((r) => ["SUPER_ADMIN", "FOUNDER_CEO", "HR_MANAGER"].includes(r))
    )
      throw new ForbiddenException("Leave type management denied");
    if (!dto.code?.trim() || !dto.name?.trim())
      throw new BadRequestException("Leave type code and name are required");
    const row = await this.prisma.leaveType.create({
      data: {
        organizationId: this.org(p),
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        description: dto.description?.trim(),
        unit: dto.unit ?? "FULL_DAY",
        annualAllowance: dto.annualAllowance,
        balanceTracked: dto.balanceTracked ?? Boolean(dto.annualAllowance),
        carryForwardAllowed: dto.carryForwardAllowed ?? false,
        maxCarryForward: dto.maxCarryForward,
        requiresApproval: dto.requiresApproval ?? true,
        isPaid: dto.isPaid ?? true,
        isActive: dto.isActive ?? true,
      },
    });
    await this.audit.record({
      action: "LEAVE_TYPE_CREATED",
      actorUserId: p.userId,
      entityType: "LeaveType",
      entityId: row.id,
    });
    return row;
  }
  async updateType(p: Principal, id: string, dto: LeaveTypeDto) {
    if (!p.permissions.includes("leave.manage_types"))
      throw new ForbiddenException("Leave type management denied");
    const existing = await this.prisma.leaveType.findFirst({
      where: { id, organizationId: this.org(p) },
    });
    if (!existing) throw new NotFoundException("Leave type not found");
    const row = await this.prisma.leaveType.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code.trim().toUpperCase() } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.annualAllowance !== undefined ? { annualAllowance: dto.annualAllowance } : {}),
        ...(dto.balanceTracked !== undefined ? { balanceTracked: dto.balanceTracked } : {}),
        ...(dto.carryForwardAllowed !== undefined
          ? { carryForwardAllowed: dto.carryForwardAllowed }
          : {}),
        ...(dto.maxCarryForward !== undefined ? { maxCarryForward: dto.maxCarryForward } : {}),
        ...(dto.requiresApproval !== undefined ? { requiresApproval: dto.requiresApproval } : {}),
        ...(dto.isPaid !== undefined ? { isPaid: dto.isPaid } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    await this.audit.record({
      action: "LEAVE_TYPE_UPDATED",
      actorUserId: p.userId,
      entityType: "LeaveType",
      entityId: id,
    });
    return row;
  }
  async myBalances(p: Principal, year = new Date().getUTCFullYear()) {
    const employeeId = this.employee(p);
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { leaveType: true },
      orderBy: { leaveType: { name: "asc" } },
    });
  }
  async balances(p: Principal, year = new Date().getUTCFullYear()) {
    if (!this.management(p)) throw new ForbiddenException("Leave balance access denied");
    const where: Prisma.LeaveBalanceWhereInput = {
      year,
      employee: {
        division: { organizationId: this.org(p) },
        ...(p.roles.includes("DIVISION_HEAD") && p.divisionId ? { divisionId: p.divisionId } : {}),
      },
    };
    return this.prisma.leaveBalance.findMany({
      where,
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            division: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }
  async adjustBalance(p: Principal, id: string, dto: BalanceAdjustmentDto) {
    if (!p.permissions.includes("leave.manage_balances"))
      throw new ForbiddenException("Balance management denied");
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { id },
    });
    if (!balance) throw new NotFoundException("Leave balance not found");
    const row = await this.prisma.leaveBalance.update({
      where: { id },
      data: { adjusted: { increment: dto.amount } },
    });
    await this.audit.record({
      action: "LEAVE_BALANCE_ADJUSTED",
      actorUserId: p.userId,
      entityType: "LeaveBalance",
      entityId: id,
      metadata: { amount: dto.amount, reason: dto.reason },
    });
    return row;
  }
  async myApplications(p: Principal, q: LeaveQueryDto) {
    return this.list(p, { ...q, employeeId: this.employee(p) });
  }
  async list(p: Principal, q: LeaveQueryDto) {
    if (!this.management(p) && q.employeeId !== p.employeeId)
      throw new ForbiddenException("Leave application access denied");
    const where: Prisma.LeaveApplicationWhereInput = {
      employee: {
        division: { organizationId: this.org(p) },
        ...(q.employeeId ? { id: q.employeeId } : {}),
        ...(p.roles.includes("DIVISION_HEAD") && p.divisionId ? { divisionId: p.divisionId } : {}),
      },
      ...(q.status ? { status: q.status } : {}),
      ...(q.leaveTypeId ? { leaveTypeId: q.leaveTypeId } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.leaveApplication.count({ where }),
      this.prisma.leaveApplication.findMany({
        where,
        include: {
          leaveType: true,
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              division: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);
    return {
      data,
      meta: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  }
  async apply(p: Principal, dto: LeaveApplicationDto) {
    const employeeId = this.employee(p);
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { divisionId: true, branchId: true, userId: true },
    });
    if (!employee) throw new NotFoundException("Employee not found");
    const leaveType = await this.prisma.leaveType.findFirst({
      where: {
        id: dto.leaveTypeId,
        organizationId: this.org(p),
        isActive: true,
      },
    });
    if (!leaveType) throw new NotFoundException("Leave type not found");
    const start = this.date(dto.startDate);
    const end = this.date(dto.endDate);
    const dayCount =
      (await this.dayCount(start, end, this.org(p), employee.divisionId, employee.branchId)) *
      (leaveType.unit === "HALF_DAY" ? 0.5 : 1);
    if (!dto.reason.trim()) throw new BadRequestException("Reason is required");
    const overlap = await this.prisma.leaveApplication.findFirst({
      where: {
        employeeId,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    if (overlap) throw new ConflictException("Leave dates overlap an existing application");
    const year = start.getUTCFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: leaveType.id,
          year,
        },
      },
    });
    if (leaveType.balanceTracked && !balance)
      throw new BadRequestException("Leave balance is not initialized");
    if (
      balance &&
      balance.openingBalance +
        balance.accrued +
        balance.adjusted +
        balance.carriedForward -
        balance.used <
        dayCount
    )
      throw new BadRequestException("Insufficient leave balance");
    const reviewerUsers = await this.reviewerUserIds(p);
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.leaveApplication.create({
        data: {
          employeeId,
          leaveTypeId: leaveType.id,
          startDate: start,
          endDate: end,
          dayCount,
          reason: dto.reason.trim(),
        },
      });
      await tx.auditLog.create({
        data: {
          action: "LEAVE_APPLICATION_CREATED",
          actorUserId: p.userId,
          entityType: "LeaveApplication",
          entityId: created.id,
          metadata: { dayCount },
        },
      });
      for (const userId of reviewerUsers)
        await tx.notification.create({
          data: {
            userId,
            type: NotificationType.LEAVE_APPLICATION_SUBMITTED,
            title: "New leave request",
            body: `A ${leaveType.name} request is ready for review.`,
            resourceType: "LeaveApplication",
            resourceId: created.id,
          },
        });
      return created;
    });
    return row;
  }
  async cancel(p: Principal, id: string) {
    const employeeId = this.employee(p);
    const app = await this.prisma.leaveApplication.findFirst({
      where: { id, employeeId },
      include: { leaveType: true },
    });
    if (!app) throw new NotFoundException("Leave application not found");
    if (app.status !== LeaveStatus.PENDING && app.status !== LeaveStatus.APPROVED)
      throw new ConflictException("This leave cannot be cancelled");
    if (app.status === LeaveStatus.APPROVED && app.startDate <= new Date())
      throw new ConflictException("Completed or active leave cannot be cancelled");
    const row = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.leaveApplication.updateMany({
        where: { id, status: app.status },
        data: { status: LeaveStatus.CANCELLED, cancelledAt: new Date() },
      });
      if (!claimed.count)
        throw new ConflictException("Leave application has already been finalized");
      if (app.status === LeaveStatus.APPROVED && app.leaveType.balanceTracked)
        await tx.leaveBalance.updateMany({
          where: {
            employeeId,
            leaveTypeId: app.leaveTypeId,
            year: app.startDate.getUTCFullYear(),
          },
          data: { used: { decrement: app.dayCount } },
        });
      await tx.auditLog.create({
        data: {
          action: "LEAVE_APPLICATION_CANCELLED",
          actorUserId: p.userId,
          entityType: "LeaveApplication",
          entityId: id,
        },
      });
      await tx.notification.create({
        data: {
          userId: p.userId,
          type: NotificationType.LEAVE_CANCELLED,
          title: "Leave request cancelled",
          body: "Your leave request was cancelled.",
          resourceType: "LeaveApplication",
          resourceId: id,
        },
      });
      return tx.leaveApplication.findUniqueOrThrow({ where: { id } });
    });
    return row;
  }
  async review(p: Principal, id: string, status: "APPROVED" | "REJECTED", dto: LeaveReviewDto) {
    this.reviewer(p);
    if (status === "REJECTED" && !dto.comment?.trim())
      throw new BadRequestException("A rejection comment is required");
    const app = await this.prisma.leaveApplication.findFirst({
      where: {
        id,
        employee: {
          division: { organizationId: this.org(p) },
          ...(p.roles.includes("DIVISION_HEAD") && p.divisionId
            ? { divisionId: p.divisionId }
            : {}),
        },
      },
      include: {
        leaveType: true,
        employee: { select: { id: true, userId: true } },
      },
    });
    if (!app) throw new NotFoundException("Leave application not found");
    if (app.status !== LeaveStatus.PENDING)
      throw new ConflictException("Leave application has already been reviewed");
    const type =
      status === "APPROVED" ? NotificationType.LEAVE_APPROVED : NotificationType.LEAVE_REJECTED;
    const row = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.leaveApplication.updateMany({
        where: { id, status: LeaveStatus.PENDING },
        data: {
          status,
          reviewComment: dto.comment?.trim(),
          reviewedByUserId: p.userId,
          reviewedAt: new Date(),
          reviewerEmployeeId: p.employeeId,
        },
      });
      if (!claimed.count)
        throw new ConflictException("Leave application has already been reviewed");
      if (status === "APPROVED" && app.leaveType.balanceTracked) {
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: app.employee.id,
              leaveTypeId: app.leaveTypeId,
              year: app.startDate.getUTCFullYear(),
            },
          },
        });
        if (!balance) throw new BadRequestException("Leave balance is not initialized");
        if (
          balance.openingBalance +
            balance.accrued +
            balance.adjusted +
            balance.carriedForward -
            balance.used <
          app.dayCount
        )
          throw new BadRequestException("Insufficient leave balance");
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { used: { increment: app.dayCount } },
        });
      }
      await tx.auditLog.create({
        data: {
          action: `LEAVE_APPLICATION_${status}`,
          actorUserId: p.userId,
          entityType: "LeaveApplication",
          entityId: id,
        },
      });
      await tx.notification.create({
        data: {
          userId: app.employee.userId,
          type,
          title: status === "APPROVED" ? "Leave approved" : "Leave request declined",
          body:
            dto.comment?.trim() ||
            `Your ${app.leaveType.name} request was ${status.toLowerCase()}.`,
          resourceType: "LeaveApplication",
          resourceId: id,
        },
      });
      return tx.leaveApplication.findUniqueOrThrow({ where: { id } });
    });
    return row;
  }
  private async reviewerUserIds(p: Principal) {
    const users = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: {
                in: ["FOUNDER_CEO", "SUPER_ADMIN", "HR_MANAGER", "DIVISION_HEAD"],
              },
            },
          },
        },
        status: "ACTIVE",
        OR: [
          {
            roles: {
              some: { role: { name: { in: ["FOUNDER_CEO", "SUPER_ADMIN", "HR_MANAGER"] } } },
            },
          },
          {
            roles: { some: { role: { name: "DIVISION_HEAD" } } },
            ...(p.divisionId ? { employee: { divisionId: p.divisionId } } : {}),
          },
        ],
      },
      select: { id: true },
    });
    return users.filter((user) => user.id !== p.userId).map((user) => user.id);
  }
}
