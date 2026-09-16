import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { EmploymentStatus, Prisma } from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { AuthorizationPolicy } from "../auth/policies/authorization.policy";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { PrismaService } from "../prisma/prisma.service";
import { EmployeeQueryDto } from "./dto/employee-query.dto";
import { UpdateSelfDto } from "./dto/update-self.dto";

const employeeInclude = {
  department: true,
  division: true,
  manager: true,
  user: { include: { roles: { include: { role: true } } } },
} satisfies Prisma.EmployeeInclude;

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: AuthorizationPolicy,
    private readonly auditService: AuditService,
  ) {}

  async getMe(principal: Principal) {
    if (!principal.employeeId) throw new NotFoundException("Employee profile not found");
    const employee = await this.prisma.employee.findUnique({
      where: { id: principal.employeeId },
      include: employeeInclude,
    });
    if (!employee) throw new NotFoundException("Employee profile not found");
    return this.toResponse(employee, false);
  }

  async getById(principal: Principal, id: string) {
    const target = await this.prisma.employee.findUnique({
      where: { id },
      select: { id: true, divisionId: true },
    });
    if (!target) throw new NotFoundException("Employee not found");
    if (!this.policy.canReadEmployee(principal, target))
      throw new ForbiddenException("Employee access denied");
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: employeeInclude,
    });
    if (!employee) throw new NotFoundException("Employee not found");
    const restricted = principal.employeeId !== id && principal.roles.includes("EMPLOYEE");
    return this.toResponse(employee, restricted);
  }

  async list(principal: Principal, query: EmployeeQueryDto) {
    if (!this.policy.canListEmployees(principal, query.divisionId)) {
      throw new ForbiddenException("Employee directory access denied");
    }
    const organizationWide = this.policy.isOrganizationWide(principal);
    const divisionId = organizationWide ? query.divisionId : principal.divisionId;
    const search = query.search?.trim();
    const where: Prisma.EmployeeWhereInput = {
      divisionId,
      departmentId: query.departmentId,
      employmentStatus: query.status ?? EmploymentStatus.ACTIVE,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { employeeCode: { contains: search, mode: "insensitive" } },
              { designation: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [total, employees] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        include: employeeInclude,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip,
        take: query.limit,
      }),
    ]);
    const restricted = principal.roles.includes("EMPLOYEE");
    return {
      data: employees.map((employee) => this.toResponse(employee, restricted)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async updateMe(principal: Principal, dto: UpdateSelfDto, request: RequestMetadata) {
    if (!principal.employeeId) throw new NotFoundException("Employee profile not found");
    const employee = await this.prisma.employee.update({
      where: { id: principal.employeeId },
      data: { phone: dto.phone, profilePhotoUrl: dto.profilePhotoUrl },
      include: employeeInclude,
    });
    await this.auditService.record({
      action: "EMPLOYEE_PROFILE_UPDATED",
      actorUserId: principal.userId,
      entityType: "Employee",
      entityId: employee.id,
      metadata: { fields: Object.keys(dto) },
      request,
    });
    return this.toResponse(employee, false);
  }

  private toResponse(
    employee: Prisma.EmployeeGetPayload<{ include: typeof employeeInclude }>,
    restricted: boolean,
  ) {
    const manager = employee.manager
      ? {
          id: employee.manager.id,
          employeeCode: employee.manager.employeeCode,
          name: `${employee.manager.firstName} ${employee.manager.lastName}`.trim(),
          designation: employee.manager.designation,
        }
      : null;
    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.user.email,
      ...(restricted
        ? {}
        : {
            phone: employee.phone,
            joiningDate: employee.joiningDate,
            profilePhotoUrl: employee.profilePhotoUrl,
          }),
      designation: employee.designation,
      employmentStatus: employee.employmentStatus,
      division: employee.division
        ? { id: employee.division.id, slug: employee.division.slug, name: employee.division.name }
        : null,
      department: employee.department
        ? {
            id: employee.department.id,
            slug: employee.department.slug,
            name: employee.department.name,
          }
        : null,
      manager,
      roles: employee.user.roles.map(({ role }) => role.name),
    };
  }
}
