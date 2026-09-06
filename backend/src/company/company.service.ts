import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TeamMemberRole } from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { AuthorizationPolicy } from "../auth/policies/authorization.policy";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateCompanyProfileDto } from "./dto/company-profile.dto";
import { BranchQueryDto, CreateBranchDto, UpdateBranchDto } from "./dto/branch.dto";
import { CostCentreQueryDto, CreateCostCentreDto, UpdateCostCentreDto } from "./dto/cost-centre.dto";
import { StructureQueryDto } from "./dto/structure-query.dto";
import { AddTeamMemberDto, CreateTeamDto, TeamQueryDto, UpdateTeamDto } from "./dto/team.dto";

const profileFields = {
  id: true, legalName: true, slug: true, displayName: true, tradeName: true,
  cin: true, dpiitNumber: true, gstin: true, pan: true, tan: true,
  registeredAddressLine1: true, registeredAddressLine2: true, registeredCity: true,
  registeredState: true, registeredPostalCode: true, registeredCountry: true,
  website: true, officialEmail: true, officialPhone: true, mission: true, vision: true,
  companyValues: true, logoUrl: true, status: true, createdAt: true, updatedAt: true,
} satisfies Prisma.OrganizationSelect;

const branchSelect = {
  id: true, code: true, name: true, type: true, addressLine1: true, addressLine2: true,
  city: true, state: true, postalCode: true, country: true, email: true, phone: true,
  isActive: true, createdAt: true, updatedAt: true,
} satisfies Prisma.BranchSelect;

const teamSelect = {
  id: true, code: true, name: true, description: true, isActive: true,
  division: { select: { id: true, name: true, slug: true } },
  department: { select: { id: true, name: true, slug: true } },
  leadEmployee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
  _count: { select: { members: { where: { removedAt: null } } } },
  createdAt: true, updatedAt: true,
} satisfies Prisma.TeamSelect;

