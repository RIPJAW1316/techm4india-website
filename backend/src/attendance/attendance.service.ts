import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AttendanceStatus, Prisma } from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  AttendanceCorrectionDto,
  AttendanceRangeQueryDto,
  AttendanceSummaryQueryDto,
} from "./dto/attendance.dto";

@Injectable()
export class AttendanceService {
  private readonly timeZone: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    config: ConfigService,
  ) {
    this.timeZone = config.get<string>("businessTimeZone") ?? "Asia/Kolkata";
  }
  private org(principal: Principal) {
    if (!principal.organizationId)
      throw new ForbiddenException("Organization context unavailable");
    return principal.organizationId;
  }
  private today() {
    const now = new Date();
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: this.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    return new Date(`${key}T00:00:00.000Z`);
  }
  private date(value: string) {
    const d = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime()))
      throw new BadRequestException("Invalid date");
    return d;
  }
  private isManagement(p: Principal) {
    return (
      p.roles.some((r) =>
        [
          "SUPER_ADMIN",
          "FOUNDER_CEO",
          "DIRECTOR",
          "HR_MANAGER",
          "HR_EXECUTIVE",
          "DIVISION_HEAD",
        ].includes(r),
      ) &&
      (p.permissions.includes("attendance.read") ||
        p.permissions.includes("attendance.manage"))
    );
  }
  private scope(
    p: Principal,
    where: Prisma.EmployeeWhereInput = {},
  ): Prisma.EmployeeWhereInput {
    if (
      p.roles.some((r) =>
        [
          "SUPER_ADMIN",
          "FOUNDER_CEO",
          "DIRECTOR",
          "HR_MANAGER",
          "HR_EXECUTIVE",
        ].includes(r),
      )
    )
      return { division: { organizationId: this.org(p) }, ...where };
    if (p.roles.includes("DIVISION_HEAD") && p.divisionId)
      return {
        divisionId: p.divisionId,
        division: { organizationId: this.org(p) },
        ...where,
      };
    return {
      id: p.employeeId ?? "",
      division: { organizationId: this.org(p) },
      ...where,
    };
  }
  async meToday(p: Principal) {
    if (!p.employeeId)
      throw new NotFoundException("Employee profile not found");
    return this.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_businessDate: {
          employeeId: p.employeeId,
          businessDate: this.today(),
        },
      },
    });
  }
  async me(p: Principal, q: AttendanceRangeQueryDto) {
    if (!p.employeeId || !p.permissions.includes("attendance.self.read"))
      throw new ForbiddenException("Attendance history access denied");
    const where: Prisma.AttendanceRecordWhereInput = {
      employeeId: p.employeeId,
      ...(q.status ? { status: q.status } : {}),
      ...(q.from || q.to
        ? {
            businessDate: {
              ...(q.from ? { gte: this.date(q.from) } : {}),
              ...(q.to ? { lte: this.date(q.to) } : {}),
            },
          }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.attendanceRecord.count({ where }),
      this.prisma.attendanceRecord.findMany({
        where,
        orderBy: { businessDate: "desc" },
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
  async checkIn(p: Principal) {
    if (!p.employeeId || !p.permissions.includes("attendance.self.checkin"))
      throw new ForbiddenException("Attendance check-in is not available");
    const businessDate = this.today();
    const existing = await this.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_businessDate: { employeeId: p.employeeId, businessDate },
      },
    });
    if (existing?.checkInAt)
      throw new ConflictException("Already checked in today");
    const row = await this.prisma.attendanceRecord.upsert({
      where: {
        employeeId_businessDate: { employeeId: p.employeeId, businessDate },
      },
      update: {
        checkInAt: new Date(),
        status: AttendanceStatus.PRESENT,
        source: "WEB",
      },
      create: {
        employeeId: p.employeeId,
        businessDate,
        checkInAt: new Date(),
        status: AttendanceStatus.PRESENT,
        source: "WEB",
      },
    });
    await this.audit.record({
      action: "ATTENDANCE_CHECKED_IN",
      actorUserId: p.userId,
      entityType: "AttendanceRecord",
      entityId: row.id,
    });
    return row;
  }
  async checkOut(p: Principal) {
    if (!p.employeeId || !p.permissions.includes("attendance.self.checkin"))
      throw new ForbiddenException("Attendance check-out is not available");
    const existing = await this.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_businessDate: {
          employeeId: p.employeeId,
          businessDate: this.today(),
        },
      },
    });
    if (!existing?.checkInAt)
      throw new BadRequestException("Check in before checking out");
    if (existing.checkOutAt)
      throw new ConflictException("Already checked out today");
    const row = await this.prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: { checkOutAt: new Date(), updatedByUserId: p.userId },
    });
    await this.audit.record({
      action: "ATTENDANCE_CHECKED_OUT",
      actorUserId: p.userId,
      entityType: "AttendanceRecord",
      entityId: row.id,
    });
    return row;
  }
  async list(p: Principal, q: AttendanceRangeQueryDto) {
    if (
      !this.isManagement(p) &&
      !p.permissions.includes("attendance.self.read")
    )
      throw new ForbiddenException("Attendance access denied");
    const management = this.isManagement(p);
    if (!management && q.employeeId && q.employeeId !== p.employeeId)
      throw new ForbiddenException("Attendance access denied");
    const orgWide = p.roles.some((r) =>
      [
        "SUPER_ADMIN",
        "FOUNDER_CEO",
        "DIRECTOR",
        "HR_MANAGER",
        "HR_EXECUTIVE",
      ].includes(r),
    );
    const employeeWhere = this.scope(
      p,
      management && q.employeeId
        ? { id: q.employeeId }
        : management && orgWide && q.divisionId
          ? { divisionId: q.divisionId }
          : management && orgWide && q.departmentId
            ? { departmentId: q.departmentId }
            : {},
    );
    const where: Prisma.AttendanceRecordWhereInput = {
      employee: employeeWhere,
      ...(q.status ? { status: q.status } : {}),
      ...(q.from || q.to
        ? {
            businessDate: {
              ...(q.from ? { gte: this.date(q.from) } : {}),
              ...(q.to ? { lte: this.date(q.to) } : {}),
            },
          }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.attendanceRecord.count({ where }),
      this.prisma.attendanceRecord.findMany({
        where,
        include: {
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
        orderBy: { businessDate: "desc" },
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
  async summary(p: Principal, q: AttendanceSummaryQueryDto) {
    if (!this.isManagement(p))
      throw new ForbiddenException("Attendance summary access denied");
    const date = this.date(q.date);
    const employees = await this.prisma.employee.findMany({
      where: this.scope(p, q.divisionId ? { divisionId: q.divisionId } : {}),
      select: { id: true, divisionId: true, branchId: true },
    });
    const ids = employees.map((e) => e.id);
    const [records, approvedLeaves, holidays] = await this.prisma.$transaction([
      this.prisma.attendanceRecord.findMany({
        where: { employeeId: { in: ids }, businessDate: date },
      }),
      this.prisma.leaveApplication.findMany({
        where: {
          employeeId: { in: ids },
          status: "APPROVED",
          startDate: { lte: date },
          endDate: { gte: date },
        },
        select: { employeeId: true },
      }),
      this.prisma.holiday.findMany({
        where: {
          organizationId: this.org(p),
          date,
        },
        select: { divisionId: true, branchId: true },
      }),
    ]);
    const leaveIds = new Set(approvedLeaves.map((leave) => leave.employeeId));
    const counts = {
      employeesExpected: ids.length,
      present: 0,
      absent: 0,
      onLeave: 0,
      remote: 0,
      halfDay: 0,
      missingCheckout: 0,
      holiday: new Set(
        employees
          .filter((employee) =>
            holidays.some(
              (holiday) =>
                (!holiday.divisionId || holiday.divisionId === employee.divisionId) &&
                (!holiday.branchId || holiday.branchId === employee.branchId),
            ),
          )
          .map((employee) => employee.id),
      ).size,
    };
    for (const employee of employees) {
      if (leaveIds.has(employee.id)) {
        counts.onLeave++;
        continue;
      }
      const row = records.find((record) => record.employeeId === employee.id);
      if (!row) {
        const holidayApplies = holidays.some(
          (holiday) =>
            (!holiday.divisionId ||
              holiday.divisionId === employee.divisionId) &&
            (!holiday.branchId || holiday.branchId === employee.branchId),
        );
        if (!holidayApplies) counts.absent++;
        continue;
      }
      if (row.status === "ON_LEAVE") counts.onLeave++;
      else if (row.status === "REMOTE") counts.remote++;
      else if (row.status === "HALF_DAY") counts.halfDay++;
      else if (
        row.status === "MISSING_CHECKOUT" ||
        (row.checkInAt && !row.checkOutAt)
      )
        counts.missingCheckout++;
      else if (row.status === "PRESENT") counts.present++;
    }
    return { date: q.date, ...counts };
  }
  async correct(p: Principal, id: string, dto: AttendanceCorrectionDto) {
    if (!p.permissions.includes("attendance.manage"))
      throw new ForbiddenException("Attendance correction denied");
    const existing = await this.prisma.attendanceRecord.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (
      !existing ||
      !existing.employee.divisionId ||
      (!p.roles.some((r) =>
        [
          "SUPER_ADMIN",
          "FOUNDER_CEO",
          "DIRECTOR",
          "HR_MANAGER",
          "HR_EXECUTIVE",
        ].includes(r),
      ) &&
        p.divisionId !== existing.employee.divisionId)
    )
      throw new NotFoundException("Attendance record not found");
    if (!dto.reason.trim())
      throw new BadRequestException("Correction reason is required");
    const row = await this.prisma.attendanceRecord.update({
      where: { id },
      data: {
        status: dto.status,
        checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : null,
        checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : null,
        notes: dto.notes?.trim() || null,
        source: "HR_MANUAL",
        updatedByUserId: p.userId,
      },
    });
    await this.audit.record({
      action: "ATTENDANCE_CORRECTED",
      actorUserId: p.userId,
      entityType: "AttendanceRecord",
      entityId: id,
      metadata: {
        reason: dto.reason.trim(),
        fields: ["status", "checkInAt", "checkOutAt", "notes"],
      },
    });
    return row;
  }
}
