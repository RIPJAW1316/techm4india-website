import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  EmploymentHistoryEventType,
  EmploymentStatus,
  EmploymentType,
  Prisma,
} from "@prisma/client";
import argon2 from "argon2";
import { randomBytes } from "crypto";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateEmployeeAddressDto,
  CreateEmployeeCertificationDto,
  CreateEmployeeEducationDto,
  CreateEmployeeSkillDto,
  CreateEmergencyContactDto,
  CreateHrEmployeeDto,
  ExitEmployeeDto,
  HrEmployeeQueryDto,
  UpdateEmployeeAddressDto,
  UpdateEmployeeCertificationDto,
  UpdateEmployeeEducationDto,
  UpdateEmployeeSkillDto,
  UpdateEmergencyContactDto,
  UpdateHrEmployeeDto,
} from "./dto/hr.dto";

const hrDetailInclude = {
  user: {
    select: {
      id: true,
      email: true,
      status: true,
      roles: { include: { role: { select: { name: true } } } },
    },
  },
  division: {
    select: { id: true, name: true, slug: true, organizationId: true },
  },
  department: {
    select: { id: true, name: true, slug: true, divisionId: true },
  },
  branch: {
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      city: true,
      state: true,
    },
  },
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
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      designation: true,
      employmentStatus: true,
    },
  },
  teamMemberships: {
    where: { removedAt: null },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      team: { select: { id: true, code: true, name: true } },
    },
  },
  addresses: {
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
  },
  emergencyContacts: {
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
  },
  skills: { orderBy: { name: "asc" as const } },
  certifications: { orderBy: { issuedAt: "desc" as const } },
  education: { orderBy: { endDate: "desc" as const } },
  employmentHistory: {
    orderBy: [
      { effectiveDate: "desc" as const },
      { createdAt: "desc" as const },
    ],
  },
  _count: { select: { directReports: true } },
} satisfies Prisma.EmployeeInclude;

