import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  PayrollComponentType,
  PayrollRunStatus,
  PayrollResultStatus,
  CompensationStatus,
} from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  CompensationOverrideDto,
  CreateCompensationDto,
  CreateComponentDto,
  CreatePeriodDto,
  CreateRunDto,
  CreateStructureDto,
  OverrideResultDto,
  UpdateCompensationDto,
  UpdateComponentDto,
  UpdatePeriodDto,
  UpdateStructureDto,
} from "./dto/payroll.dto";

const money = (value: Prisma.Decimal | number | string | null | undefined) =>
  new Prisma.Decimal(value ?? 0).toDecimalPlaces(2);

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private org(principal: Principal) {
    if (!principal.organizationId) throw new ForbiddenException("Organization context required");
    return principal.organizationId;
  }
  private assertEmployee(principal: Principal) {
    if (!principal.employeeId) throw new ForbiddenException("Employee context required");
    return principal.employeeId;
  }
  private async component(principal: Principal, id: string) {
    const row = await this.prisma.payrollComponent.findFirst({
      where: { id, organizationId: this.org(principal) },
    });
    if (!row) throw new NotFoundException("Payroll component not found");
    return row;
  }

  async dashboard(principal: Principal) {
    const organizationId = this.org(principal);
    const current = await this.prisma.payrollPeriod.findFirst({
      where: { organizationId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        run: {
          select: {
            id: true,
            status: true,
            results: {
              select: {
                grossEarnings: true,
                totalDeductions: true,
                netPay: true,
              },
            },
          },
        },
      },
    });
    const finalized = await this.prisma.payrollPeriod.findMany({
      where: { organizationId, status: "FINALIZED" },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
      select: {
        id: true,
        year: true,
        month: true,
        status: true,
        run: { select: { id: true } },
      },
    });
    const sums = current?.run?.results.reduce(
      (acc, row) => ({
        employees: acc.employees + 1,
        gross: acc.gross.plus(row.grossEarnings),
        deductions: acc.deductions.plus(row.totalDeductions),
        net: acc.net.plus(row.netPay),
      }),
      { employees: 0, gross: money(0), deductions: money(0), net: money(0) },
    );
    return {
      currentPeriod: current
        ? {
            id: current.id,
            year: current.year,
            month: current.month,
            status: current.status,
            run: current.run ? { id: current.run.id, status: current.run.status } : null,
          }
        : null,
      summary: {
        employees: sums?.employees ?? 0,
        gross: sums?.gross ?? money(0),
        deductions: sums?.deductions ?? money(0),
        net: sums?.net ?? money(0),
      },
      finalizedPeriods: finalized,
    };
  }

  async components(principal: Principal) {
    return this.prisma.payrollComponent.findMany({
      where: { organizationId: this.org(principal) },
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    });
  }
  async createComponent(principal: Principal, dto: CreateComponentDto, request?: RequestMetadata) {
    const organizationId = this.org(principal);
    await this.validateBase(principal, dto.percentageBaseComponentId);
    const row = await this.prisma.payrollComponent.create({
      data: {
        organizationId,
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        type: dto.type,
        description: dto.description,
        calculationType: dto.calculationType,
        defaultValue: dto.defaultValue,
        percentageValue: dto.percentageValue,
        percentageBaseComponentId: dto.percentageBaseComponentId,
        isTaxable: dto.isTaxable ?? true,
        isStatutory: dto.isStatutory ?? false,
        isActive: dto.isActive ?? true,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
    await this.audit.record({
      action: "PAYROLL_COMPONENT_CREATED",
      actorUserId: principal.userId,
      entityType: "PayrollComponent",
      entityId: row.id,
      metadata: { code: row.code, type: row.type },
      request,
    });
    return row;
  }
  async updateComponent(
    principal: Principal,
    id: string,
    dto: UpdateComponentDto,
    request?: RequestMetadata,
  ) {
    await this.component(principal, id);
    await this.validateBase(principal, dto.percentageBaseComponentId, id);
    const row = await this.prisma.payrollComponent.update({
      where: { id },
      data: {
        code: dto.code?.trim().toUpperCase(),
        name: dto.name?.trim(),
        type: dto.type,
        description: dto.description,
        calculationType: dto.calculationType,
        defaultValue: dto.defaultValue,
        percentageValue: dto.percentageValue,
        percentageBaseComponentId: dto.percentageBaseComponentId,
        isTaxable: dto.isTaxable,
        isStatutory: dto.isStatutory,
        isActive: dto.isActive,
        displayOrder: dto.displayOrder,
      },
    });
    await this.audit.record({
      action: "PAYROLL_COMPONENT_UPDATED",
      actorUserId: principal.userId,
      entityType: "PayrollComponent",
      entityId: id,
      metadata: { code: row.code },
      request,
    });
    return row;
  }
  private async validateBase(principal: Principal, baseId?: string, selfId?: string) {
    if (!baseId) return;
    if (baseId === selfId)
      throw new BadRequestException("Percentage component cannot reference itself");
    const visited = new Set<string>();
    let cursor: string | null = baseId;
    while (cursor) {
      if (visited.has(cursor) || cursor === selfId)
        throw new BadRequestException("Circular percentage dependency rejected");
      visited.add(cursor);
      const base = await this.component(principal, cursor);
      cursor = base.percentageBaseComponentId;
    }
  }

  async structures(principal: Principal) {
    return this.prisma.salaryStructure.findMany({
      where: { organizationId: this.org(principal) },
      orderBy: { name: "asc" },
      include: {
        components: {
          orderBy: { displayOrder: "asc" },
          include: { payrollComponent: true },
        },
      },
    });
  }
  async structure(principal: Principal, id: string) {
    const row = await this.prisma.salaryStructure.findFirst({
      where: { id, organizationId: this.org(principal) },
      include: {
        components: {
          orderBy: { displayOrder: "asc" },
          include: { payrollComponent: true },
        },
      },
    });
    if (!row) throw new NotFoundException("Salary structure not found");
    return row;
  }
  async createStructure(principal: Principal, dto: CreateStructureDto, request?: RequestMetadata) {
    const organizationId = this.org(principal);
    const components = await this.structureComponents(principal, dto.components);
    const row = await this.prisma.salaryStructure.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        description: dto.description,
        isActive: dto.isActive ?? true,
        components: components.length ? { create: components } : undefined,
      },
      include: { components: { include: { payrollComponent: true } } },
    });
    await this.audit.record({
      action: "SALARY_STRUCTURE_CREATED",
      actorUserId: principal.userId,
      entityType: "SalaryStructure",
      entityId: row.id,
      metadata: { name: row.name },
      request,
    });
    return row;
  }
  async updateStructure(
    principal: Principal,
    id: string,
    dto: UpdateStructureDto,
    request?: RequestMetadata,
  ) {
    await this.structure(principal, id);
    const components = await this.structureComponents(principal, dto.components);
    const row = await this.prisma.$transaction(async (tx) => {
      if (dto.components)
        await tx.salaryStructureComponent.deleteMany({
          where: { salaryStructureId: id },
        });
      return tx.salaryStructure.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          description: dto.description,
          isActive: dto.isActive,
          components: components.length ? { create: components } : undefined,
        },
        include: { components: { include: { payrollComponent: true } } },
      });
    });
    await this.audit.record({
      action: "SALARY_STRUCTURE_UPDATED",
      actorUserId: principal.userId,
      entityType: "SalaryStructure",
      entityId: id,
      metadata: { name: row.name },
      request,
    });
    return row;
  }
  private async structureComponents(
    principal: Principal,
    items?: {
      payrollComponentId: string;
      value?: number;
      percentage?: number;
      displayOrder?: number;
    }[],
  ) {
    if (!items) return [];
    const valid = await this.prisma.payrollComponent.findMany({
      where: {
        organizationId: this.org(principal),
        id: { in: items.map((item) => item.payrollComponentId) },
      },
    });
    if (valid.length !== items.length)
      throw new BadRequestException("All components must belong to the organization");
    return items.map((item, index) => ({
      payrollComponentId: item.payrollComponentId,
      value: item.value,
      percentage: item.percentage,
      displayOrder: item.displayOrder ?? index,
    }));
  }

  async compensations(principal: Principal, employeeId?: string) {
    const organizationId = this.org(principal);
    return this.prisma.employeeCompensation.findMany({
      where: {
        employeeId: employeeId ? employeeId : undefined,
        employee: { division: { organizationId } },
      },
      orderBy: [{ employeeId: "asc" }, { effectiveFrom: "desc" }],
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
        salaryStructure: {
          include: { components: { include: { payrollComponent: true } } },
        },
        overrides: { include: { component: true } },
      },
    });
  }
  async compensation(principal: Principal, id: string) {
    const row = await this.prisma.employeeCompensation.findFirst({
      where: {
        id,
        employee: { division: { organizationId: this.org(principal) } },
      },
      include: {
        employee: true,
        salaryStructure: {
          include: { components: { include: { payrollComponent: true } } },
        },
        overrides: { include: { component: true } },
      },
    });
    if (!row) throw new NotFoundException("Compensation not found");
    return row;
  }
  async createCompensation(
    principal: Principal,
    employeeId: string,
    dto: CreateCompensationDto,
    request?: RequestMetadata,
  ) {
    const organizationId = this.org(principal);
    await this.assertOrgEmployee(organizationId, employeeId);
    const structure = await this.prisma.salaryStructure.findFirst({
      where: { id: dto.salaryStructureId, organizationId },
    });
    if (!structure) throw new NotFoundException("Salary structure not found");
    const from = new Date(dto.effectiveFrom);
    const to = dto.effectiveTo ? new Date(dto.effectiveTo) : null;
    if (to && to < from)
      throw new BadRequestException("effectiveTo must be on or after effectiveFrom");
    const overlap = await this.prisma.employeeCompensation.findFirst({
      where: {
        employeeId,
        status: { not: "ENDED" },
        effectiveFrom: { lte: to ?? new Date("9999-12-31") },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: from } }],
      },
    });
    if (overlap) throw new ConflictException("Compensation effective dates overlap");
    const row = await this.prisma.employeeCompensation.create({
      data: {
        employeeId,
        salaryStructureId: dto.salaryStructureId,
        effectiveFrom: from,
        effectiveTo: to,
        annualCtc: dto.annualCtc,
        monthlyGrossTarget: dto.monthlyGrossTarget,
        status: dto.status ?? "ACTIVE",
        overrides: dto.overrides
          ? { create: await this.overrideData(principal, dto.overrides) }
          : undefined,
      },
      include: { overrides: true },
    });
    await this.audit.record({
      action: "EMPLOYEE_COMPENSATION_CREATED",
      actorUserId: principal.userId,
      entityType: "EmployeeCompensation",
      entityId: row.id,
      metadata: { employeeId },
      request,
    });
    return row;
  }
  async updateCompensation(
    principal: Principal,
    id: string,
    dto: UpdateCompensationDto,
    request?: RequestMetadata,
  ) {
    const current = await this.compensation(principal, id);
    if (current.status === "ENDED")
      throw new ConflictException("Ended compensation is historical and cannot be edited");
    const salaryStructureId = dto.salaryStructureId ?? current.salaryStructureId;
    const structure = await this.prisma.salaryStructure.findFirst({
      where: { id: salaryStructureId, organizationId: this.org(principal) },
    });
    if (!structure) throw new NotFoundException("Salary structure not found");
    const from = dto.effectiveFrom ? new Date(dto.effectiveFrom) : current.effectiveFrom;
    const to =
      dto.effectiveTo === undefined
        ? current.effectiveTo
        : dto.effectiveTo
          ? new Date(dto.effectiveTo)
          : null;
    const overlap = await this.prisma.employeeCompensation.findFirst({
      where: {
        id: { not: id },
        employeeId: current.employeeId,
        status: { not: "ENDED" },
        effectiveFrom: { lte: to ?? new Date("9999-12-31") },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: from } }],
      },
    });
    if (overlap) throw new ConflictException("Compensation effective dates overlap");
    const row = await this.prisma.$transaction(async (tx) => {
      if (dto.overrides)
        await tx.employeeCompensationComponent.deleteMany({
          where: { employeeCompensationId: id },
        });
      return tx.employeeCompensation.update({
        where: { id },
        data: {
          salaryStructureId,
          effectiveFrom: from,
          effectiveTo: to,
          annualCtc: dto.annualCtc,
          monthlyGrossTarget: dto.monthlyGrossTarget,
          status: dto.status as CompensationStatus | undefined,
          overrides: dto.overrides
            ? { create: await this.overrideData(principal, dto.overrides) }
            : undefined,
        },
      });
    });
    await this.audit.record({
      action: "EMPLOYEE_COMPENSATION_UPDATED",
      actorUserId: principal.userId,
      entityType: "EmployeeCompensation",
      entityId: id,
      metadata: { employeeId: current.employeeId },
      request,
    });
    return row;
  }
  private async overrideData(principal: Principal, items: CompensationOverrideDto[]) {
    const valid = await this.prisma.payrollComponent.findMany({
      where: {
        organizationId: this.org(principal),
        id: { in: items.map((item) => item.payrollComponentId) },
      },
    });
    if (valid.length !== items.length)
      throw new BadRequestException("Invalid payroll component override");
    return items.map((item) => ({
      payrollComponentId: item.payrollComponentId,
      value: item.value,
      percentage: item.percentage,
    }));
  }
  private async assertOrgEmployee(organizationId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, division: { organizationId } },
    });
    if (!employee) throw new NotFoundException("Employee not found");
    return employee;
  }

  async periods(principal: Principal) {
    return this.prisma.payrollPeriod.findMany({
      where: { organizationId: this.org(principal) },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { run: { select: { id: true, status: true } } },
    });
  }
  async createPeriod(principal: Principal, dto: CreatePeriodDto, request?: RequestMetadata) {
    const organizationId = this.org(principal);
    let row;
    try {
      row = await this.prisma.payrollPeriod.create({
        data: {
          organizationId,
          year: dto.year,
          month: dto.month,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          status: dto.status ?? "OPEN",
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Payroll period already exists for this month");
      }
      throw error;
    }
    await this.audit.record({
      action: "PAYROLL_PERIOD_CREATED",
      actorUserId: principal.userId,
      entityType: "PayrollPeriod",
      entityId: row.id,
      metadata: { year: row.year, month: row.month },
      request,
    });
    return row;
  }
  async updatePeriod(principal: Principal, id: string, dto: UpdatePeriodDto) {
    const row = await this.prisma.payrollPeriod.findFirst({
      where: { id, organizationId: this.org(principal) },
    });
    if (!row) throw new NotFoundException("Payroll period not found");
    if (row.status === "FINALIZED" || row.status === "CLOSED")
      throw new ConflictException("Finalized period is locked");
    return this.prisma.payrollPeriod.update({
      where: { id },
      data: {
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async runs(principal: Principal) {
    return this.prisma.payrollRun.findMany({
      where: { organizationId: this.org(principal) },
      orderBy: { createdAt: "desc" },
      include: { period: true, _count: { select: { results: true } } },
    });
  }
  async run(principal: Principal, id: string) {
    const row = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId: this.org(principal) },
      include: {
        period: true,
        results: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                designation: true,
                department: { select: { name: true } },
              },
            },
            lineItems: true,
          },
        },
      },
    });
    if (!row) throw new NotFoundException("Payroll run not found");
    return row;
  }
  async createRun(principal: Principal, dto: CreateRunDto, request?: RequestMetadata) {
    const organizationId = this.org(principal);
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id: dto.payrollPeriodId, organizationId },
    });
    if (!period) throw new NotFoundException("Payroll period not found");
    if (["FINALIZED", "CLOSED"].includes(period.status))
      throw new ConflictException("Period is locked");
    const existing = await this.prisma.payrollRun.findUnique({
      where: { payrollPeriodId: period.id },
    });
    if (existing) throw new ConflictException("A payroll run already exists for this period");
    const row = await this.prisma.payrollRun.create({
      data: {
        organizationId,
        payrollPeriodId: period.id,
        initiatedByUserId: principal.userId,
        notes: dto.notes,
      },
    });
    await this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: { status: "PROCESSING" },
    });
    await this.audit.record({
      action: "PAYROLL_RUN_CREATED",
      actorUserId: principal.userId,
      entityType: "PayrollRun",
      entityId: row.id,
      metadata: { payrollPeriodId: period.id },
      request,
    });
    return row;
  }

  async calculate(principal: Principal, id: string, request?: RequestMetadata) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId: this.org(principal) },
      include: { period: true },
    });
    if (!run) throw new NotFoundException("Payroll run not found");
    if (run.status === "FINALIZED") throw new ConflictException("Finalized payroll is immutable");
    const employees = await this.prisma.employee.findMany({
      where: {
        division: { organizationId: run.organizationId },
        employmentStatus: { notIn: ["EXITED", "TERMINATED"] },
      },
      select: { id: true },
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.payrollEmployeeResult.deleteMany({
        where: { payrollRunId: id, status: "DRAFT" },
      });
      for (const employee of employees) {
        const compensation = await tx.employeeCompensation.findFirst({
          where: {
            employeeId: employee.id,
            status: "ACTIVE",
            effectiveFrom: { lte: run.period.startDate },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: run.period.startDate } }],
          },
          orderBy: { effectiveFrom: "desc" },
          include: {
            salaryStructure: {
              include: {
                components: {
                  orderBy: { displayOrder: "asc" },
                  include: { payrollComponent: true },
                },
              },
            },
            overrides: { include: { component: true } },
          },
        });
        if (!compensation) continue;
        const computed = this.compute(compensation);
        await tx.payrollEmployeeResult.create({
          data: {
            payrollRunId: id,
            employeeId: employee.id,
            salaryStructureNameSnapshot: compensation.salaryStructure.name,
            grossEarnings: computed.gross,
            totalDeductions: computed.deductions,
            netPay: computed.net,
            employerContributionTotal: computed.employer,
            workingDays: this.daysInPeriod(run.period.startDate, run.period.endDate),
            payableDays: this.daysInPeriod(run.period.startDate, run.period.endDate),
            leaveWithoutPayDays: 0,
            lineItems: { create: computed.lines },
          },
        });
      }
      await tx.payrollRun.update({
        where: { id },
        data: { status: "PROCESSING", completedAt: new Date() },
      });
      await tx.payrollPeriod.update({
        where: { id: run.period.id },
        data: { status: "PROCESSING" },
      });
    });
    await this.audit.record({
      action: "PAYROLL_RUN_CALCULATED",
      actorUserId: principal.userId,
      entityType: "PayrollRun",
      entityId: id,
      metadata: { resultCount: employees.length },
      request,
    });
    return this.run(principal, id);
  }
  private compute(comp: any) {
    const values = new Map<string, Prisma.Decimal>();
    const lines: any[] = [];
    const all = [...comp.salaryStructure.components];
    for (const override of comp.overrides) {
      const found = all.find((item) => item.payrollComponentId === override.payrollComponentId);
      if (found) {
        found.value = override.value;
        found.percentage = override.percentage;
      } else
        all.push({
          payrollComponentId: override.payrollComponentId,
          payrollComponent: override.component,
          value: override.value,
          percentage: override.percentage,
        });
    }
    const pending = [...all];
    let guard = 0;
    while (pending.length && guard++ < 100) {
      const item = pending.shift();
      const c = item.payrollComponent;
      const baseId = c.percentageBaseComponentId;
      if (baseId && !values.has(baseId)) {
        pending.push(item);
        if (pending.length === 1)
          throw new BadRequestException("Circular percentage dependency rejected");
        continue;
      }
      let amount = money(item.value ?? c.defaultValue);
      const pct = item.percentage ?? c.percentageValue;
      if (c.calculationType === "PERCENTAGE") {
        const base = baseId ? values.get(baseId)! : money(comp.monthlyGrossTarget ?? 0);
        amount = money(base.mul(new Prisma.Decimal(pct ?? 0)).div(100));
      }
      if (c.calculationType === "MANUAL") amount = money(item.value ?? 0);
      values.set(c.id, amount);
      lines.push({
        payrollComponentId: c.id,
        componentCodeSnapshot: c.code,
        componentNameSnapshot: c.name,
        componentTypeSnapshot: c.type,
        amount,
        calculationMetadata: {
          calculationType: c.calculationType,
          percentage: pct ?? null,
          baseComponentId: baseId ?? null,
        },
      });
    }
    if (pending.length) throw new BadRequestException("Circular percentage dependency rejected");
    const gross = lines
      .filter((line) => line.componentTypeSnapshot === PayrollComponentType.EARNING)
      .reduce((sum, line) => sum.plus(line.amount), money(0));
    const deductions = lines
      .filter((line) => line.componentTypeSnapshot === PayrollComponentType.DEDUCTION)
      .reduce((sum, line) => sum.plus(line.amount), money(0));
    const employer = lines
      .filter((line) => line.componentTypeSnapshot === PayrollComponentType.EMPLOYER_CONTRIBUTION)
      .reduce((sum, line) => sum.plus(line.amount), money(0));
    return {
      lines,
      gross,
      deductions,
      employer,
      net: money(gross.minus(deductions)),
    };
  }
  private daysInPeriod(start: Date, end: Date) {
    return new Prisma.Decimal(Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
  }
  async results(principal: Principal, runId: string) {
    const run = await this.run(principal, runId);
    return run.results;
  }
  async result(principal: Principal, runId: string, resultId: string) {
    const row = await this.prisma.payrollEmployeeResult.findFirst({
      where: {
        id: resultId,
        payrollRunId: runId,
        run: { organizationId: this.org(principal) },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: { select: { name: true } },
          },
        },
        run: { include: { period: true } },
        lineItems: true,
      },
    });
    if (!row) throw new NotFoundException("Payroll result not found");
    return row;
  }
  async override(
    principal: Principal,
    runId: string,
    resultId: string,
    dto: OverrideResultDto,
    request?: RequestMetadata,
  ) {
    const row = await this.result(principal, runId, resultId);
    if (
      row.status === PayrollResultStatus.FINALIZED ||
      row.run.status === PayrollRunStatus.FINALIZED
    )
      throw new ConflictException("Finalized payroll is immutable");
    if (dto.componentAdjustments?.length) {
      const adjustments = await this.overrideData(principal, dto.componentAdjustments);
      const components = await this.prisma.payrollComponent.findMany({
        where: {
          organizationId: this.org(principal),
          id: { in: adjustments.map((item) => item.payrollComponentId) },
        },
      });
      const componentById = new Map(components.map((item) => [item.id, item]));
      await this.prisma.payrollLineItem.deleteMany({
        where: { payrollEmployeeResultId: resultId },
      });
      const compensation = await this.prisma.employeeCompensation.findFirst({
        where: { employeeId: row.employeeId, status: "ACTIVE" },
        include: {
          salaryStructure: {
            include: { components: { include: { payrollComponent: true } } },
          },
          overrides: { include: { component: true } },
        },
      });
      if (compensation) {
        const computed = this.compute({
          ...compensation,
          overrides: [
            ...compensation.overrides,
            ...adjustments.map((item) => ({
              ...item,
              component: componentById.get(item.payrollComponentId)!,
            })),
          ],
        });
        await this.prisma.payrollLineItem.createMany({
          data: computed.lines.map((line) => ({
            ...line,
            payrollEmployeeResultId: resultId,
          })),
        });
        await this.prisma.payrollEmployeeResult.update({
          where: { id: resultId },
          data: {
            grossEarnings: computed.gross,
            totalDeductions: computed.deductions,
            netPay: computed.net,
            employerContributionTotal: computed.employer,
          },
        });
      }
    }
    const updated = await this.prisma.payrollEmployeeResult.update({
      where: { id: resultId },
      data: {
        payableDays: dto.payableDays,
        leaveWithoutPayDays: dto.leaveWithoutPayDays,
      },
    });
    await this.audit.record({
      action: "PAYROLL_RESULT_OVERRIDDEN",
      actorUserId: principal.userId,
      entityType: "PayrollEmployeeResult",
      entityId: resultId,
      metadata: {
        reason: dto.reason,
        payableDays: dto.payableDays,
        leaveWithoutPayDays: dto.leaveWithoutPayDays,
      },
      request,
    });
    return updated;
  }
  async submitReview(principal: Principal, id: string, request?: RequestMetadata) {
    const run = await this.run(principal, id);
    if (run.status !== PayrollRunStatus.PROCESSING)
      throw new ConflictException("Payroll run must be calculated before review");
    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: { status: "REVIEW" },
    });
    await this.prisma.payrollPeriod.update({
      where: { id: run.period.id },
      data: { status: "REVIEW" },
    });
    await this.audit.record({
      action: "PAYROLL_RUN_SUBMITTED",
      actorUserId: principal.userId,
      entityType: "PayrollRun",
      entityId: id,
      request,
    });
    return updated;
  }
  async finalize(principal: Principal, id: string, request?: RequestMetadata) {
    const run = await this.run(principal, id);
    if (run.status !== PayrollRunStatus.REVIEW)
      throw new ConflictException("Payroll run is not ready for finalization");
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.payrollEmployeeResult.updateMany({
        where: { payrollRunId: id },
        data: { status: "FINALIZED" },
      });
      const result = await tx.payrollRun.update({
        where: { id },
        data: {
          status: "FINALIZED",
          approvedByUserId: principal.userId,
          approvedAt: new Date(),
        },
      });
      await tx.payrollPeriod.update({
        where: { id: run.period.id },
        data: { status: "FINALIZED" },
      });
      const recipients = await tx.payrollEmployeeResult.findMany({
        where: { payrollRunId: id },
        select: { employee: { select: { userId: true } } },
      });
      if (recipients.length) {
        await tx.notification.createMany({
          data: recipients.map(({ employee }) => ({
            userId: employee.userId,
            type: "SYSTEM",
            title: "Payslip available",
            body: `Your payslip for ${run.period.year}-${String(run.period.month).padStart(2, "0")} is ready.`,
            resourceType: "PayrollRun",
            resourceId: id,
          })),
        });
      }
      return result;
    });
    await this.audit.record({
      action: "PAYROLL_RUN_FINALIZED",
      actorUserId: principal.userId,
      entityType: "PayrollRun",
      entityId: id,
      metadata: { resultCount: run.results.length },
      request,
    });
    return updated;
  }

  async myPayslips(principal: Principal) {
    const employeeId = this.assertEmployee(principal);
    return this.prisma.payrollEmployeeResult.findMany({
      where: {
        employeeId,
        status: "FINALIZED",
        run: { organizationId: this.org(principal) },
      },
      orderBy: { createdAt: "desc" },
      include: { run: { include: { period: true } }, lineItems: true },
    });
  }
  async myPayslip(principal: Principal, id: string) {
    const employeeId = this.assertEmployee(principal);
    const row = await this.prisma.payrollEmployeeResult.findFirst({
      where: {
        id,
        employeeId,
        status: "FINALIZED",
        run: { organizationId: this.org(principal) },
      },
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: { select: { name: true } },
          },
        },
        run: { include: { period: true } },
        lineItems: true,
      },
    });
    if (!row) throw new NotFoundException("Payslip not found");
    return row;
  }
}
