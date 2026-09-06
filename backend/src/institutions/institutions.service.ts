import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  InstitutionEngagementStatus,
  InstitutionStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  EngagementQueryDto,
  InstitutionContactDto,
  InstitutionDto,
  InstitutionEngagementDto,
  InstitutionQueryDto,
} from "./dto/institution.dto";

const owner = {
  id: true,
  firstName: true,
  lastName: true,
  employeeCode: true,
  userId: true,
} as const;
const institutionInclude = {
  relationshipOwner: { select: owner },
  crmAccount: {
    select: {
      id: true,
      name: true,
      status: true,
      accountType: true,
      owner: { select: owner },
    },
  },
  primaryContact: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  _count: { select: { contacts: true, engagements: true } },
} satisfies Prisma.InstitutionInclude;
const contactInclude = {
  institution: { select: { id: true, name: true, code: true } },
} satisfies Prisma.InstitutionContactInclude;
const engagementInclude = {
  institution: { select: { id: true, name: true, code: true } },
  owner: { select: owner },
  crmOpportunity: {
    select: {
      id: true,
      name: true,
      stage: true,
      estimatedValue: true,
      currency: true,
      owner: { select: owner },
    },
  },
} satisfies Prisma.InstitutionEngagementInclude;

@Injectable()
export class InstitutionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}
  private org(p: Principal) {
    if (!p.organizationId)
      throw new ForbiddenException("Organization context unavailable");
    return p.organizationId;
  }
  private full(p: Principal) {
    return p.roles.some((r) =>
      ["FOUNDER_CEO", "SUPER_ADMIN", "SALES_MANAGER"].includes(r),
    );
  }
  private executive(p: Principal) {
    return p.roles.includes("SALES_EXECUTIVE") && !this.full(p);
  }
  private read(p: Principal, key: string) {
    if (
      !p.permissions.includes(key) ||
      !(this.full(p) || p.roles.includes("DIRECTOR") || this.executive(p))
    )
      throw new ForbiddenException("Institution access denied");
  }
  private manage(p: Principal, key: string) {
    if (!p.permissions.includes(key) || !(this.full(p) || this.executive(p)))
      throw new ForbiddenException("Institution management denied");
  }
  private assign(p: Principal) {
    if (!this.full(p) || !p.permissions.includes("institutions.assign"))
      throw new ForbiddenException("Institution assignment denied");
  }
  private own(p: Principal, requested?: string) {
    if (!this.executive(p)) return requested;
    if (!p.employeeId)
      throw new ForbiddenException("Employee profile unavailable");
    if (requested && requested !== p.employeeId)
      throw new ForbiddenException("Institution ownership is restricted");
    return p.employeeId;
  }
  private page(q: { page: number; limit: number }) {
    return {
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      meta: (total: number) => ({
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      }),
    };
  }
  private clean<T extends Record<string, unknown>>(row: T) {
    return Object.fromEntries(
      Object.entries(row).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
  }
  private date(value?: string) {
    return value ? new Date(value) : undefined;
  }
  private async employee(orgId: string, id?: string) {
    if (!id) return null;
    const row = await this.prisma.employee.findFirst({
      where: {
        id,
        employmentStatus: "ACTIVE",
        division: { organizationId: orgId },
      },
      select: owner,
    });
    if (!row)
      throw new BadRequestException(
        "Active relationship owner not found in this organization",
      );
    return row;
  }
  private async institution(p: Principal, id: string, writable = false) {
    const row = await this.prisma.institution.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.executive(p)
          ? { relationshipOwnerEmployeeId: p.employeeId }
          : {}),
      },
      include: institutionInclude,
    });
    if (!row) throw new NotFoundException("Institution not found");
    if (writable && row.archivedAt)
      throw new ConflictException("Archived institutions cannot be changed");
    return row;
  }
  private async account(orgId: string, id?: string) {
    if (!id) return null;
    const row = await this.prisma.crmAccount.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!row)
      throw new BadRequestException("CRM account is not in this organization");
    return row;
  }
  private async opportunity(orgId: string, id?: string) {
    if (!id) return null;
    const row = await this.prisma.crmOpportunity.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!row)
      throw new BadRequestException(
        "CRM opportunity is not in this organization",
      );
    return row;
  }
  private async notify(
    employee: { id: string; userId: string } | null,
    type: NotificationType,
    title: string,
    body: string,
    resourceType: string,
    resourceId: string,
    actorId?: string | null,
  ) {
    if (employee && employee.id !== actorId)
      await this.notifications.create({
        userId: employee.userId,
        type,
        title,
        body,
        resourceType,
        resourceId,
      });
  }
  private data(dto: InstitutionDto, ownerId?: string) {
    return this.clean({
      code: dto.code?.trim().toUpperCase(),
      name: dto.name?.trim(),
      shortName: dto.shortName?.trim(),
      type: dto.type,
      status: dto.status,
      website: dto.website?.trim(),
      officialEmail: dto.officialEmail?.trim().toLowerCase(),
      officialPhone: dto.officialPhone?.trim(),
      addressLine1: dto.addressLine1?.trim(),
      addressLine2: dto.addressLine2?.trim(),
      city: dto.city?.trim(),
      state: dto.state?.trim(),
      postalCode: dto.postalCode?.trim(),
      country: dto.country?.trim(),
      relationshipOwnerEmployeeId: ownerId,
      crmAccountId: dto.crmAccountId,
      establishedYear: dto.establishedYear,
      studentStrength: dto.studentStrength,
      notes: dto.notes?.trim(),
      archivedAt:
        dto.status === InstitutionStatus.ARCHIVED
          ? new Date()
          : dto.status
            ? null
            : undefined,
    });
  }
  async list(p: Principal, q: InstitutionQueryDto) {
    this.read(p, "institutions.read");
    const org = this.org(p),
      page = this.page(q),
      ownerId = this.own(p, q.relationshipOwnerEmployeeId),
      search = q.search?.trim();
    const where: Prisma.InstitutionWhereInput = {
      organizationId: org,
      ...(ownerId ? { relationshipOwnerEmployeeId: ownerId } : {}),
      ...(q.status
        ? { status: q.status }
        : q.includeArchived
          ? {}
          : { archivedAt: null }),
      ...(q.type ? { type: q.type } : {}),
      ...(q.city ? { city: { equals: q.city, mode: "insensitive" } } : {}),
      ...(q.state ? { state: { equals: q.state, mode: "insensitive" } } : {}),
      ...(q.crmAccountId ? { crmAccountId: q.crmAccountId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const order = q.sortBy === "name" ? "name" : (q.sortBy ?? "createdAt");
    const [total, data] = await this.prisma.$transaction([
      this.prisma.institution.count({ where }),
      this.prisma.institution.findMany({
        where,
        include: institutionInclude,
        orderBy: { [order]: q.sortOrder ?? "desc" },
        skip: page.skip,
        take: page.take,
      }),
    ]);
    return { data, meta: page.meta(total) };
  }
  async detail(p: Principal, id: string) {
    this.read(p, "institutions.read");
    const row = await this.institution(p, id);
    return this.prisma.institution.findUniqueOrThrow({
      where: { id: row.id },
      include: {
        ...institutionInclude,
        contacts: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
        },
        engagements: {
          where: { archivedAt: null },
          include: engagementInclude,
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
  }
  async create(p: Principal, dto: InstitutionDto) {
    this.manage(p, "institutions.manage");
    if (!dto.code?.trim() || !dto.name?.trim())
      throw new BadRequestException("Institution code and name are required");
    const org = this.org(p),
      ownerId =
        this.own(p, dto.relationshipOwnerEmployeeId) ??
        p.employeeId ??
        undefined;
    const employee = await this.employee(org, ownerId);
    await this.account(org, dto.crmAccountId);
    try {
      const row = await this.prisma.institution.create({
        data: {
          organizationId: org,
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          ...this.data(dto, ownerId),
        } as Prisma.InstitutionUncheckedCreateInput,
        include: institutionInclude,
      });
      await this.audit.record({
        action: "INSTITUTION_CREATED",
        actorUserId: p.userId,
        entityType: "Institution",
        entityId: row.id,
        metadata: {
          ownerEmployeeId: ownerId ?? null,
          crmAccountId: dto.crmAccountId ?? null,
        },
      });
      await this.notify(
        employee,
        "INSTITUTION_ASSIGNED",
        "Institution relationship assigned",
        `${row.name} is assigned to you.`,
        "Institution",
        row.id,
        p.employeeId,
      );
      return row;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException(
          "Institution code already exists in this organization",
        );
      throw error;
    }
  }
  async fromCrm(p: Principal, accountId: string, dto: InstitutionDto) {
    this.manage(p, "institutions.manage");
    const account = await this.account(this.org(p), accountId);
    if (!account) throw new BadRequestException("CRM account not found");
    const duplicate = await this.prisma.institution.findFirst({
      where: { organizationId: this.org(p), crmAccountId: accountId },
    });
    if (duplicate)
      throw new ConflictException(
        "This CRM account is already linked to an institution",
      );
    return this.create(p, {
      ...dto,
      name: dto.name ?? account.name,
      code: dto.code,
      crmAccountId: accountId,
    });
  }
  async update(p: Principal, id: string, dto: InstitutionDto) {
    this.manage(p, "institutions.manage");
    const existing = await this.institution(p, id, true);
    if (
      dto.relationshipOwnerEmployeeId !== undefined &&
      dto.relationshipOwnerEmployeeId !== existing.relationshipOwnerEmployeeId
    )
      this.assign(p);
    const ownerId =
      dto.relationshipOwnerEmployeeId === undefined
        ? undefined
        : this.own(p, dto.relationshipOwnerEmployeeId);
    const employee = await this.employee(this.org(p), ownerId);
    await this.account(this.org(p), dto.crmAccountId);
    if (dto.primaryContactId) {
      const contact = await this.prisma.institutionContact.findFirst({
        where: {
          id: dto.primaryContactId,
          institutionId: id,
          archivedAt: null,
        },
      });
      if (!contact)
        throw new BadRequestException(
          "Primary contact does not belong to this institution",
        );
    }
    const row = await this.prisma.institution.update({
      where: { id },
      data: this.data(dto, ownerId) as Prisma.InstitutionUncheckedUpdateInput,
      include: institutionInclude,
    });
    await this.audit.record({
      action:
        dto.relationshipOwnerEmployeeId !== undefined &&
        dto.relationshipOwnerEmployeeId !== existing.relationshipOwnerEmployeeId
          ? "INSTITUTION_OWNER_CHANGED"
          : row.status === InstitutionStatus.ARCHIVED
            ? "INSTITUTION_ARCHIVED"
            : "INSTITUTION_UPDATED",
      actorUserId: p.userId,
      entityType: "Institution",
      entityId: id,
      metadata: { fields: Object.keys(dto).filter((key) => key !== "notes") },
    });
    if (ownerId && ownerId !== existing.relationshipOwnerEmployeeId)
      await this.notify(
        employee,
        "INSTITUTION_ASSIGNED",
        "Institution relationship assigned",
        `${row.name} is assigned to you.`,
        "Institution",
        id,
        p.employeeId,
      );
    return row;
  }
  async archive(p: Principal, id: string) {
    return this.update(p, id, { status: InstitutionStatus.ARCHIVED });
  }
  async contacts(p: Principal, id: string) {
    this.read(p, "institutions.contacts.read");
    await this.institution(p, id);
    return this.prisma.institutionContact.findMany({
      where: { institutionId: id, archivedAt: null },
      include: contactInclude,
      orderBy: { createdAt: "desc" },
    });
  }
  async createContact(p: Principal, id: string, dto: InstitutionContactDto) {
    this.manage(p, "institutions.contacts.manage");
    await this.institution(p, id, true);
    if (!dto.firstName?.trim() || !dto.lastName?.trim())
      throw new BadRequestException("Contact first and last name are required");
    const row = await this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary)
        await tx.institutionContact.updateMany({
          where: { institutionId: id },
          data: { isPrimary: false },
        });
      const contact = await tx.institutionContact.create({
        data: {
          institutionId: id,
          firstName: dto.firstName!.trim(),
          lastName: dto.lastName!.trim(),
          roleTitle: dto.roleTitle?.trim(),
          department: dto.department?.trim(),
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          alternatePhone: dto.alternatePhone?.trim(),
          isPrimary: dto.isPrimary ?? false,
          isDecisionMaker: dto.isDecisionMaker ?? false,
          notes: dto.notes?.trim(),
        },
      });
      if (dto.isPrimary)
        await tx.institution.update({
          where: { id },
          data: { primaryContactId: contact.id },
        });
      return contact;
    });
    await this.audit.record({
      action: "INSTITUTION_CONTACT_CREATED",
      actorUserId: p.userId,
      entityType: "InstitutionContact",
      entityId: row.id,
      metadata: { institutionId: id },
    });
    return row;
  }
  async updateContact(
    p: Principal,
    id: string,
    contactId: string,
    dto: InstitutionContactDto,
  ) {
    this.manage(p, "institutions.contacts.manage");
    await this.institution(p, id, true);
    const contact = await this.prisma.institutionContact.findFirst({
      where: { id: contactId, institutionId: id },
    });
    if (!contact) throw new NotFoundException("Institution contact not found");
    if (contact.archivedAt)
      throw new ConflictException("Archived contacts cannot be changed");
    const row = await this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary)
        await tx.institutionContact.updateMany({
          where: { institutionId: id },
          data: { isPrimary: false },
        });
      const updated = await tx.institutionContact.update({
        where: { id: contactId },
        data: this.clean({
          firstName: dto.firstName?.trim(),
          lastName: dto.lastName?.trim(),
          roleTitle: dto.roleTitle?.trim(),
          department: dto.department?.trim(),
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          alternatePhone: dto.alternatePhone?.trim(),
          isPrimary: dto.isPrimary,
          isDecisionMaker: dto.isDecisionMaker,
          notes: dto.notes?.trim(),
        }),
      });
      if (dto.isPrimary)
        await tx.institution.update({
          where: { id },
          data: { primaryContactId: contactId },
        });
      return updated;
    });
    await this.audit.record({
      action: dto.isPrimary
        ? "INSTITUTION_PRIMARY_CONTACT_CHANGED"
        : "INSTITUTION_CONTACT_UPDATED",
      actorUserId: p.userId,
      entityType: "InstitutionContact",
      entityId: contactId,
      metadata: {
        institutionId: id,
        fields: Object.keys(dto).filter((key) => key !== "notes"),
      },
    });
    return row;
  }
  async engagements(p: Principal, id: string, q: EngagementQueryDto) {
    this.read(p, "institutions.engagements.read");
    await this.institution(p, id);
    const ownerId = this.own(p, q.ownerEmployeeId);
    return this.prisma.institutionEngagement.findMany({
      where: {
        institutionId: id,
        ...(ownerId ? { ownerEmployeeId: ownerId } : {}),
        ...(q.status
          ? { status: q.status }
          : q.includeArchived
            ? {}
            : { archivedAt: null }),
        ...(q.type ? { type: q.type } : {}),
        ...(q.from || q.to
          ? {
              startDate: {
                ...(q.from ? { gte: this.date(q.from) } : {}),
                ...(q.to ? { lte: this.date(q.to) } : {}),
              },
            }
          : {}),
      },
      include: engagementInclude,
      orderBy: { startDate: "asc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    });
  }
  private async engagementData(
    p: Principal,
    dto: InstitutionEngagementDto,
    currentOwner?: string | null,
  ) {
    const org = this.org(p);
    if (
      dto.startDate &&
      dto.endDate &&
      this.date(dto.endDate)! < this.date(dto.startDate)!
    )
      throw new BadRequestException(
        "Engagement end date cannot precede start date",
      );
    if (
      dto.ownerEmployeeId !== undefined &&
      dto.ownerEmployeeId !== currentOwner
    )
      this.assign(p);
    const ownerId =
      dto.ownerEmployeeId === undefined
        ? undefined
        : this.own(p, dto.ownerEmployeeId);
    const employee = await this.employee(org, ownerId);
    await this.opportunity(org, dto.crmOpportunityId);
    return {
      data: this.clean({
        title: dto.title?.trim(),
        description: dto.description?.trim(),
        type: dto.type,
        status: dto.status,
        startDate: this.date(dto.startDate),
        endDate: this.date(dto.endDate),
        ownerEmployeeId: ownerId,
        crmOpportunityId: dto.crmOpportunityId,
        estimatedParticipants: dto.estimatedParticipants,
        notes: dto.notes?.trim(),
        archivedAt:
          dto.status === InstitutionEngagementStatus.ARCHIVED
            ? new Date()
            : dto.status
              ? null
              : undefined,
      }),
      employee,
      ownerId,
    };
  }
  async createEngagement(
    p: Principal,
    id: string,
    dto: InstitutionEngagementDto,
  ) {
    this.manage(p, "institutions.engagements.manage");
    await this.institution(p, id, true);
    if (!dto.title?.trim())
      throw new BadRequestException("Engagement title is required");
    const prepared = await this.engagementData(p, dto);
    const row = await this.prisma.institutionEngagement.create({
      data: {
        organizationId: this.org(p),
        institutionId: id,
        title: dto.title.trim(),
        ...prepared.data,
      } as Prisma.InstitutionEngagementUncheckedCreateInput,
      include: engagementInclude,
    });
    await this.audit.record({
      action: "INSTITUTION_ENGAGEMENT_CREATED",
      actorUserId: p.userId,
      entityType: "InstitutionEngagement",
      entityId: row.id,
      metadata: { institutionId: id },
    });
    await this.notify(
      prepared.employee,
      "INSTITUTION_ENGAGEMENT_ASSIGNED",
      "Institution engagement assigned",
      `${row.title} is assigned to you.`,
      "InstitutionEngagement",
      row.id,
      p.employeeId,
    );
    return row;
  }
  async engagement(p: Principal, id: string, engagementId: string) {
    this.read(p, "institutions.engagements.read");
    await this.institution(p, id);
    const row = await this.prisma.institutionEngagement.findFirst({
      where: {
        id: engagementId,
        institutionId: id,
        ...(this.executive(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
      include: engagementInclude,
    });
    if (!row) throw new NotFoundException("Institution engagement not found");
    return row;
  }
  async updateEngagement(
    p: Principal,
    id: string,
    engagementId: string,
    dto: InstitutionEngagementDto,
  ) {
    this.manage(p, "institutions.engagements.manage");
    await this.institution(p, id, true);
    const existing = await this.engagement(p, id, engagementId);
    if (existing.archivedAt)
      throw new ConflictException("Archived engagements cannot be changed");
    const prepared = await this.engagementData(
      p,
      dto,
      existing.ownerEmployeeId,
    );
    const row = await this.prisma.institutionEngagement.update({
      where: { id: engagementId },
      data: prepared.data as Prisma.InstitutionEngagementUncheckedUpdateInput,
      include: engagementInclude,
    });
    await this.audit.record({
      action:
        dto.status && dto.status !== existing.status
          ? "INSTITUTION_ENGAGEMENT_STATUS_CHANGED"
          : "INSTITUTION_ENGAGEMENT_UPDATED",
      actorUserId: p.userId,
      entityType: "InstitutionEngagement",
      entityId: engagementId,
      metadata: { institutionId: id, status: dto.status },
    });
    if (prepared.ownerId && prepared.ownerId !== existing.ownerEmployeeId)
      await this.notify(
        prepared.employee,
        "INSTITUTION_ENGAGEMENT_ASSIGNED",
        "Institution engagement assigned",
        `${row.title} is assigned to you.`,
        "InstitutionEngagement",
        row.id,
        p.employeeId,
      );
    return row;
  }
  async dashboard(p: Principal) {
    this.read(p, "institutions.dashboard.read");
    const org = this.org(p),
      scoped = this.executive(p)
        ? { relationshipOwnerEmployeeId: p.employeeId }
        : {};
    const [
      total,
      active,
      prospects,
      onboarding,
      byType,
      engagements,
      upcoming,
      owners,
    ] = await Promise.all([
      this.prisma.institution.count({
        where: { organizationId: org, archivedAt: null, ...scoped },
      }),
      this.prisma.institution.count({
        where: { organizationId: org, status: "ACTIVE", ...scoped },
      }),
      this.prisma.institution.count({
        where: { organizationId: org, status: "PROSPECT", ...scoped },
      }),
      this.prisma.institution.count({
        where: { organizationId: org, status: "ONBOARDING", ...scoped },
      }),
      this.prisma.institution.groupBy({
        by: ["type"],
        where: { organizationId: org, archivedAt: null, ...scoped },
        _count: true,
      }),
      this.prisma.institutionEngagement.groupBy({
        by: ["status"],
        where: {
          organizationId: org,
          archivedAt: null,
          ...(this.executive(p) ? { ownerEmployeeId: p.employeeId } : {}),
        },
        _count: true,
      }),
      this.prisma.institutionEngagement.findMany({
        where: {
          organizationId: org,
          archivedAt: null,
          status: { in: ["PLANNED", "CONFIRMED"] },
          startDate: { gte: new Date() },
          ...(this.executive(p) ? { ownerEmployeeId: p.employeeId } : {}),
        },
        include: engagementInclude,
        orderBy: { startDate: "asc" },
        take: 8,
      }),
      this.prisma.institution.groupBy({
        by: ["relationshipOwnerEmployeeId"],
        where: { organizationId: org, archivedAt: null, ...scoped },
        _count: true,
      }),
    ]);
    return {
      total,
      active,
      prospects,
      onboarding,
      byType: Object.fromEntries(
        byType.map((item) => [item.type, item._count]),
      ),
      engagementCounts: Object.fromEntries(
        engagements.map((item) => [item.status, item._count]),
      ),
      upcoming,
      ownerSummary: owners.map((item) => ({
        ownerEmployeeId: item.relationshipOwnerEmployeeId,
        count: item._count,
      })),
    };
  }
}