const costCentreSelect = {
  id: true, code: true, name: true, description: true, isActive: true,
  division: { select: { id: true, name: true, slug: true } },
  department: { select: { id: true, name: true, slug: true } },
  createdAt: true, updatedAt: true,
} satisfies Prisma.CostCentreSelect;

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: AuthorizationPolicy,
    private readonly audit: AuditService,
  ) {}

  async getProfile(principal: Principal) {
    const organization = await this.prisma.organization.findUnique({ where: { id: await this.organizationId(principal) }, select: profileFields });
    if (!organization) throw new NotFoundException("Company profile not found");
    return this.profileResponse(organization, this.canViewSensitive(principal));
  }

  async updateProfile(principal: Principal, dto: UpdateCompanyProfileDto, request: RequestMetadata) {
    const organizationId = await this.organizationId(principal);
    try {
      const organization = await this.prisma.organization.update({ where: { id: organizationId }, data: dto, select: profileFields });
      await this.audit.record({ action: "COMPANY_PROFILE_UPDATED", actorUserId: principal.userId, entityType: "Organization", entityId: organization.id, metadata: { fields: Object.keys(dto) }, request });
      return this.profileResponse(organization, true);
    } catch (error) {
      this.rethrowKnown(error);
    }
  }

  async divisions(principal: Principal, query: StructureQueryDto) {
    const organizationId = await this.organizationId(principal);
    const divisionId = this.divisionScope(principal, query.divisionId);
    return this.prisma.division.findMany({
      where: { organizationId, status: "ACTIVE", ...(divisionId ? { id: divisionId } : {}) },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, status: true, createdAt: true, updatedAt: true, _count: { select: { departments: true, employees: true } } },
    });
  }

  async departments(principal: Principal, query: StructureQueryDto) {
    const organizationId = await this.organizationId(principal);
    const divisionId = this.divisionScope(principal, query.divisionId);
    return this.prisma.department.findMany({
      where: { division: { organizationId }, status: "ACTIVE", ...(divisionId ? { divisionId } : {}) },
      orderBy: { name: "asc" },
      select: { id: true, divisionId: true, slug: true, name: true, status: true, createdAt: true, updatedAt: true, _count: { select: { employees: true } } },
    });
  }

  async branches(principal: Principal, query: BranchQueryDto) {
    const organizationId = await this.organizationId(principal);
    const search = query.search?.trim();
    const where: Prisma.BranchWhereInput = {
      organizationId, type: query.type, isActive: query.isActive,
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }, { city: { contains: search, mode: "insensitive" } }] } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.branch.count({ where }),
      this.prisma.branch.findMany({ where, select: branchSelect, orderBy: [{ isActive: "desc" }, { name: "asc" }], skip: (query.page - 1) * query.limit, take: query.limit }),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async branch(principal: Principal, id: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id, organizationId: await this.organizationId(principal) }, select: branchSelect });
    if (!branch) throw new NotFoundException("Branch not found");
    return branch;
  }

  async createBranch(principal: Principal, dto: CreateBranchDto, request: RequestMetadata) {
    const organizationId = await this.organizationId(principal);
    try {
      const branch = await this.prisma.branch.create({ data: { ...dto, organizationId }, select: branchSelect });
      await this.audit.record({ action: "BRANCH_CREATED", actorUserId: principal.userId, entityType: "Branch", entityId: branch.id, metadata: { fields: Object.keys(dto), organizationId }, request });
      return branch;
    } catch (error) { this.rethrowKnown(error); }
  }

  async updateBranch(principal: Principal, id: string, dto: UpdateBranchDto, request: RequestMetadata) {
    await this.requireBranch(principal, id);
    try {
      const branch = await this.prisma.branch.update({ where: { id }, data: dto, select: branchSelect });
      await this.audit.record({ action: "BRANCH_UPDATED", actorUserId: principal.userId, entityType: "Branch", entityId: branch.id, metadata: { fields: Object.keys(dto) }, request });
      return branch;
    } catch (error) { this.rethrowKnown(error); }
  }

  async costCentres(principal: Principal, query: CostCentreQueryDto) {
    const organizationId = await this.organizationId(principal);
    const where: Prisma.CostCentreWhereInput = { organizationId, divisionId: query.divisionId, departmentId: query.departmentId, isActive: query.isActive, ...this.structureScopeFilter(principal) };
    const search = query.search?.trim();
    if (search) where.OR = [{ code: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }];
    const [total, data] = await this.prisma.$transaction([
      this.prisma.costCentre.count({ where }),
      this.prisma.costCentre.findMany({ where, select: costCentreSelect, orderBy: [{ isActive: "desc" }, { name: "asc" }], skip: (query.page - 1) * query.limit, take: query.limit }),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async costCentre(principal: Principal, id: string) {
    const costCentre = await this.prisma.costCentre.findFirst({ where: { id, organizationId: await this.organizationId(principal), ...this.structureScopeFilter(principal) }, select: costCentreSelect });
    if (!costCentre) throw new NotFoundException("Cost centre not found");
    return costCentre;
  }

  async createCostCentre(principal: Principal, dto: CreateCostCentreDto, request: RequestMetadata) {
    const organizationId = await this.organizationId(principal);
    const placement = await this.validatePlacement(organizationId, dto.divisionId, dto.departmentId);
    try {
      const costCentre = await this.prisma.costCentre.create({ data: { ...dto, ...placement, organizationId }, select: costCentreSelect });
      await this.audit.record({ action: "COST_CENTRE_CREATED", actorUserId: principal.userId, entityType: "CostCentre", entityId: costCentre.id, metadata: { fields: Object.keys(dto), organizationId }, request });
      return costCentre;
    } catch (error) { this.rethrowKnown(error); }
  }

  async updateCostCentre(principal: Principal, id: string, dto: UpdateCostCentreDto, request: RequestMetadata) {
    const current = await this.prisma.costCentre.findFirst({ where: { id, organizationId: await this.organizationId(principal) } });
    if (!current) throw new NotFoundException("Cost centre not found");
    const placement = await this.validatePlacement(current.organizationId, dto.divisionId ?? current.divisionId ?? undefined, dto.departmentId ?? current.departmentId ?? undefined);
    try {
      const costCentre = await this.prisma.costCentre.update({ where: { id }, data: { ...dto, ...placement }, select: costCentreSelect });
      await this.audit.record({ action: "COST_CENTRE_UPDATED", actorUserId: principal.userId, entityType: "CostCentre", entityId: costCentre.id, metadata: { fields: Object.keys(dto) }, request });
      return costCentre;
    } catch (error) { this.rethrowKnown(error); }
  }

  async teams(principal: Principal, query: TeamQueryDto) {
    const organizationId = await this.organizationId(principal);
    const where: Prisma.TeamWhereInput = { organizationId, divisionId: query.divisionId, departmentId: query.departmentId, isActive: query.isActive, ...this.structureScopeFilter(principal) };
    const search = query.search?.trim();
    if (search) where.OR = [{ code: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }];
    const [total, data] = await this.prisma.$transaction([
      this.prisma.team.count({ where }),
      this.prisma.team.findMany({ where, select: teamSelect, orderBy: [{ isActive: "desc" }, { name: "asc" }], skip: (query.page - 1) * query.limit, take: query.limit }),
    ]);
    return { data: data.map((team) => this.teamResponse(team)), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async team(principal: Principal, id: string) {
    const team = await this.prisma.team.findFirst({ where: { id, organizationId: await this.organizationId(principal), ...this.structureScopeFilter(principal) }, select: teamSelect });
    if (!team) throw new NotFoundException("Team not found");
    return this.teamResponse(team);
  }

  async createTeam(principal: Principal, dto: CreateTeamDto, request: RequestMetadata) {
    const organizationId = await this.organizationId(principal);
    const placement = await this.validatePlacement(organizationId, dto.divisionId, dto.departmentId);
    await this.validateLead(organizationId, dto.leadEmployeeId);
    try {
      const team = await this.prisma.team.create({ data: { ...dto, ...placement, organizationId }, select: teamSelect });
      await this.audit.record({ action: "TEAM_CREATED", actorUserId: principal.userId, entityType: "Team", entityId: team.id, metadata: { fields: Object.keys(dto), organizationId }, request });
      return this.teamResponse(team);
    } catch (error) { this.rethrowKnown(error); }
  }

  async updateTeam(principal: Principal, id: string, dto: UpdateTeamDto, request: RequestMetadata) {
    const current = await this.prisma.team.findFirst({ where: { id, organizationId: await this.organizationId(principal) } });
    if (!current) throw new NotFoundException("Team not found");
    const placement = await this.validatePlacement(current.organizationId, dto.divisionId ?? current.divisionId ?? undefined, dto.departmentId ?? current.departmentId ?? undefined);
    await this.validateLead(current.organizationId, dto.leadEmployeeId);
    try {
      const team = await this.prisma.team.update({ where: { id }, data: { ...dto, ...placement }, select: teamSelect });
      await this.audit.record({ action: "TEAM_UPDATED", actorUserId: principal.userId, entityType: "Team", entityId: team.id, metadata: { fields: Object.keys(dto) }, request });
      return this.teamResponse(team);
    } catch (error) { this.rethrowKnown(error); }
  }

  async members(principal: Principal, teamId: string) {
    const team = await this.requireTeam(principal, teamId);
    const members = await this.prisma.teamMember.findMany({ where: { teamId: team.id }, orderBy: [{ removedAt: "asc" }, { joinedAt: "desc" }], select: { id: true, role: true, joinedAt: true, removedAt: true, employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, designation: true, employmentStatus: true, division: { select: { id: true, name: true, slug: true } }, department: { select: { id: true, name: true, slug: true } } } } } });
    return members;
  }

  async addMember(principal: Principal, teamId: string, dto: AddTeamMemberDto, request: RequestMetadata) {
    const team = await this.requireTeam(principal, teamId);
    const employee = await this.prisma.employee.findFirst({ where: { id: dto.employeeId, division: { organizationId: team.organizationId } }, select: { id: true } });
    if (!employee) throw new NotFoundException("Employee not found in this organization");
    const active = await this.prisma.teamMember.findFirst({ where: { teamId, employeeId: dto.employeeId, removedAt: null } });
    if (active) throw new ConflictException("Employee is already an active team member");
    const member = await this.prisma.teamMember.create({ data: { teamId, employeeId: dto.employeeId, role: dto.role ?? TeamMemberRole.MEMBER }, include: { employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true, designation: true } } } });
    await this.audit.record({ action: "TEAM_MEMBER_ADDED", actorUserId: principal.userId, entityType: "TeamMember", entityId: member.id, metadata: { teamId, employeeId: dto.employeeId, role: member.role }, request });
    return member;
  }

  async removeMember(principal: Principal, teamId: string, employeeId: string, request: RequestMetadata) {
    const team = await this.requireTeam(principal, teamId);
    const member = await this.prisma.teamMember.findFirst({ where: { teamId: team.id, employeeId, removedAt: null } });
    if (!member) throw new NotFoundException("Active team membership not found");
    const updated = await this.prisma.teamMember.update({ where: { id: member.id }, data: { removedAt: new Date() } });
    await this.audit.record({ action: "TEAM_MEMBER_REMOVED", actorUserId: principal.userId, entityType: "TeamMember", entityId: updated.id, metadata: { teamId, employeeId }, request });
    return updated;
  }

  private async organizationId(principal: Principal) {
    if (principal.organizationId) return principal.organizationId;
    if (principal.roles.includes("SUPER_ADMIN")) {
      const organization = await this.prisma.organization.findFirst({ where: { status: "ACTIVE" }, select: { id: true } });
      if (organization) return organization.id;
    }
    throw new ForbiddenException("Organization context required");
  }

  private divisionScope(principal: Principal, requested?: string) {
    if (principal.roles.includes("DIVISION_HEAD") && !this.policy.isOrganizationWide(principal)) {
      if (requested && requested !== principal.divisionId) throw new ForbiddenException("Division structure access denied");
      return principal.divisionId ?? "00000000-0000-0000-0000-000000000000";
    }
    return requested;
  }

  private structureScopeFilter(principal: Principal): Prisma.TeamWhereInput & Prisma.CostCentreWhereInput {
    if (principal.roles.includes("DIVISION_HEAD") && !this.policy.isOrganizationWide(principal)) {
      const divisionId = principal.divisionId ?? "00000000-0000-0000-0000-000000000000";
      return { OR: [{ divisionId }, { department: { divisionId } }] };
    }
    return {};
  }

  private async validatePlacement(organizationId: string, divisionId?: string, departmentId?: string) {
    if (!divisionId && !departmentId) return { divisionId: null, departmentId: null };
    const department = departmentId ? await this.prisma.department.findUnique({ where: { id: departmentId }, select: { id: true, divisionId: true, division: { select: { organizationId: true } } } }) : null;
    if (departmentId && (!department || department.division.organizationId !== organizationId)) throw new BadRequestException("Department does not belong to this organization");
    const resolvedDivisionId = divisionId ?? department?.divisionId;
    if (resolvedDivisionId) {
      const division = await this.prisma.division.findUnique({ where: { id: resolvedDivisionId }, select: { id: true, organizationId: true } });
      if (!division || division.organizationId !== organizationId) throw new BadRequestException("Division does not belong to this organization");
      if (department && department.divisionId !== division.id) throw new BadRequestException("Department does not belong to the selected division");
    }
    return { divisionId: resolvedDivisionId ?? null, departmentId: department?.id ?? departmentId ?? null };
  }

  private async validateLead(organizationId: string, employeeId?: string) {
    if (!employeeId) return;
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, division: { organizationId } }, select: { id: true } });
    if (!employee) throw new BadRequestException("Team lead does not belong to this organization");
  }

  private async requireBranch(principal: Principal, id: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id, organizationId: await this.organizationId(principal) } });
    if (!branch) throw new NotFoundException("Branch not found");
    return branch;
  }

  private async requireTeam(principal: Principal, id: string) {
    const team = await this.prisma.team.findFirst({ where: { id, organizationId: await this.organizationId(principal), ...this.structureScopeFilter(principal) } });
    if (!team) throw new NotFoundException("Team not found");
    return team;
  }

  private canViewSensitive(principal: Principal) {
    return principal.roles.includes("FOUNDER_CEO") || principal.roles.includes("SUPER_ADMIN");
  }

  private profileResponse(profile: Prisma.OrganizationGetPayload<{ select: typeof profileFields }>, sensitive: boolean) {
    const { cin, dpiitNumber, gstin, pan, tan, ...safe } = profile;
    return { ...safe, identifiers: sensitive ? { cin, dpiitNumber, gstin, pan, tan } : { cin: null, dpiitNumber: null, gstin: null, pan: null, tan: null } };
  }

  private teamResponse(team: Prisma.TeamGetPayload<{ select: typeof teamSelect }>) {
    return { ...team, memberCount: team._count.members, _count: undefined };
  }

  private rethrowKnown(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictException("A record with this organization code already exists");
    throw error;
  }
}
