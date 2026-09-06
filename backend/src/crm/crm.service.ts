import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CrmAccountStatus,
  CrmOpportunityStage,
  NotificationType,
  Prisma,
} from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  AccountDto,
  AccountQueryDto,
  ActivityDto,
  ActivityQueryDto,
  ContactDto,
  ContactQueryDto,
  LeadConversionDto,
  LeadDto,
  LeadQueryDto,
  OpportunityDto,
  OpportunityQueryDto,
} from "./dto/crm.dto";

const ownerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  employeeCode: true,
  userId: true,
} as const;
const leadInclude = {
  owner: { select: ownerSelect },
  convertedAccount: { select: { id: true, name: true } },
  convertedContact: { select: { id: true, firstName: true, lastName: true } },
  convertedOpportunity: { select: { id: true, name: true, stage: true } },
} satisfies Prisma.CrmLeadInclude;
const accountInclude = {
  owner: { select: ownerSelect },
  _count: { select: { contacts: true, opportunities: true, activities: true } },
} satisfies Prisma.CrmAccountInclude;
const contactInclude = {
  owner: { select: ownerSelect },
  account: { select: { id: true, name: true } },
  _count: { select: { opportunities: true, activities: true } },
} satisfies Prisma.CrmContactInclude;
const opportunityInclude = {
  owner: { select: ownerSelect },
  account: { select: { id: true, name: true } },
  primaryContact: { select: { id: true, firstName: true, lastName: true } },
  sourceLead: {
    select: { id: true, firstName: true, lastName: true, companyName: true },
  },
} satisfies Prisma.CrmOpportunityInclude;
const activityInclude = {
  owner: { select: ownerSelect },
  lead: { select: { id: true, firstName: true, lastName: true } },
  account: { select: { id: true, name: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
  opportunity: { select: { id: true, name: true, stage: true } },
} satisfies Prisma.CrmActivityInclude;

@Injectable()
export class CrmService {
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
    return p.roles.some((role) =>
      ["SUPER_ADMIN", "FOUNDER_CEO", "SALES_MANAGER"].includes(role),
    );
  }
  private executive(p: Principal) {
    return p.roles.includes("SALES_EXECUTIVE");
  }
  private director(p: Principal) {
    return p.roles.includes("DIRECTOR");
  }
  private scoped(p: Principal) {
    return this.executive(p) && !this.full(p);
  }
  private read(p: Principal, permission: string) {
    if (
      !p.permissions.includes(permission) ||
      !(this.full(p) || this.executive(p) || this.director(p))
    )
      throw new ForbiddenException("CRM access denied");
  }
  private manage(p: Principal, permission: string) {
    if (
      !p.permissions.includes(permission) ||
      !(this.full(p) || this.executive(p))
    )
      throw new ForbiddenException("CRM management denied");
  }
  private assign(p: Principal) {
    if (!p.permissions.includes("crm.leads.assign") || !this.full(p))
      throw new ForbiddenException("CRM assignment denied");
  }
  private date(value?: string) {
    return value ? new Date(value) : undefined;
  }
  private currency(value?: string) {
    if (!value) return undefined;
    const currency = value.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency))
      throw new BadRequestException("Currency must be an ISO 4217 code");
    return currency;
  }
  private clean<T extends Record<string, unknown>>(value: T) {
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item !== undefined),
    ) as Partial<T>;
  }
  private page(query: { page: number; limit: number }) {
    return {
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      meta: (total: number) => ({
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      }),
    };
  }
  private async employee(organizationId: string, id?: string) {
    if (!id) return null;
    const employee = await this.prisma.employee.findFirst({
      where: { id, employmentStatus: "ACTIVE", division: { organizationId } },
      select: ownerSelect,
    });
    if (!employee)
      throw new BadRequestException(
        "Active CRM owner not found in this organization",
      );
    return employee;
  }
  private ownId(p: Principal, requested?: string) {
    if (this.scoped(p)) {
      if (!p.employeeId)
        throw new ForbiddenException("Employee profile unavailable");
      if (requested && requested !== p.employeeId)
        throw new ForbiddenException("CRM ownership is restricted");
      return p.employeeId;
    }
    return requested;
  }
  private async account(organizationId: string, id?: string) {
    if (!id) return null;
    const account = await this.prisma.crmAccount.findFirst({
      where: { id, organizationId },
    });
    if (!account)
      throw new BadRequestException("CRM account is not in this organization");
    return account;
  }
  private async contact(organizationId: string, id?: string) {
    if (!id) return null;
    const contact = await this.prisma.crmContact.findFirst({
      where: { id, organizationId },
    });
    if (!contact)
      throw new BadRequestException("CRM contact is not in this organization");
    return contact;
  }
  private async lead(organizationId: string, id?: string) {
    if (!id) return null;
    const lead = await this.prisma.crmLead.findFirst({
      where: { id, organizationId },
    });
    if (!lead)
      throw new BadRequestException("CRM lead is not in this organization");
    return lead;
  }
  private async opportunity(organizationId: string, id?: string) {
    if (!id) return null;
    const opportunity = await this.prisma.crmOpportunity.findFirst({
      where: { id, organizationId },
    });
    if (!opportunity)
      throw new BadRequestException(
        "CRM opportunity is not in this organization",
      );
    return opportunity;
  }
  private assertWritableArchived(archivedAt: Date | null) {
    if (archivedAt)
      throw new ConflictException("Archived CRM records cannot be changed");
  }
  private async notifyAssignment(
    tx: Prisma.TransactionClient,
    employee: { id: string; userId: string } | null,
    type: NotificationType,
    title: string,
    body: string,
    resourceType: string,
    resourceId: string,
    actorEmployeeId?: string | null,
  ) {
    if (employee && employee.id !== actorEmployeeId)
      await this.notifications.create({
        userId: employee.userId,
        type,
        title,
        body,
        resourceType,
        resourceId,
        tx,
      });
  }

  async listLeads(p: Principal, q: LeadQueryDto) {
    this.read(p, "crm.leads.read");
    const organizationId = this.org(p);
    const ownerEmployeeId = this.ownId(p, q.ownerEmployeeId);
    const page = this.page(q);
    const search = q.search?.trim();
    const where: Prisma.CrmLeadWhereInput = {
      organizationId,
      ...(ownerEmployeeId ? { ownerEmployeeId } : {}),
      ...(q.status
        ? { status: q.status }
        : q.includeArchived
          ? {}
          : { archivedAt: null }),
      ...(q.source ? { source: q.source } : {}),
      ...(q.from || q.to
        ? {
            createdAt: {
              ...(q.from ? { gte: this.date(q.from) } : {}),
              ...(q.to ? { lte: this.date(q.to) } : {}),
            },
          }
        : {}),
      ...(q.followUpFrom || q.followUpTo
        ? {
            nextFollowUpAt: {
              ...(q.followUpFrom ? { gte: this.date(q.followUpFrom) } : {}),
              ...(q.followUpTo ? { lte: this.date(q.followUpTo) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { companyName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.crmLead.count({ where }),
      this.prisma.crmLead.findMany({
        where,
        include: leadInclude,
        orderBy: {
          [q.sortBy === "name" ? "firstName" : (q.sortBy ?? "createdAt")]:
            q.sortOrder ?? "desc",
        },
        skip: page.skip,
        take: page.take,
      }),
    ]);
    return { data, meta: page.meta(total) };
  }
  async getLead(p: Principal, id: string) {
    this.read(p, "crm.leads.read");
    const row = await this.prisma.crmLead.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
      include: {
        ...leadInclude,
        activities: {
          include: activityInclude,
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!row) throw new NotFoundException("Lead not found");
    return row;
  }
  async createLead(p: Principal, dto: LeadDto) {
    this.manage(p, "crm.leads.manage");
    if (!dto.firstName?.trim() || !dto.lastName?.trim())
      throw new BadRequestException("Lead first and last name are required");
    const organizationId = this.org(p);
    const ownerId =
      this.ownId(p, dto.ownerEmployeeId) ?? p.employeeId ?? undefined;
    const owner = await this.employee(organizationId, ownerId);
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.crmLead.create({
        data: {
          organizationId,
          firstName: dto.firstName!.trim(),
          lastName: dto.lastName!.trim(),
          companyName: dto.companyName?.trim(),
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          designation: dto.designation?.trim(),
          source: dto.source ?? "OTHER",
          status: dto.status ?? "NEW",
          ownerEmployeeId: owner?.id,
          estimatedValue: dto.estimatedValue,
          currency: this.currency(dto.currency),
          nextFollowUpAt: this.date(dto.nextFollowUpAt),
          lastContactedAt: this.date(dto.lastContactedAt),
          notes: dto.notes?.trim(),
        },
        include: leadInclude,
      });
      await tx.auditLog.create({
        data: {
          action: "CRM_LEAD_CREATED",
          actorUserId: p.userId,
          entityType: "CrmLead",
          entityId: row.id,
          metadata: { ownerEmployeeId: owner?.id ?? null, source: row.source },
        },
      });
      await this.notifyAssignment(
        tx,
        owner,
        "CRM_LEAD_ASSIGNED",
        "New lead assigned",
        `You now own ${row.firstName} ${row.lastName}.`,
        "CrmLead",
        row.id,
        p.employeeId,
      );
      return row;
    });
  }
  async updateLead(p: Principal, id: string, dto: LeadDto) {
    this.manage(p, "crm.leads.manage");
    const organizationId = this.org(p);
    const existing = await this.prisma.crmLead.findFirst({
      where: {
        id,
        organizationId,
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!existing) throw new NotFoundException("Lead not found");
    this.assertWritableArchived(existing.archivedAt);
    if (existing.status === "CONVERTED")
      throw new ConflictException(
        "Converted leads are historical and cannot be edited",
      );
    if (
      dto.ownerEmployeeId !== undefined &&
      dto.ownerEmployeeId !== existing.ownerEmployeeId
    )
      this.assign(p);
    const ownerId =
      dto.ownerEmployeeId === undefined
        ? undefined
        : this.ownId(p, dto.ownerEmployeeId);
    const owner =
      ownerId === undefined
        ? null
        : await this.employee(organizationId, ownerId);
    if (dto.status === "CONVERTED" || dto.status === "ARCHIVED")
      throw new BadRequestException(
        "Use conversion or archive lifecycle actions",
      );
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.crmLead.update({
        where: { id },
        data: this.clean({
          firstName: dto.firstName?.trim(),
          lastName: dto.lastName?.trim(),
          companyName: dto.companyName?.trim(),
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          designation: dto.designation?.trim(),
          source: dto.source,
          status: dto.status,
          ownerEmployeeId: ownerId,
          estimatedValue: dto.estimatedValue,
          currency:
            dto.currency === undefined
              ? undefined
              : this.currency(dto.currency),
          nextFollowUpAt:
            dto.nextFollowUpAt === undefined
              ? undefined
              : this.date(dto.nextFollowUpAt),
          lastContactedAt:
            dto.lastContactedAt === undefined
              ? undefined
              : this.date(dto.lastContactedAt),
          notes: dto.notes?.trim(),
        }),
        include: leadInclude,
      });
      await tx.auditLog.create({
        data: {
          action:
            dto.ownerEmployeeId !== undefined &&
            dto.ownerEmployeeId !== existing.ownerEmployeeId
              ? "CRM_LEAD_REASSIGNED"
              : "CRM_LEAD_UPDATED",
          actorUserId: p.userId,
          entityType: "CrmLead",
          entityId: id,
          metadata: {
            fields: Object.keys(dto).filter((key) => key !== "notes"),
            previousOwnerEmployeeId: existing.ownerEmployeeId,
            ownerEmployeeId: row.ownerEmployeeId,
          },
        },
      });
      if (
        dto.ownerEmployeeId !== undefined &&
        row.ownerEmployeeId !== existing.ownerEmployeeId
      )
        await this.notifyAssignment(
          tx,
          owner,
          "CRM_LEAD_ASSIGNED",
          "Lead assigned",
          `You now own ${row.firstName} ${row.lastName}.`,
          "CrmLead",
          row.id,
          p.employeeId,
        );
      return row;
    });
  }
  async archiveLead(p: Principal, id: string) {
    this.manage(p, "crm.leads.manage");
    const row = await this.prisma.crmLead.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!row) throw new NotFoundException("Lead not found");
    if (row.archivedAt) throw new ConflictException("Lead is already archived");
    const archived = await this.prisma.crmLead.update({
      where: { id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
      include: leadInclude,
    });
    await this.audit.record({
      action: "CRM_LEAD_ARCHIVED",
      actorUserId: p.userId,
      entityType: "CrmLead",
      entityId: id,
    });
    return archived;
  }
  async convertLead(p: Principal, id: string, dto: LeadConversionDto) {
    this.manage(p, "crm.leads.convert");
    const organizationId = this.org(p);
    const existing = await this.prisma.crmLead.findFirst({
      where: {
        id,
        organizationId,
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!existing) throw new NotFoundException("Lead not found");
    if (existing.status === "CONVERTED" || existing.convertedAt)
      throw new ConflictException("Lead has already been converted");
    this.assertWritableArchived(existing.archivedAt);
    const ownerId =
      this.ownId(p, dto.ownerEmployeeId) ??
      existing.ownerEmployeeId ??
      p.employeeId ??
      undefined;
    const owner = await this.employee(organizationId, ownerId);
    const existingAccount = dto.existingAccountId
      ? await this.account(organizationId, dto.existingAccountId)
      : null;
    const existingContact = dto.existingContactId
      ? await this.contact(organizationId, dto.existingContactId)
      : null;
    if (
      existingAccount &&
      existingContact?.accountId &&
      existingAccount.id !== existingContact.accountId
    )
      throw new BadRequestException(
        "Existing contact does not belong to the selected account",
      );
    return this.prisma.$transaction(async (tx) => {
      let accountId =
        existingAccount?.id ?? existingContact?.accountId ?? undefined;
      if (!accountId) {
        const account = await tx.crmAccount.create({
          data: {
            organizationId,
            name:
              dto.accountName?.trim() ||
              existing.companyName?.trim() ||
              `${existing.firstName} ${existing.lastName}`,
            industry: dto.accountIndustry?.trim(),
            ownerEmployeeId: owner?.id,
          },
          select: { id: true },
        });
        accountId = account.id;
      }
      let contactId = dto.existingContactId;
      if (!contactId) {
        const contact = await tx.crmContact.create({
          data: {
            organizationId,
            accountId,
            firstName: dto.contactFirstName?.trim() || existing.firstName,
            lastName: dto.contactLastName?.trim() || existing.lastName,
            jobTitle: dto.contactJobTitle?.trim() || existing.designation,
            email: dto.contactEmail?.trim().toLowerCase() || existing.email,
            phone: dto.contactPhone?.trim() || existing.phone,
            ownerEmployeeId: owner?.id,
            isPrimary: true,
          },
          select: { id: true },
        });
        contactId = contact.id;
      }
      const opportunity = await tx.crmOpportunity.create({
        data: {
          organizationId,
          accountId,
          primaryContactId: contactId,
          sourceLeadId: existing.id,
          name:
            dto.opportunityName?.trim() ||
            `${existing.companyName ?? `${existing.firstName} ${existing.lastName}`} opportunity`,
          description: dto.opportunityDescription?.trim(),
          estimatedValue: dto.estimatedValue ?? existing.estimatedValue,
          currency: this.currency(dto.currency) ?? existing.currency,
          expectedCloseDate: this.date(dto.expectedCloseDate),
          ownerEmployeeId: owner?.id,
        },
        select: { id: true },
      });
      const lead = await tx.crmLead.update({
        where: { id },
        data: {
          status: "CONVERTED",
          convertedAt: new Date(),
          convertedAccountId: accountId,
          convertedContactId: contactId,
          convertedOpportunityId: opportunity.id,
        },
        include: leadInclude,
      });
      await tx.auditLog.create({
        data: {
          action: "CRM_LEAD_CONVERTED",
          actorUserId: p.userId,
          entityType: "CrmLead",
          entityId: id,
          metadata: { accountId, contactId, opportunityId: opportunity.id },
        },
      });
      await this.notifyAssignment(
        tx,
        owner,
        "CRM_OPPORTUNITY_ASSIGNED",
        "Opportunity created",
        `A new opportunity was created from ${existing.firstName} ${existing.lastName}.`,
        "CrmOpportunity",
        opportunity.id,
        p.employeeId,
      );
      return lead;
    });
  }

  async listAccounts(p: Principal, q: AccountQueryDto) {
    this.read(p, "crm.accounts.read");
    const ownerEmployeeId = this.ownId(p, q.ownerEmployeeId);
    const page = this.page(q);
    const search = q.search?.trim();
    const where: Prisma.CrmAccountWhereInput = {
      organizationId: this.org(p),
      ...(ownerEmployeeId ? { ownerEmployeeId } : {}),
      ...(q.accountType ? { accountType: q.accountType } : {}),
      ...(q.status
        ? { status: q.status }
        : q.includeArchived
          ? {}
          : { archivedAt: null }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { displayName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.crmAccount.count({ where }),
      this.prisma.crmAccount.findMany({
        where,
        include: accountInclude,
        orderBy: { createdAt: "desc" },
        skip: page.skip,
        take: page.take,
      }),
    ]);
    return { data, meta: page.meta(total) };
  }
  async getAccount(p: Principal, id: string) {
    this.read(p, "crm.accounts.read");
    const row = await this.prisma.crmAccount.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
      include: {
        ...accountInclude,
        contacts: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
        },
        opportunities: {
          where: { archivedAt: null },
          include: opportunityInclude,
          orderBy: { updatedAt: "desc" },
        },
        activities: {
          include: activityInclude,
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!row) throw new NotFoundException("Account not found");
    return row;
  }
  async createAccount(p: Principal, dto: AccountDto) {
    this.manage(p, "crm.accounts.manage");
    if (!dto.name?.trim())
      throw new BadRequestException("Account name is required");
    const organizationId = this.org(p);
    const ownerId =
      this.ownId(p, dto.ownerEmployeeId) ?? p.employeeId ?? undefined;
    await this.employee(organizationId, ownerId);
    const row = await this.prisma.crmAccount.create({
      data: Object.assign(
        { organizationId, name: dto.name!.trim() },
        this.accountData(dto, ownerId),
      ) as Prisma.CrmAccountUncheckedCreateInput,
      include: accountInclude,
    });
    await this.audit.record({
      action: "CRM_ACCOUNT_CREATED",
      actorUserId: p.userId,
      entityType: "CrmAccount",
      entityId: row.id,
      metadata: { ownerEmployeeId: ownerId ?? null },
    });
    return row;
  }
  async updateAccount(p: Principal, id: string, dto: AccountDto) {
    this.manage(p, "crm.accounts.manage");
    const existing = await this.prisma.crmAccount.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!existing) throw new NotFoundException("Account not found");
    this.assertWritableArchived(existing.archivedAt);
    if (
      dto.ownerEmployeeId !== undefined &&
      dto.ownerEmployeeId !== existing.ownerEmployeeId
    )
      this.assign(p);
    const ownerId =
      dto.ownerEmployeeId === undefined
        ? undefined
        : this.ownId(p, dto.ownerEmployeeId);
    await this.employee(this.org(p), ownerId);
    const row = await this.prisma.crmAccount.update({
      where: { id },
      data: this.accountData(dto, ownerId),
      include: accountInclude,
    });
    await this.audit.record({
      action:
        row.status === "ARCHIVED"
          ? "CRM_ACCOUNT_ARCHIVED"
          : "CRM_ACCOUNT_UPDATED",
      actorUserId: p.userId,
      entityType: "CrmAccount",
      entityId: id,
      metadata: { fields: Object.keys(dto).filter((key) => key !== "notes") },
    });
    return row;
  }
  private accountData(dto: AccountDto, ownerEmployeeId?: string) {
    const archived =
      dto.status === CrmAccountStatus.ARCHIVED
        ? new Date()
        : dto.status
          ? null
          : undefined;
    return this.clean({
      name: dto.name?.trim(),
      displayName: dto.displayName?.trim(),
      accountType: dto.accountType,
      status: dto.status,
      industry: dto.industry?.trim(),
      website: dto.website?.trim(),
      email: dto.email?.trim().toLowerCase(),
      phone: dto.phone?.trim(),
      addressLine1: dto.addressLine1?.trim(),
      addressLine2: dto.addressLine2?.trim(),
      city: dto.city?.trim(),
      state: dto.state?.trim(),
      postalCode: dto.postalCode?.trim(),
      country: dto.country?.trim(),
      ownerEmployeeId,
      notes: dto.notes?.trim(),
      archivedAt: archived,
    });
  }

  async listContacts(p: Principal, q: ContactQueryDto) {
    this.read(p, "crm.contacts.read");
    const organizationId = this.org(p);
    if (q.accountId) await this.account(organizationId, q.accountId);
    const ownerEmployeeId = this.ownId(p, q.ownerEmployeeId);
    const page = this.page(q);
    const search = q.search?.trim();
    const where: Prisma.CrmContactWhereInput = {
      organizationId,
      ...(ownerEmployeeId ? { ownerEmployeeId } : {}),
      ...(q.accountId ? { accountId: q.accountId } : {}),
      ...(q.includeArchived ? {} : { archivedAt: null }),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.crmContact.count({ where }),
      this.prisma.crmContact.findMany({
        where,
        include: contactInclude,
        orderBy: { createdAt: "desc" },
        skip: page.skip,
        take: page.take,
      }),
    ]);
    return { data, meta: page.meta(total) };
  }
  async getContact(p: Principal, id: string) {
    this.read(p, "crm.contacts.read");
    const row = await this.prisma.crmContact.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
      include: {
        ...contactInclude,
        opportunities: {
          include: opportunityInclude,
          where: { archivedAt: null },
        },
        activities: {
          include: activityInclude,
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!row) throw new NotFoundException("Contact not found");
    return row;
  }
  async createContact(p: Principal, dto: ContactDto) {
    this.manage(p, "crm.contacts.manage");
    if (!dto.firstName?.trim() || !dto.lastName?.trim())
      throw new BadRequestException("Contact first and last name are required");
    const organizationId = this.org(p);
    await this.account(organizationId, dto.accountId);
    const ownerId =
      this.ownId(p, dto.ownerEmployeeId) ?? p.employeeId ?? undefined;
    await this.employee(organizationId, ownerId);
    const row = await this.prisma.crmContact.create({
      data: Object.assign(
        {
          organizationId,
          firstName: dto.firstName!.trim(),
          lastName: dto.lastName!.trim(),
        },
        this.contactData(dto, ownerId),
      ) as Prisma.CrmContactUncheckedCreateInput,
      include: contactInclude,
    });
    await this.audit.record({
      action: "CRM_CONTACT_CREATED",
      actorUserId: p.userId,
      entityType: "CrmContact",
      entityId: row.id,
      metadata: { accountId: row.accountId, ownerEmployeeId: ownerId ?? null },
    });
    return row;
  }
  async updateContact(p: Principal, id: string, dto: ContactDto) {
    this.manage(p, "crm.contacts.manage");
    const existing = await this.prisma.crmContact.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!existing) throw new NotFoundException("Contact not found");
    this.assertWritableArchived(existing.archivedAt);
    if (
      dto.ownerEmployeeId !== undefined &&
      dto.ownerEmployeeId !== existing.ownerEmployeeId
    )
      this.assign(p);
    await this.account(this.org(p), dto.accountId);
    const ownerId =
      dto.ownerEmployeeId === undefined
        ? undefined
        : this.ownId(p, dto.ownerEmployeeId);
    await this.employee(this.org(p), ownerId);
    const row = await this.prisma.crmContact.update({
      where: { id },
      data: this.contactData(dto, ownerId),
      include: contactInclude,
    });
    await this.audit.record({
      action: "CRM_CONTACT_UPDATED",
      actorUserId: p.userId,
      entityType: "CrmContact",
      entityId: id,
      metadata: { fields: Object.keys(dto).filter((key) => key !== "notes") },
    });
    return row;
  }
  private contactData(dto: ContactDto, ownerEmployeeId?: string) {
    return this.clean({
      accountId: dto.accountId,
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
      jobTitle: dto.jobTitle?.trim(),
      email: dto.email?.trim().toLowerCase(),
      phone: dto.phone?.trim(),
      alternatePhone: dto.alternatePhone?.trim(),
      ownerEmployeeId,
      isPrimary: dto.isPrimary,
      notes: dto.notes?.trim(),
    });
  }

  async listOpportunities(p: Principal, q: OpportunityQueryDto) {
    this.read(p, "crm.opportunities.read");
    const organizationId = this.org(p);
    if (q.accountId) await this.account(organizationId, q.accountId);
    const ownerEmployeeId = this.ownId(p, q.ownerEmployeeId);
    const page = this.page(q);
    const search = q.search?.trim();
    const where: Prisma.CrmOpportunityWhereInput = {
      organizationId,
      ...(ownerEmployeeId ? { ownerEmployeeId } : {}),
      ...(q.accountId ? { accountId: q.accountId } : {}),
      ...(q.stage
        ? { stage: q.stage }
        : q.includeArchived
          ? {}
          : { archivedAt: null }),
      ...(q.expectedCloseFrom || q.expectedCloseTo
        ? {
            expectedCloseDate: {
              ...(q.expectedCloseFrom
                ? { gte: this.date(q.expectedCloseFrom) }
                : {}),
              ...(q.expectedCloseTo
                ? { lte: this.date(q.expectedCloseTo) }
                : {}),
            },
          }
        : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.crmOpportunity.count({ where }),
      this.prisma.crmOpportunity.findMany({
        where,
        include: opportunityInclude,
        orderBy: { updatedAt: "desc" },
        skip: page.skip,
        take: page.take,
      }),
    ]);
    return { data, meta: page.meta(total) };
  }
  async getOpportunity(p: Principal, id: string) {
    this.read(p, "crm.opportunities.read");
    const row = await this.prisma.crmOpportunity.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
      include: {
        ...opportunityInclude,
        activities: {
          include: activityInclude,
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!row) throw new NotFoundException("Opportunity not found");
    return row;
  }
  async createOpportunity(p: Principal, dto: OpportunityDto) {
    this.manage(p, "crm.opportunities.manage");
    if (!dto.name?.trim())
      throw new BadRequestException("Opportunity name is required");
    const organizationId = this.org(p);
    await this.relations(organizationId, dto);
    const ownerId =
      this.ownId(p, dto.ownerEmployeeId) ?? p.employeeId ?? undefined;
    const owner = await this.employee(organizationId, ownerId);
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.crmOpportunity.create({
        data: Object.assign(
          { organizationId, name: dto.name!.trim() },
          this.opportunityData(dto, owner?.id),
        ) as Prisma.CrmOpportunityUncheckedCreateInput,
        include: opportunityInclude,
      });
      await tx.auditLog.create({
        data: {
          action: "CRM_OPPORTUNITY_CREATED",
          actorUserId: p.userId,
          entityType: "CrmOpportunity",
          entityId: created.id,
          metadata: {
            accountId: created.accountId,
            ownerEmployeeId: owner?.id ?? null,
            stage: created.stage,
          },
        },
      });
      await this.notifyAssignment(
        tx,
        owner,
        "CRM_OPPORTUNITY_ASSIGNED",
        "New opportunity assigned",
        `You now own ${created.name}.`,
        "CrmOpportunity",
        created.id,
        p.employeeId,
      );
      return created;
    });
  }
  async updateOpportunity(p: Principal, id: string, dto: OpportunityDto) {
    this.manage(p, "crm.opportunities.manage");
    const organizationId = this.org(p);
    const existing = await this.prisma.crmOpportunity.findFirst({
      where: {
        id,
        organizationId,
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!existing) throw new NotFoundException("Opportunity not found");
    this.assertWritableArchived(existing.archivedAt);
    if (
      dto.ownerEmployeeId !== undefined &&
      dto.ownerEmployeeId !== existing.ownerEmployeeId
    )
      this.assign(p);
    if (
      ["WON", "LOST"].includes(existing.stage) &&
      dto.stage &&
      dto.stage !== existing.stage &&
      !this.full(p)
    )
      throw new ForbiddenException(
        "Only CRM management can reopen a closed opportunity",
      );
    if (dto.stage === "LOST" && !dto.lostReason?.trim() && !existing.lostReason)
      throw new BadRequestException("Lost opportunities require a reason");
    await this.relations(organizationId, dto);
    const ownerId =
      dto.ownerEmployeeId === undefined
        ? undefined
        : this.ownId(p, dto.ownerEmployeeId);
    const owner = await this.employee(organizationId, ownerId);
    return this.prisma.$transaction(async (tx) => {
      const stageChanged =
        dto.stage !== undefined && dto.stage !== existing.stage;
      const row = await tx.crmOpportunity.update({
        where: { id },
        data: this.opportunityData(dto, ownerId, existing),
        include: opportunityInclude,
      });
      const action =
        row.stage === "WON" && stageChanged
          ? "CRM_OPPORTUNITY_WON"
          : row.stage === "LOST" && stageChanged
            ? "CRM_OPPORTUNITY_LOST"
            : stageChanged
              ? "CRM_OPPORTUNITY_STAGE_CHANGED"
              : "CRM_OPPORTUNITY_UPDATED";
      await tx.auditLog.create({
        data: {
          action,
          actorUserId: p.userId,
          entityType: "CrmOpportunity",
          entityId: id,
          metadata: {
            fields: Object.keys(dto).filter((key) => key !== "description"),
            previousStage: existing.stage,
            stage: row.stage,
          },
        },
      });
      if (
        dto.ownerEmployeeId !== undefined &&
        row.ownerEmployeeId !== existing.ownerEmployeeId
      )
        await this.notifyAssignment(
          tx,
          owner,
          "CRM_OPPORTUNITY_ASSIGNED",
          "Opportunity assigned",
          `You now own ${row.name}.`,
          "CrmOpportunity",
          row.id,
          p.employeeId,
        );
      return row;
    });
  }
  private async relations(organizationId: string, dto: OpportunityDto) {
    await Promise.all([
      this.account(organizationId, dto.accountId),
      this.contact(organizationId, dto.primaryContactId),
      this.lead(organizationId, dto.sourceLeadId),
    ]);
    if (dto.accountId && dto.primaryContactId) {
      const contact = await this.contact(organizationId, dto.primaryContactId);
      if (contact?.accountId && contact.accountId !== dto.accountId)
        throw new BadRequestException(
          "Primary contact does not belong to this account",
        );
    }
  }
  private opportunityData(
    dto: OpportunityDto,
    ownerEmployeeId?: string,
    existing?: { stage: CrmOpportunityStage },
  ) {
    const stage = dto.stage;
    return this.clean({
      accountId: dto.accountId,
      primaryContactId: dto.primaryContactId,
      sourceLeadId: dto.sourceLeadId,
      name: dto.name?.trim(),
      description: dto.description?.trim(),
      stage,
      estimatedValue: dto.estimatedValue,
      currency:
        dto.currency === undefined ? undefined : this.currency(dto.currency),
      expectedCloseDate:
        dto.expectedCloseDate === undefined
          ? undefined
          : this.date(dto.expectedCloseDate),
      ownerEmployeeId,
      lostReason: dto.lostReason?.trim(),
      closedAt:
        stage === "WON" || stage === "LOST"
          ? new Date()
          : stage && existing && ["WON", "LOST"].includes(existing.stage)
            ? null
            : undefined,
    });
  }

  async listActivities(p: Principal, q: ActivityQueryDto) {
    this.read(p, "crm.activities.read");
    const organizationId = this.org(p);
    await Promise.all([
      this.lead(organizationId, q.leadId),
      this.account(organizationId, q.accountId),
      this.contact(organizationId, q.contactId),
      this.opportunity(organizationId, q.opportunityId),
    ]);
    const ownerEmployeeId = this.ownId(p, q.ownerEmployeeId);
    const page = this.page(q);
    const where: Prisma.CrmActivityWhereInput = {
      organizationId,
      ...(ownerEmployeeId ? { ownerEmployeeId } : {}),
      ...(q.leadId ? { leadId: q.leadId } : {}),
      ...(q.accountId ? { accountId: q.accountId } : {}),
      ...(q.contactId ? { contactId: q.contactId } : {}),
      ...(q.opportunityId ? { opportunityId: q.opportunityId } : {}),
      ...(q.type ? { type: q.type } : {}),
      ...(q.completed === undefined
        ? {}
        : q.completed
          ? { completedAt: { not: null } }
          : { completedAt: null }),
      ...(q.from || q.to
        ? {
            dueAt: {
              ...(q.from ? { gte: this.date(q.from) } : {}),
              ...(q.to ? { lte: this.date(q.to) } : {}),
            },
          }
        : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.crmActivity.count({ where }),
      this.prisma.crmActivity.findMany({
        where,
        include: activityInclude,
        orderBy: { dueAt: "asc" },
        skip: page.skip,
        take: page.take,
      }),
    ]);
    return { data, meta: page.meta(total) };
  }
  async createActivity(p: Principal, dto: ActivityDto) {
    this.manage(p, "crm.activities.manage");
    if (!dto.subject?.trim())
      throw new BadRequestException("Activity subject is required");
    const organizationId = this.org(p);
    await Promise.all([
      this.lead(organizationId, dto.leadId),
      this.account(organizationId, dto.accountId),
      this.contact(organizationId, dto.contactId),
      this.opportunity(organizationId, dto.opportunityId),
    ]);
    const ownerId =
      this.ownId(p, dto.ownerEmployeeId) ?? p.employeeId ?? undefined;
    await this.employee(organizationId, ownerId);
    const row = await this.prisma.crmActivity.create({
      data: {
        organizationId,
        type: dto.type ?? "NOTE",
        leadId: dto.leadId,
        accountId: dto.accountId,
        contactId: dto.contactId,
        opportunityId: dto.opportunityId,
        ownerEmployeeId: ownerId,
        subject: dto.subject.trim(),
        description: dto.description?.trim(),
        occurredAt: this.date(dto.occurredAt),
        dueAt: this.date(dto.dueAt),
        createdByUserId: p.userId,
      },
      include: activityInclude,
    });
    await this.audit.record({
      action: "CRM_ACTIVITY_CREATED",
      actorUserId: p.userId,
      entityType: "CrmActivity",
      entityId: row.id,
      metadata: {
        type: row.type,
        leadId: row.leadId,
        accountId: row.accountId,
        opportunityId: row.opportunityId,
      },
    });
    return row;
  }
  async updateActivity(p: Principal, id: string, dto: ActivityDto) {
    this.manage(p, "crm.activities.manage");
    const organizationId = this.org(p);
    const existing = await this.prisma.crmActivity.findFirst({
      where: {
        id,
        organizationId,
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!existing) throw new NotFoundException("Activity not found");
    await Promise.all([
      this.lead(organizationId, dto.leadId),
      this.account(organizationId, dto.accountId),
      this.contact(organizationId, dto.contactId),
      this.opportunity(organizationId, dto.opportunityId),
    ]);
    if (
      dto.ownerEmployeeId !== undefined &&
      dto.ownerEmployeeId !== existing.ownerEmployeeId
    )
      this.assign(p);
    const ownerId =
      dto.ownerEmployeeId === undefined
        ? undefined
        : this.ownId(p, dto.ownerEmployeeId);
    await this.employee(organizationId, ownerId);
    const row = await this.prisma.crmActivity.update({
      where: { id },
      data: this.clean({
        type: dto.type,
        leadId: dto.leadId,
        accountId: dto.accountId,
        contactId: dto.contactId,
        opportunityId: dto.opportunityId,
        ownerEmployeeId: ownerId,
        subject: dto.subject?.trim(),
        description: dto.description?.trim(),
        occurredAt:
          dto.occurredAt === undefined ? undefined : this.date(dto.occurredAt),
        dueAt: dto.dueAt === undefined ? undefined : this.date(dto.dueAt),
      }),
      include: activityInclude,
    });
    await this.audit.record({
      action: "CRM_ACTIVITY_UPDATED",
      actorUserId: p.userId,
      entityType: "CrmActivity",
      entityId: id,
      metadata: {
        fields: Object.keys(dto).filter((key) => key !== "description"),
      },
    });
    return row;
  }
  async completeActivity(p: Principal, id: string) {
    this.manage(p, "crm.activities.manage");
    const row = await this.prisma.crmActivity.findFirst({
      where: {
        id,
        organizationId: this.org(p),
        ...(this.scoped(p) ? { ownerEmployeeId: p.employeeId } : {}),
      },
    });
    if (!row) throw new NotFoundException("Activity not found");
    if (row.completedAt)
      throw new ConflictException("Activity is already complete");
    const completed = await this.prisma.crmActivity.update({
      where: { id },
      data: { completedAt: new Date() },
      include: activityInclude,
    });
    await this.audit.record({
      action: "CRM_ACTIVITY_COMPLETED",
      actorUserId: p.userId,
      entityType: "CrmActivity",
      entityId: id,
    });
    return completed;
  }

  async dashboard(p: Principal) {
    this.read(p, "crm.dashboard.read");
    if (this.scoped(p))
      throw new ForbiddenException("CRM executive dashboard access denied");
    const organizationId = this.org(p);
    const now = new Date();
    const openStages: CrmOpportunityStage[] = [
      "PROSPECTING",
      "QUALIFICATION",
      "PROPOSAL",
      "NEGOTIATION",
    ];
    const [leadStatus, leadSource, opportunityStage, activities, recent] =
      await Promise.all([
        this.prisma.crmLead.groupBy({
          by: ["status"],
          where: { organizationId },
          _count: { _all: true },
        }),
        this.prisma.crmLead.groupBy({
          by: ["source"],
          where: { organizationId },
          _count: { _all: true },
        }),
        this.prisma.crmOpportunity.groupBy({
          by: ["stage", "currency"],
          where: { organizationId, archivedAt: null },
          _count: { _all: true },
          _sum: { estimatedValue: true },
        }),
        this.prisma.crmActivity.findMany({
          where: { organizationId, completedAt: null, dueAt: { not: null } },
          include: activityInclude,
          orderBy: { dueAt: "asc" },
          take: 20,
        }),
        this.prisma.crmActivity.findMany({
          where: { organizationId },
          include: activityInclude,
          orderBy: { updatedAt: "desc" },
          take: 12,
        }),
      ]);
    const stageSummary = opportunityStage.map((item) => ({
      stage: item.stage,
      currency: item.currency ?? "UNSPECIFIED",
      count: item._count._all,
      estimatedValue: item._sum.estimatedValue?.toString() ?? "0",
    }));
    const byStatus = Object.fromEntries(
      leadStatus.map((item) => [item.status, item._count._all]),
    );
    const bySource = Object.fromEntries(
      leadSource.map((item) => [item.source, item._count._all]),
    );
    return {
      leadCounts: byStatus,
      leadSources: bySource,
      openLeads:
        (byStatus.NEW ?? 0) +
        (byStatus.CONTACTED ?? 0) +
        (byStatus.QUALIFIED ?? 0),
      qualifiedLeads: byStatus.QUALIFIED ?? 0,
      convertedLeads: byStatus.CONVERTED ?? 0,
      opportunityStages: stageSummary,
      openOpportunityCount: stageSummary
        .filter((item) => openStages.includes(item.stage))
        .reduce((sum, item) => sum + item.count, 0),
      wonCount: stageSummary
        .filter((item) => item.stage === "WON")
        .reduce((sum, item) => sum + item.count, 0),
      lostCount: stageSummary
        .filter((item) => item.stage === "LOST")
        .reduce((sum, item) => sum + item.count, 0),
      pipelineByCurrency: stageSummary
        .filter((item) => openStages.includes(item.stage))
        .reduce<Record<string, string>>(
          (totals, item) => ({
            ...totals,
            [item.currency]: (
              Number(totals[item.currency] ?? 0) + Number(item.estimatedValue)
            ).toFixed(2),
          }),
          {},
        ),
      wonByCurrency: stageSummary
        .filter((item) => item.stage === "WON")
        .reduce<Record<string, string>>(
          (totals, item) => ({
            ...totals,
            [item.currency]: (
              Number(totals[item.currency] ?? 0) + Number(item.estimatedValue)
            ).toFixed(2),
          }),
          {},
        ),
      upcomingFollowUps: activities.filter(
        (activity) => activity.dueAt && activity.dueAt >= now,
      ),
      overdueFollowUps: activities.filter(
        (activity) => activity.dueAt && activity.dueAt < now,
      ),
      recentActivities: recent,
    };
  }
}
