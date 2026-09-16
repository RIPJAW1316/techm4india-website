import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { Principal } from "../auth/auth.types";
import { AuthorizationPolicy } from "../auth/policies/authorization.policy";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: AuthorizationPolicy,
  ) {}

  async getMyOrganization(principal: Principal) {
    if (!principal.employeeId) throw new NotFoundException("Organization context not found");
    const employee = await this.prisma.employee.findUnique({
      where: { id: principal.employeeId },
      include: { division: { include: { organization: true } }, department: true },
    });
    if (!employee?.division || !employee.department) {
      throw new NotFoundException("Organization context not found");
    }
    return {
      organization: {
        id: employee.division.organization.id,
        name: employee.division.organization.legalName,
      },
      division: {
        id: employee.division.id,
        slug: employee.division.slug,
        name: employee.division.name,
      },
      department: {
        id: employee.department.id,
        slug: employee.department.slug,
        name: employee.department.name,
      },
    };
  }

  async listDivisions(principal: Principal) {
    const canReadAll =
      this.policy.isOrganizationWide(principal) &&
      principal.permissions.includes("organization.read_all");
    const divisions = await this.prisma.division.findMany({
      where: {
        status: "ACTIVE",
        ...(canReadAll
          ? {}
          : { id: principal.divisionId ?? "00000000-0000-0000-0000-000000000000" }),
      },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, status: true, organizationId: true },
    });
    return divisions.map(({ organizationId: _organizationId, ...division }) => division);
  }

  async getDivision(principal: Principal, id: string) {
    if (!this.policy.canReadDivision(principal, id)) {
      throw new ForbiddenException("Division access denied");
    }
    const division = await this.prisma.division.findFirst({
      where: { id, status: "ACTIVE" },
      select: { id: true, slug: true, name: true, status: true },
    });
    if (!division) throw new NotFoundException("Division not found");
    return division;
  }

  async listDepartments(principal: Principal, divisionId: string) {
    if (!this.policy.canReadDepartment(principal, divisionId)) {
      throw new ForbiddenException("Department access denied");
    }
    return this.prisma.department.findMany({
      where: { divisionId, status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, divisionId: true, slug: true, name: true, status: true },
    });
  }
}
