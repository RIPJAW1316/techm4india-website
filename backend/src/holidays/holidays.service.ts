import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { HolidayDto, HolidayQueryDto } from "./dto/holiday.dto";

@Injectable()
export class HolidaysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}
  private org(p: Principal) {
    if (!p.organizationId) throw new ForbiddenException("Organization context unavailable");
    return p.organizationId;
  }
  private manage(p: Principal) {
    if (
      !p.permissions.includes("holidays.manage") ||
      !p.roles.some((r) => ["SUPER_ADMIN", "FOUNDER_CEO", "HR_MANAGER"].includes(r))
    )
      throw new ForbiddenException("Holiday management denied");
  }
  async list(p: Principal, q: HolidayQueryDto) {
    const organizationId = this.org(p);
    const orgWide = p.roles.some((role) =>
      ["SUPER_ADMIN", "FOUNDER_CEO", "HR_MANAGER", "HR_EXECUTIVE"].includes(role),
    );
    const employee =
      !orgWide && p.employeeId
        ? await this.prisma.employee.findUnique({
            where: { id: p.employeeId },
            select: { branchId: true },
          })
        : null;
    const visibility = orgWide
      ? undefined
      : {
          OR: [
            { divisionId: null, branchId: null },
            ...(p.divisionId ? [{ divisionId: p.divisionId, branchId: null }] : []),
            ...(employee?.branchId ? [{ branchId: employee.branchId }] : []),
          ],
        };
    const where: Prisma.HolidayWhereInput = {
      organizationId,
      ...(visibility ?? {}),
      ...(q.from || q.to
        ? {
            date: {
              ...(q.from ? { gte: new Date(`${q.from}T00:00:00.000Z`) } : {}),
              ...(q.to ? { lte: new Date(`${q.to}T00:00:00.000Z`) } : {}),
            },
          }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.holiday.count({ where }),
      this.prisma.holiday.findMany({
        where,
        orderBy: { date: "asc" },
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
  async create(p: Principal, dto: HolidayDto) {
    this.manage(p);
    const organizationId = this.org(p);
    await this.validateScope(organizationId, dto);
    try {
      const row = await this.prisma.holiday.create({
        data: {
          organizationId,
          name: dto.name.trim(),
          date: new Date(`${dto.date}T00:00:00.000Z`),
          type: dto.type ?? "COMPANY",
          description: dto.description?.trim(),
          isOptional: dto.isOptional ?? false,
          divisionId: dto.divisionId,
          branchId: dto.branchId,
        },
      });
      await this.audit.record({
        action: "HOLIDAY_CREATED",
        actorUserId: p.userId,
        entityType: "Holiday",
        entityId: row.id,
      });
      return row;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
        throw new ConflictException("A holiday already exists for this date and scope");
      throw error;
    }
  }
  async update(p: Principal, id: string, dto: HolidayDto) {
    this.manage(p);
    const existing = await this.prisma.holiday.findFirst({
      where: { id, organizationId: this.org(p) },
    });
    if (!existing) throw new NotFoundException("Holiday not found");
    await this.validateScope(existing.organizationId, dto);
    const row = await this.prisma.holiday.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        date: new Date(`${dto.date}T00:00:00.000Z`),
        type: dto.type ?? existing.type,
        description: dto.description?.trim(),
        isOptional: dto.isOptional ?? existing.isOptional,
        divisionId: dto.divisionId,
        branchId: dto.branchId,
      },
    });
    await this.audit.record({
      action: "HOLIDAY_UPDATED",
      actorUserId: p.userId,
      entityType: "Holiday",
      entityId: id,
    });
    return row;
  }
  private async validateScope(organizationId: string, dto: HolidayDto) {
    if (dto.divisionId) {
      const d = await this.prisma.division.findFirst({
        where: { id: dto.divisionId, organizationId },
      });
      if (!d) throw new NotFoundException("Division not found");
    }
    if (dto.branchId) {
      const b = await this.prisma.branch.findFirst({
        where: { id: dto.branchId, organizationId },
      });
      if (!b) throw new NotFoundException("Branch not found");
    }
  }
}