type HrEmployeeDetail = Prisma.EmployeeGetPayload<{
  include: typeof hrDetailInclude;
}>;

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(principal: Principal, query: HrEmployeeQueryDto) {
    this.assertReadList(principal);
    const organizationId = this.requireOrganization(principal);
    const where: Prisma.EmployeeWhereInput = {
      division: { organizationId },
      ...(this.isDivisionScoped(principal)
        ? { divisionId: principal.divisionId }
        : {}),
      ...(query.divisionId ? { divisionId: query.divisionId } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.managerId ? { managerEmployeeId: query.managerId } : {}),
      ...(query.designation
        ? {
            designation: {
              contains: query.designation.trim(),
              mode: "insensitive",
            },
          }
        : {}),
      ...(query.role
        ? { user: { roles: { some: { role: { name: query.role } } } } }
        : {}),
      ...(query.employmentType ? { employmentType: query.employmentType } : {}),
      ...(query.status ? { employmentStatus: query.status } : {}),
      ...(query.search?.trim()
        ? {
            OR: [
              {
                firstName: {
                  contains: query.search.trim(),
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query.search.trim(),
                  mode: "insensitive",
                },
              },
              {
                employeeCode: {
                  contains: query.search.trim(),
                  mode: "insensitive",
                },
              },
              {
                designation: {
                  contains: query.search.trim(),
                  mode: "insensitive",
                },
              },
              {
                user: {
                  email: { contains: query.search.trim(), mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };
    if (
      query.divisionId &&
      this.isDivisionScoped(principal) &&
      query.divisionId !== principal.divisionId
    )
      throw new ForbiddenException("Employee access denied");
    const skip = (query.page - 1) * query.limit;
    const orderBy: Prisma.EmployeeOrderByWithRelationInput[] =
      query.sortBy === "employeeCode"
        ? [{ employeeCode: query.sortOrder }]
        : query.sortBy === "joiningDate"
          ? [{ joiningDate: query.sortOrder }, { lastName: "asc" }]
          : [{ lastName: query.sortOrder }, { firstName: query.sortOrder }];
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          ...hrDetailInclude,
          addresses: false,
          emergencyContacts: false,
          skills: false,
          certifications: false,
          education: false,
          employmentHistory: false,
        },
      }),
    ]);
    return {
      data: rows.map((row) =>
        this.toResponse(
          row as HrEmployeeDetail,
          this.canReadPrivate(principal),
          false,
        ),
      ),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getById(principal: Principal, id: string) {
    const employee = await this.findEmployee(
      id,
      this.requireOrganization(principal),
    );
    this.assertReadTarget(principal, employee);
    return this.toResponse(employee, this.canReadPrivate(principal), true);
  }

  async create(
    principal: Principal,
    dto: CreateHrEmployeeDto,
    request: RequestMetadata,
  ) {
    this.assertManage(principal);
    const organizationId = this.requireOrganization(principal);
    await this.validateStructure(
      organizationId,
      dto.divisionId,
      dto.departmentId,
      dto.branchId,
    );
    if (dto.managerEmployeeId)
      await this.validateManager(organizationId, null, dto.managerEmployeeId);
    if (!dto.userId && !dto.officialEmail)
      throw new BadRequestException(
        "officialEmail is required when no existing user account is linked",
      );
    const joiningDate = this.date(dto.joiningDate);
    const confirmationDate = this.date(dto.confirmationDate);
    const probationEndDate = this.date(dto.probationEndDate);
    this.validateDates(joiningDate, confirmationDate, probationEndDate);
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        let userId = dto.userId;
        if (userId) {
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true, employee: { select: { id: true } } },
          });
          if (!user) throw new BadRequestException("User account not found");
          if (user.employee)
            throw new ConflictException("User already has an employee profile");
        } else {
          const passwordHash = await argon2.hash(
            randomBytes(32).toString("hex"),
            {
              type: argon2.argon2id,
              memoryCost: 19_456,
              parallelism: 1,
              timeCost: 2,
            },
          );
          const user = await tx.user.create({
            data: {
              email: dto.officialEmail!.trim().toLowerCase(),
              passwordHash,
              status: "INVITED",
            },
            select: { id: true },
          });
          userId = user.id;
        }
        const employee = await tx.employee.create({
          data: {
            userId: userId!,
            employeeCode: dto.employeeCode.trim(),
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            designation: this.clean(dto.designation),
            gradeText: this.clean(dto.gradeText),
            phone: this.clean(dto.phone),
            personalEmail: this.clean(dto.personalEmail),
            alternatePhone: this.clean(dto.alternatePhone),
            gender: this.clean(dto.gender),
            dateOfBirth: this.date(dto.dateOfBirth),
            nationality: this.clean(dto.nationality),
            bloodGroup: this.clean(dto.bloodGroup),
            profilePhotoUrl: this.clean(dto.profilePhotoUrl),
            biometricId: this.clean(dto.biometricId),
            joiningDate,
            confirmationDate,
            probationEndDate,
            employmentType: dto.employmentType ?? EmploymentType.FULL_TIME,
            divisionId: dto.divisionId,
            departmentId: dto.departmentId,
            branchId: dto.branchId,
            managerEmployeeId: dto.managerEmployeeId,
          },
        });
        await tx.employmentHistory.create({
          data: {
            employeeId: employee.id,
            eventType: EmploymentHistoryEventType.JOINED,
            effectiveDate: joiningDate ?? new Date(),
            summary: "Employee joined TechM4India",
            actorUserId: principal.userId,
            newValue: {
              employeeCode: employee.employeeCode,
              divisionId: dto.divisionId,
              departmentId: dto.departmentId,
            },
          },
        });
        await tx.auditLog.create({
          data: {
            action: "EMPLOYEE_CREATED",
            actorUserId: principal.userId,
            entityType: "Employee",
            entityId: employee.id,
            metadata: {
              employeeCode: employee.employeeCode,
              divisionId: dto.divisionId,
              departmentId: dto.departmentId,
            },
            ipAddress: request.ipAddress,
            userAgent: request.userAgent?.slice(0, 512),
          },
        });
        return employee;
      });
      return this.getById(principal, created.id);
    } catch (error) {
      if (this.isUnique(error))
        throw new ConflictException(
          "Employee code or official email already exists",
        );
      throw error;
    }
  }

  async update(
    principal: Principal,
    id: string,
    dto: UpdateHrEmployeeDto,
    request: RequestMetadata,
  ) {
    this.assertManage(principal);
    const organizationId = this.requireOrganization(principal);
    const current = await this.findEmployee(id, organizationId);
    await this.validateStructure(
      organizationId,
      dto.divisionId ?? current.divisionId ?? undefined,
      dto.departmentId ?? current.departmentId ?? undefined,
      dto.branchId === undefined
        ? (current.branchId ?? undefined)
        : dto.branchId,
    );
    if (dto.managerEmployeeId !== undefined)
      await this.validateManager(organizationId, id, dto.managerEmployeeId);
    const joiningDate =
      dto.joiningDate === undefined
        ? current.joiningDate
        : this.date(dto.joiningDate);
    const confirmationDate =
      dto.confirmationDate === undefined
        ? current.confirmationDate
        : this.date(dto.confirmationDate);
    const probationEndDate =
      dto.probationEndDate === undefined
        ? current.probationEndDate
        : this.date(dto.probationEndDate);
    this.validateDates(joiningDate, confirmationDate, probationEndDate);
    const changes = this.historyChanges(current, dto);
    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        if (dto.officialEmail !== undefined)
          await tx.user.update({
            where: { id: current.user.id },
            data: { email: dto.officialEmail.trim().toLowerCase() },
          });
        const employee = await tx.employee.update({
          where: { id },
          data: {
            ...(dto.employeeCode !== undefined
              ? { employeeCode: dto.employeeCode.trim() }
              : {}),
            ...(dto.firstName !== undefined
              ? { firstName: dto.firstName.trim() }
              : {}),
            ...(dto.lastName !== undefined
              ? { lastName: dto.lastName.trim() }
              : {}),
            ...(dto.designation !== undefined
              ? { designation: this.clean(dto.designation) }
              : {}),
            ...(dto.gradeText !== undefined
              ? { gradeText: this.clean(dto.gradeText) }
              : {}),
            ...(dto.phone !== undefined
              ? { phone: this.clean(dto.phone) }
              : {}),
            ...(dto.personalEmail !== undefined
              ? { personalEmail: this.clean(dto.personalEmail) }
              : {}),
            ...(dto.alternatePhone !== undefined
              ? { alternatePhone: this.clean(dto.alternatePhone) }
              : {}),
            ...(dto.gender !== undefined
              ? { gender: this.clean(dto.gender) }
              : {}),
            ...(dto.dateOfBirth !== undefined
              ? { dateOfBirth: this.date(dto.dateOfBirth) }
              : {}),
            ...(dto.nationality !== undefined
              ? { nationality: this.clean(dto.nationality) }
              : {}),
            ...(dto.bloodGroup !== undefined
              ? { bloodGroup: this.clean(dto.bloodGroup) }
              : {}),
            ...(dto.profilePhotoUrl !== undefined
              ? { profilePhotoUrl: this.clean(dto.profilePhotoUrl) }
              : {}),
            ...(dto.biometricId !== undefined
              ? { biometricId: this.clean(dto.biometricId) }
              : {}),
            ...(dto.joiningDate !== undefined ? { joiningDate } : {}),
            ...(dto.confirmationDate !== undefined ? { confirmationDate } : {}),
            ...(dto.probationEndDate !== undefined ? { probationEndDate } : {}),
            ...(dto.employmentType !== undefined
              ? { employmentType: dto.employmentType }
              : {}),
            ...(dto.employmentStatus !== undefined
              ? { employmentStatus: dto.employmentStatus }
              : {}),
            ...(dto.divisionId !== undefined
              ? { divisionId: dto.divisionId }
              : {}),
            ...(dto.departmentId !== undefined
              ? { departmentId: dto.departmentId }
              : {}),
            ...(dto.branchId !== undefined ? { branchId: dto.branchId } : {}),
            ...(dto.managerEmployeeId !== undefined
              ? { managerEmployeeId: dto.managerEmployeeId }
              : {}),
          },
        });
        for (const change of changes)
          await tx.employmentHistory.create({
            data: {
              employeeId: id,
              eventType: change.eventType,
              effectiveDate: new Date(),
              summary: change.summary,
              previousValue: { value: String(change.previous ?? "") },
              newValue: { value: String(change.next ?? "") },
              actorUserId: principal.userId,
            },
          });
        await tx.auditLog.create({
          data: {
            action: "EMPLOYEE_UPDATED",
            actorUserId: principal.userId,
            entityType: "Employee",
            entityId: id,
            metadata: { fields: changes.map((change) => change.field) },
            ipAddress: request.ipAddress,
            userAgent: request.userAgent?.slice(0, 512),
          },
        });
        return employee;
      });
      return this.getById(principal, updated.id);
    } catch (error) {
      if (this.isUnique(error))
        throw new ConflictException(
          "Employee code or official email already exists",
        );
      throw error;
    }
  }

  async exit(
    principal: Principal,
    id: string,
    dto: ExitEmployeeDto,
    request: RequestMetadata,
  ) {
    this.assertManage(principal);
    const employee = await this.findEmployee(
      id,
      this.requireOrganization(principal),
    );
    if (employee.employmentStatus === EmploymentStatus.EXITED)
      return this.toResponse(employee, this.canReadPrivate(principal), true);
    const effectiveDate = this.date(dto.effectiveDate) ?? new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.employee.update({
        where: { id },
        data: { employmentStatus: EmploymentStatus.EXITED },
      });
      await tx.employmentHistory.create({
        data: {
          employeeId: id,
          eventType: EmploymentHistoryEventType.EXITED,
          effectiveDate,
          summary: dto.reason?.trim() || "Employee exited TechM4India",
          previousValue: { status: employee.employmentStatus },
          newValue: { status: EmploymentStatus.EXITED },
          actorUserId: principal.userId,
        },
      });
      await tx.auditLog.create({
        data: {
          action: "EMPLOYEE_EXITED",
          actorUserId: principal.userId,
          entityType: "Employee",
          entityId: id,
          metadata: { effectiveDate: effectiveDate.toISOString().slice(0, 10) },
          ipAddress: request.ipAddress,
          userAgent: request.userAgent?.slice(0, 512),
        },
      });
      return result;
    });
    return this.getById(principal, updated.id);
  }

  async history(principal: Principal, id: string) {
    if (!principal.permissions.includes("hr.employment_history.read"))
      throw new ForbiddenException("Employment history access denied");
    const employee = await this.findEmployee(
      id,
      this.requireOrganization(principal),
    );
    this.assertReadTarget(principal, employee);
    return this.prisma.employmentHistory.findMany({
      where: { employeeId: id },
      orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        eventType: true,
        effectiveDate: true,
        summary: true,
        previousValue: true,
        newValue: true,
        actorUserId: true,
        createdAt: true,
      },
    });
  }

  async addresses(principal: Principal, id: string) {
    await this.assertChildRead(principal, id);
    return this.prisma.employeeAddress.findMany({
      where: { employeeId: id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });
  }
  async createAddress(
    principal: Principal,
    id: string,
    dto: CreateEmployeeAddressDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    if (dto.isPrimary)
      await this.prisma.employeeAddress.updateMany({
        where: { employeeId: id, type: dto.type ?? "CURRENT" },
        data: { isPrimary: false },
      });
    const row = await this.prisma.employeeAddress.create({
      data: {
        employeeId: id,
        type: dto.type,
        addressLine1: dto.addressLine1.trim(),
        addressLine2: this.clean(dto.addressLine2),
        city: dto.city.trim(),
        state: dto.state.trim(),
        postalCode: dto.postalCode.trim(),
        country: dto.country?.trim() || "India",
        isPrimary: Boolean(dto.isPrimary),
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_ADDRESS_CREATED",
      actorUserId: principal.userId,
      entityType: "EmployeeAddress",
      entityId: row.id,
      metadata: { employeeId: id },
      request,
    });
    return row;
  }
  async updateAddress(
    principal: Principal,
    id: string,
    addressId: string,
    dto: UpdateEmployeeAddressDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeAddress.findFirst({
      where: { id: addressId, employeeId: id },
    });
    if (!existing) throw new NotFoundException("Address not found");
    if (dto.isPrimary)
      await this.prisma.employeeAddress.updateMany({
        where: {
          employeeId: id,
          type: dto.type ?? existing.type,
          id: { not: addressId },
        },
        data: { isPrimary: false },
      });
    const row = await this.prisma.employeeAddress.update({
      where: { id: addressId },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.addressLine1 !== undefined
          ? { addressLine1: dto.addressLine1.trim() }
          : {}),
        ...(dto.addressLine2 !== undefined
          ? { addressLine2: this.clean(dto.addressLine2) }
          : {}),
        ...(dto.city !== undefined ? { city: dto.city.trim() } : {}),
        ...(dto.state !== undefined ? { state: dto.state.trim() } : {}),
        ...(dto.postalCode !== undefined
          ? { postalCode: dto.postalCode.trim() }
          : {}),
        ...(dto.country !== undefined ? { country: dto.country.trim() } : {}),
        ...(dto.isPrimary !== undefined
          ? { isPrimary: Boolean(dto.isPrimary) }
          : {}),
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_ADDRESS_UPDATED",
      actorUserId: principal.userId,
      entityType: "EmployeeAddress",
      entityId: row.id,
      metadata: { employeeId: id, fields: Object.keys(dto) },
      request,
    });
    return row;
  }
  async removeAddress(
    principal: Principal,
    id: string,
    addressId: string,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeAddress.findFirst({
      where: { id: addressId, employeeId: id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Address not found");
    await this.prisma.employeeAddress.delete({ where: { id: addressId } });
    await this.audit.record({
      action: "EMPLOYEE_ADDRESS_REMOVED",
      actorUserId: principal.userId,
      entityType: "EmployeeAddress",
      entityId: addressId,
      metadata: { employeeId: id },
      request,
    });
    return { id: addressId, removed: true };
  }

  async emergencyContacts(principal: Principal, id: string) {
    await this.assertChildRead(principal, id, true);
    return this.prisma.emergencyContact.findMany({
      where: { employeeId: id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });
  }
  async createEmergencyContact(
    principal: Principal,
    id: string,
    dto: CreateEmergencyContactDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id, true);
    if (dto.isPrimary)
      await this.prisma.emergencyContact.updateMany({
        where: { employeeId: id },
        data: { isPrimary: false },
      });
    const row = await this.prisma.emergencyContact.create({
      data: {
        employeeId: id,
        name: dto.name.trim(),
        relationship: dto.relationship.trim(),
        phone: dto.phone.trim(),
        alternatePhone: this.clean(dto.alternatePhone),
        email: this.clean(dto.email),
        isPrimary: Boolean(dto.isPrimary),
      },
    });
    await this.audit.record({
      action: "EMERGENCY_CONTACT_CREATED",
      actorUserId: principal.userId,
      entityType: "EmergencyContact",
      entityId: row.id,
      metadata: { employeeId: id },
      request,
    });
    return row;
  }
  async updateEmergencyContact(
    principal: Principal,
    id: string,
    contactId: string,
    dto: UpdateEmergencyContactDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id, true);
    const existing = await this.prisma.emergencyContact.findFirst({
      where: { id: contactId, employeeId: id },
    });
    if (!existing) throw new NotFoundException("Emergency contact not found");
    if (dto.isPrimary)
      await this.prisma.emergencyContact.updateMany({
        where: { employeeId: id, id: { not: contactId } },
        data: { isPrimary: false },
      });
    const row = await this.prisma.emergencyContact.update({
      where: { id: contactId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.relationship !== undefined
          ? { relationship: dto.relationship.trim() }
          : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
        ...(dto.alternatePhone !== undefined
          ? { alternatePhone: this.clean(dto.alternatePhone) }
          : {}),
        ...(dto.email !== undefined ? { email: this.clean(dto.email) } : {}),
        ...(dto.isPrimary !== undefined
          ? { isPrimary: Boolean(dto.isPrimary) }
          : {}),
      },
    });
    await this.audit.record({
      action: "EMERGENCY_CONTACT_UPDATED",
      actorUserId: principal.userId,
      entityType: "EmergencyContact",
      entityId: row.id,
      metadata: { employeeId: id, fields: Object.keys(dto) },
      request,
    });
    return row;
  }
  async removeEmergencyContact(
    principal: Principal,
    id: string,
    contactId: string,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id, true);
    const existing = await this.prisma.emergencyContact.findFirst({
      where: { id: contactId, employeeId: id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Emergency contact not found");
    await this.prisma.emergencyContact.delete({ where: { id: contactId } });
    await this.audit.record({
      action: "EMERGENCY_CONTACT_REMOVED",
      actorUserId: principal.userId,
      entityType: "EmergencyContact",
      entityId: contactId,
      metadata: { employeeId: id },
      request,
    });
    return { id: contactId, removed: true };
  }

  async skills(principal: Principal, id: string) {
    await this.assertChildRead(principal, id);
    return this.prisma.employeeSkill.findMany({
      where: { employeeId: id },
      orderBy: { name: "asc" },
    });
  }
  async createSkill(
    principal: Principal,
    id: string,
    dto: CreateEmployeeSkillDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const row = await this.prisma.employeeSkill.create({
      data: {
        employeeId: id,
        name: dto.name.trim(),
        level: this.clean(dto.level),
        yearsExperience: dto.yearsExperience,
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_SKILL_CREATED",
      actorUserId: principal.userId,
      entityType: "EmployeeSkill",
      entityId: row.id,
      metadata: { employeeId: id },
      request,
    });
    return row;
  }
  async updateSkill(
    principal: Principal,
    id: string,
    skillId: string,
    dto: UpdateEmployeeSkillDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeSkill.findFirst({
      where: { id: skillId, employeeId: id },
    });
    if (!existing) throw new NotFoundException("Skill not found");
    const row = await this.prisma.employeeSkill.update({
      where: { id: skillId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.level !== undefined ? { level: this.clean(dto.level) } : {}),
        ...(dto.yearsExperience !== undefined
          ? { yearsExperience: dto.yearsExperience }
          : {}),
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_SKILL_UPDATED",
      actorUserId: principal.userId,
      entityType: "EmployeeSkill",
      entityId: row.id,
      metadata: { employeeId: id, fields: Object.keys(dto) },
      request,
    });
    return row;
  }
  async removeSkill(
    principal: Principal,
    id: string,
    skillId: string,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeSkill.findFirst({
      where: { id: skillId, employeeId: id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Skill not found");
    await this.prisma.employeeSkill.delete({ where: { id: skillId } });
    await this.audit.record({
      action: "EMPLOYEE_SKILL_REMOVED",
      actorUserId: principal.userId,
      entityType: "EmployeeSkill",
      entityId: skillId,
      metadata: { employeeId: id },
      request,
    });
    return { id: skillId, removed: true };
  }

  async certifications(principal: Principal, id: string) {
    await this.assertChildRead(principal, id);
    return this.prisma.employeeCertification.findMany({
      where: { employeeId: id },
      orderBy: { issuedAt: "desc" },
    });
  }
  async createCertification(
    principal: Principal,
    id: string,
    dto: CreateEmployeeCertificationDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const row = await this.prisma.employeeCertification.create({
      data: {
        employeeId: id,
        name: dto.name.trim(),
        issuer: dto.issuer.trim(),
        issuedAt: this.date(dto.issuedAt),
        expiresAt: this.date(dto.expiresAt),
        credentialId: this.clean(dto.credentialId),
        credentialUrl: this.clean(dto.credentialUrl),
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_CERTIFICATION_CREATED",
      actorUserId: principal.userId,
      entityType: "EmployeeCertification",
      entityId: row.id,
      metadata: { employeeId: id },
      request,
    });
    return row;
  }
  async updateCertification(
    principal: Principal,
    id: string,
    certificationId: string,
    dto: UpdateEmployeeCertificationDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeCertification.findFirst({
      where: { id: certificationId, employeeId: id },
    });
    if (!existing) throw new NotFoundException("Certification not found");
    const row = await this.prisma.employeeCertification.update({
      where: { id: certificationId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.issuer !== undefined ? { issuer: dto.issuer.trim() } : {}),
        ...(dto.issuedAt !== undefined
          ? { issuedAt: this.date(dto.issuedAt) }
          : {}),
        ...(dto.expiresAt !== undefined
          ? { expiresAt: this.date(dto.expiresAt) }
          : {}),
        ...(dto.credentialId !== undefined
          ? { credentialId: this.clean(dto.credentialId) }
          : {}),
        ...(dto.credentialUrl !== undefined
          ? { credentialUrl: this.clean(dto.credentialUrl) }
          : {}),
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_CERTIFICATION_UPDATED",
      actorUserId: principal.userId,
      entityType: "EmployeeCertification",
      entityId: row.id,
      metadata: { employeeId: id, fields: Object.keys(dto) },
      request,
    });
    return row;
  }
  async removeCertification(
    principal: Principal,
    id: string,
    certificationId: string,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeCertification.findFirst({
      where: { id: certificationId, employeeId: id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Certification not found");
    await this.prisma.employeeCertification.delete({
      where: { id: certificationId },
    });
    await this.audit.record({
      action: "EMPLOYEE_CERTIFICATION_REMOVED",
      actorUserId: principal.userId,
      entityType: "EmployeeCertification",
      entityId: certificationId,
      metadata: { employeeId: id },
      request,
    });
    return { id: certificationId, removed: true };
  }

  async education(principal: Principal, id: string) {
    await this.assertChildRead(principal, id);
    return this.prisma.employeeEducation.findMany({
      where: { employeeId: id },
      orderBy: { endDate: "desc" },
    });
  }
  async createEducation(
    principal: Principal,
    id: string,
    dto: CreateEmployeeEducationDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const row = await this.prisma.employeeEducation.create({
      data: {
        employeeId: id,
        institution: dto.institution.trim(),
        qualification: dto.qualification.trim(),
        fieldOfStudy: this.clean(dto.fieldOfStudy),
        startDate: this.date(dto.startDate),
        endDate: this.date(dto.endDate),
        gradeOrScore: this.clean(dto.gradeOrScore),
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_EDUCATION_CREATED",
      actorUserId: principal.userId,
      entityType: "EmployeeEducation",
      entityId: row.id,
      metadata: { employeeId: id },
      request,
    });
    return row;
  }
  async updateEducation(
    principal: Principal,
    id: string,
    educationId: string,
    dto: UpdateEmployeeEducationDto,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeEducation.findFirst({
      where: { id: educationId, employeeId: id },
    });
    if (!existing) throw new NotFoundException("Education record not found");
    const row = await this.prisma.employeeEducation.update({
      where: { id: educationId },
      data: {
        ...(dto.institution !== undefined
          ? { institution: dto.institution.trim() }
          : {}),
        ...(dto.qualification !== undefined
          ? { qualification: dto.qualification.trim() }
          : {}),
        ...(dto.fieldOfStudy !== undefined
          ? { fieldOfStudy: this.clean(dto.fieldOfStudy) }
          : {}),
        ...(dto.startDate !== undefined
          ? { startDate: this.date(dto.startDate) }
          : {}),
        ...(dto.endDate !== undefined
          ? { endDate: this.date(dto.endDate) }
          : {}),
        ...(dto.gradeOrScore !== undefined
          ? { gradeOrScore: this.clean(dto.gradeOrScore) }
          : {}),
      },
    });
    await this.audit.record({
      action: "EMPLOYEE_EDUCATION_UPDATED",
      actorUserId: principal.userId,
      entityType: "EmployeeEducation",
      entityId: row.id,
      metadata: { employeeId: id, fields: Object.keys(dto) },
      request,
    });
    return row;
  }
  async removeEducation(
    principal: Principal,
    id: string,
    educationId: string,
    request: RequestMetadata,
  ) {
    await this.assertChildWrite(principal, id);
    const existing = await this.prisma.employeeEducation.findFirst({
      where: { id: educationId, employeeId: id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("Education record not found");
    await this.prisma.employeeEducation.delete({ where: { id: educationId } });
    await this.audit.record({
      action: "EMPLOYEE_EDUCATION_REMOVED",
      actorUserId: principal.userId,
      entityType: "EmployeeEducation",
      entityId: educationId,
      metadata: { employeeId: id },
      request,
    });
    return { id: educationId, removed: true };
  }

  private async findEmployee(
    id: string,
    organizationId: string,
  ): Promise<HrEmployeeDetail> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, division: { organizationId } },
      include: hrDetailInclude,
    });
    if (!employee) throw new NotFoundException("Employee not found");
    return employee;
  }

  private assertReadList(principal: Principal) {
    if (!principal.permissions.includes("hr.employees.read"))
      throw new ForbiddenException("HR employee directory access denied");
  }
  private assertManage(principal: Principal) {
    if (!principal.permissions.includes("hr.employees.manage"))
      throw new ForbiddenException("HR employee management access denied");
  }
  private requireOrganization(principal: Principal) {
    if (!principal.organizationId)
      throw new ForbiddenException("Organization context unavailable");
    return principal.organizationId;
  }
  private isDivisionScoped(principal: Principal) {
    return (
      principal.roles.includes("DIVISION_HEAD") &&
      !principal.roles.some((role) =>
        ["SUPER_ADMIN", "FOUNDER_CEO", "HR_MANAGER", "HR_EXECUTIVE"].includes(
          role,
        ),
      )
    );
  }
  private canReadPrivate(principal: Principal) {
    return (
      principal.permissions.includes("hr.employees.read_private") ||
      principal.roles.some((role) =>
        ["FOUNDER_CEO", "SUPER_ADMIN", "HR_MANAGER"].includes(role),
      )
    );
  }

  private assertReadTarget(principal: Principal, employee: HrEmployeeDetail) {
    if (principal.employeeId === employee.id) return;
    if (!principal.permissions.includes("hr.employees.read"))
      throw new ForbiddenException("Employee access denied");
    if (
      this.isDivisionScoped(principal) &&
      principal.divisionId !== employee.divisionId
    )
      throw new ForbiddenException("Employee access denied");
  }
  private async assertChildRead(
    principal: Principal,
    id: string,
    privateOnly = false,
  ) {
    const employee = await this.findEmployee(
      id,
      this.requireOrganization(principal),
    );
    this.assertReadTarget(principal, employee);
    if (
      privateOnly &&
      !this.canReadPrivate(principal) &&
      principal.employeeId !== id
    )
      throw new ForbiddenException("Private HR access denied");
    return employee;
  }
  private async assertChildWrite(
    principal: Principal,
    id: string,
    privateOnly = false,
  ) {
    const employee = await this.findEmployee(
      id,
      this.requireOrganization(principal),
    );
    if (principal.employeeId === id && !privateOnly) return employee;
    if (!principal.permissions.includes("hr.employees.manage"))
      throw new ForbiddenException("HR employee management access denied");
    if (
      privateOnly &&
      !this.canReadPrivate(principal) &&
      principal.employeeId !== id
    )
      throw new ForbiddenException("Private HR access denied");
    if (
      this.isDivisionScoped(principal) &&
      principal.divisionId !== employee.divisionId
    )
      throw new ForbiddenException("Employee access denied");
    return employee;
  }

  private async validateStructure(
    organizationId: string,
    divisionId?: string,
    departmentId?: string,
    branchId?: string | null,
  ) {
    if (!divisionId || !departmentId)
      throw new BadRequestException("Division and department are required");
    const division = await this.prisma.division.findFirst({
      where: { id: divisionId, organizationId, status: "ACTIVE" },
      select: { id: true },
    });
    const department = await this.prisma.department.findFirst({
      where: { id: departmentId, divisionId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!division || !department)
      throw new BadRequestException(
        "Department does not belong to the selected division",
      );
    if (branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: branchId, organizationId },
        select: { id: true },
      });
      if (!branch)
        throw new BadRequestException(
          "Branch does not belong to this organization",
        );
    }
  }
  private async validateManager(
    organizationId: string,
    employeeId: string | null,
    managerId?: string | null,
  ) {
    if (!managerId) return;
    if (employeeId === managerId)
      throw new BadRequestException("An employee cannot manage themselves");
    let currentId: string | null = managerId;
    const visited = new Set<string>();
    while (currentId) {
      if (currentId === employeeId)
        throw new BadRequestException(
          "Manager relationship would create a cycle",
        );
      if (visited.has(currentId))
        throw new BadRequestException("Manager relationship contains a cycle");
      visited.add(currentId);
      const current: { id: string; managerEmployeeId: string | null } | null =
        await this.prisma.employee.findFirst({
          where: { id: currentId, division: { organizationId } },
          select: { id: true, managerEmployeeId: true },
        });
      if (!current)
        throw new BadRequestException(
          "Manager does not belong to this organization",
        );
      currentId = current.managerEmployeeId;
    }
  }
  private validateDates(
    joiningDate: Date | null,
    confirmationDate: Date | null,
    probationEndDate: Date | null,
  ) {
    if (joiningDate && confirmationDate && confirmationDate < joiningDate)
      throw new BadRequestException(
        "Confirmation date cannot precede joining date",
      );
    if (joiningDate && probationEndDate && probationEndDate < joiningDate)
      throw new BadRequestException(
        "Probation end date cannot precede joining date",
      );
  }
  private date(value?: string | Date | null) {
    return value ? new Date(value) : null;
  }
  private clean(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed || null;
  }
  private isUnique(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  private historyChanges(current: HrEmployeeDetail, dto: UpdateHrEmployeeDto) {
    const changes: Array<{
      field: string;
      eventType: EmploymentHistoryEventType;
      summary: string;
      previous: unknown;
      next: unknown;
    }> = [];
    const compare = (
      field: string,
      eventType: EmploymentHistoryEventType,
      summary: string,
      previous: unknown,
      next: unknown,
    ) => {
      if (next !== undefined && String(previous ?? "") !== String(next ?? ""))
        changes.push({ field, eventType, summary, previous, next });
    };
    compare(
      "divisionId",
      EmploymentHistoryEventType.DIVISION_CHANGED,
      "Division changed",
      current.divisionId,
      dto.divisionId,
    );
    compare(
      "departmentId",
      EmploymentHistoryEventType.DEPARTMENT_CHANGED,
      "Department changed",
      current.departmentId,
      dto.departmentId,
    );
    compare(
      "designation",
      EmploymentHistoryEventType.DESIGNATION_CHANGED,
      "Designation changed",
      current.designation,
      dto.designation,
    );
    compare(
      "managerEmployeeId",
      EmploymentHistoryEventType.MANAGER_CHANGED,
      "Manager changed",
      current.managerEmployeeId,
      dto.managerEmployeeId,
    );
    compare(
      "employmentType",
      EmploymentHistoryEventType.EMPLOYMENT_TYPE_CHANGED,
      "Employment type changed",
      current.employmentType,
      dto.employmentType,
    );
    compare(
      "employmentStatus",
      EmploymentHistoryEventType.STATUS_CHANGED,
      "Employment status changed",
      current.employmentStatus,
      dto.employmentStatus,
    );
    return changes;
  }

  private toResponse(
    employee: HrEmployeeDetail,
    includePrivate: boolean,
    detail: boolean,
  ) {
    const base = {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      officialEmail: employee.user.email,
      designation: employee.designation,
      gradeText: employee.gradeText,
      phone: employee.phone,
      personalEmail: includePrivate ? employee.personalEmail : null,
      alternatePhone: includePrivate ? employee.alternatePhone : null,
      gender: includePrivate ? employee.gender : null,
      dateOfBirth: includePrivate ? employee.dateOfBirth : null,
      nationality: includePrivate ? employee.nationality : null,
      bloodGroup: includePrivate ? employee.bloodGroup : null,
      profilePhotoUrl: employee.profilePhotoUrl,
      joiningDate: employee.joiningDate,
      confirmationDate: employee.confirmationDate,
      probationEndDate: employee.probationEndDate,
      employmentType: employee.employmentType,
      employmentStatus: employee.employmentStatus,
      division: employee.division
        ? {
            id: employee.division.id,
            name: employee.division.name,
            slug: employee.division.slug,
          }
        : null,
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
            slug: employee.department.slug,
          }
        : null,
      branch: employee.branch,
      manager: employee.manager
        ? {
            id: employee.manager.id,
            employeeCode: employee.manager.employeeCode,
            name: `${employee.manager.firstName} ${employee.manager.lastName}`.trim(),
            designation: employee.manager.designation,
          }
        : null,
      directReports: employee.directReports.map((report) => ({
        id: report.id,
        employeeCode: report.employeeCode,
        name: `${report.firstName} ${report.lastName}`.trim(),
        designation: report.designation,
        employmentStatus: report.employmentStatus,
      })),
      directReportCount: employee._count.directReports,
      teams: employee.teamMemberships.map((membership) => ({
        id: membership.team.id,
        code: membership.team.code,
        name: membership.team.name,
        role: membership.role,
        joinedAt: membership.joinedAt,
      })),
    };
    if (!detail)
      return {
        ...base,
        directReports: undefined,
        directReportCount: employee._count.directReports,
      };
    return {
      ...base,
      ...(includePrivate
        ? {
            addresses: employee.addresses,
            emergencyContacts: employee.emergencyContacts,
          }
        : { addresses: [], emergencyContacts: [] }),
      skills: employee.skills,
      certifications: employee.certifications,
      education: employee.education,
      employmentHistory: includePrivate ? employee.employmentHistory : [],
      sensitiveFields: undefined,
    };
  }
}
