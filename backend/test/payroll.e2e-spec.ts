import cookieParser from "cookie-parser";
import argon2 from "argon2";
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("MVP-2 payroll engine", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let founderToken: string;
  let employeeToken: string;
  let otherEmployeeToken: string;
  let financeExecutiveToken: string;
  let financeManagerToken: string;
  let superAdminToken: string;
  let hrToken: string;
  let salesToken: string;
  let viewerToken: string;
  let externalFounderToken: string;
  let employee: { id: string; userId: string; email: string };
  let otherEmployee: { id: string; userId: string; email: string };
  let founder: { id: string; userId: string; email: string };
  let financeExecutive: { id: string; userId: string; email: string };
  let financeManager: { id: string; userId: string; email: string };
  let superAdmin: { id: string; userId: string; email: string };
  let hr: { id: string; userId: string; email: string };
  let sales: { id: string; userId: string; email: string };
  let viewer: { id: string; userId: string; email: string };
  let externalFounder: { id: string; userId: string; email: string };
  let organizationId: string;
  let divisionId: string;
  let departmentId: string;
  let externalOrganizationId: string;
  let externalDivisionId: string;
  let externalDepartmentId: string;
  const password = "payroll-test-password";

  async function login(email: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    return response.body.data.accessToken as string;
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ defaultVersion: "1", type: VersioningType.URI });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    prisma = app.get(PrismaService);
    const stamp = `payroll-${Date.now()}`;
    const organization = await prisma.organization.create({
      data: { legalName: "Payroll Test Org", slug: stamp },
    });
    organizationId = organization.id;
    const division = await prisma.division.create({
      data: { organizationId, name: "Payroll Division", slug: stamp },
    });
    divisionId = division.id;
    departmentId = (
      await prisma.department.create({
        data: { divisionId, name: "Payroll Department", slug: stamp },
      })
    ).id;
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      parallelism: 1,
      timeCost: 2,
    });
    const founderRole = await prisma.role.findUniqueOrThrow({
      where: { name: "FOUNDER_CEO" },
    });
    const employeeRole = await prisma.role.findUniqueOrThrow({
      where: { name: "EMPLOYEE" },
    });
    const financeExecutiveRole = await prisma.role.findUniqueOrThrow({
      where: { name: "FINANCE_EXECUTIVE" },
    });
    const roleActor = async (roleName: string, code: string) => {
      const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
      const actor = await prisma.user.create({
        data: {
          email: `${stamp}-${code.toLowerCase()}@test.local`,
          passwordHash,
          status: "ACTIVE",
          roles: { create: { roleId: role.id } },
          employee: { create: { employeeCode: `${stamp}-${code}`, firstName: "Payroll", lastName: code, divisionId, departmentId } },
        },
        include: { employee: true },
      });
      return { id: actor.employee!.id, userId: actor.id, email: actor.email };
    };
    const founderUser = await prisma.user.create({
      data: {
        email: `${stamp}-founder@test.local`,
        passwordHash,
        status: "ACTIVE",
        roles: { create: { roleId: founderRole.id } },
        employee: {
          create: {
            employeeCode: `${stamp}-F`,
            firstName: "Payroll",
            lastName: "Founder",
            divisionId,
            departmentId,
          },
        },
      },
      include: { employee: true },
    });
    const user = await prisma.user.create({
      data: {
        email: `${stamp}-employee@test.local`,
        passwordHash,
        status: "ACTIVE",
        roles: { create: { roleId: employeeRole.id } },
        employee: {
          create: {
            employeeCode: `${stamp}-E`,
            firstName: "Payroll",
            lastName: "Employee",
            divisionId,
            departmentId,
          },
        },
      },
      include: { employee: true },
    });
    const other = await prisma.user.create({
      data: {
        email: `${stamp}-other@test.local`,
        passwordHash,
        status: "ACTIVE",
        roles: { create: { roleId: employeeRole.id } },
        employee: {
          create: {
            employeeCode: `${stamp}-O`,
            firstName: "Other",
            lastName: "Employee",
            divisionId,
            departmentId,
          },
        },
      },
      include: { employee: true },
    });
    const finance = await prisma.user.create({
      data: {
        email: `${stamp}-finance@test.local`,
        passwordHash,
        status: "ACTIVE",
        roles: { create: { roleId: financeExecutiveRole.id } },
        employee: {
          create: {
            employeeCode: `${stamp}-X`,
            firstName: "Payroll",
            lastName: "Finance",
            divisionId,
            departmentId,
          },
        },
      },
      include: { employee: true },
    });
    employee = { id: user.employee!.id, userId: user.id, email: user.email };
    otherEmployee = {
      id: other.employee!.id,
      userId: other.id,
      email: other.email,
    };
    founder = {
      id: founderUser.employee!.id,
      userId: founderUser.id,
      email: founderUser.email,
    };
    financeExecutive = {
      id: finance.employee!.id,
      userId: finance.id,
      email: finance.email,
    };
    financeManager = await roleActor("FINANCE_MANAGER", "FM");
    superAdmin = await roleActor("SUPER_ADMIN", "SA");
    hr = await roleActor("HR_MANAGER", "HR");
    sales = await roleActor("SALES_MANAGER", "SM");
    viewer = await roleActor("VIEWER", "VW");
    const externalOrganization = await prisma.organization.create({
      data: { legalName: "External Payroll Org", slug: `${stamp}-external` },
    });
    externalOrganizationId = externalOrganization.id;
    const externalDivision = await prisma.division.create({ data: { organizationId: externalOrganizationId, name: "External Division", slug: `${stamp}-external` } });
    externalDivisionId = externalDivision.id;
    const externalDepartment = await prisma.department.create({ data: { divisionId: externalDivisionId, name: "External Department", slug: `${stamp}-external` } });
    externalDepartmentId = externalDepartment.id;
    const externalRole = await prisma.role.findUniqueOrThrow({ where: { name: "FOUNDER_CEO" } });
    const external = await prisma.user.create({
      data: {
        email: `${stamp}-external@test.local`, passwordHash, status: "ACTIVE",
        roles: { create: { roleId: externalRole.id } },
        employee: { create: { employeeCode: `${stamp}-EXT`, firstName: "External", lastName: "Founder", divisionId: externalDivisionId, departmentId: externalDepartmentId } },
      }, include: { employee: true },
    });
    externalFounder = { id: external.employee!.id, userId: external.id, email: external.email };
    founderToken = await login(founder.email);
    employeeToken = await login(user.email);
    otherEmployeeToken = await login(otherEmployee.email);
    financeExecutiveToken = await login(financeExecutive.email);
    financeManagerToken = await login(financeManager.email);
    superAdminToken = await login(superAdmin.email);
    hrToken = await login(hr.email);
    salesToken = await login(sales.email);
    viewerToken = await login(viewer.email);
    externalFounderToken = await login(externalFounder.email);
  });

  afterAll(async () => {
    if (!employee || !otherEmployee || !financeExecutive || !financeManager || !superAdmin || !hr || !sales || !viewer || !externalFounder) {
      await app.close();
      return;
    }
    await prisma.payrollLineItem.deleteMany({
      where: {
        result: { employeeId: { in: [employee.id, otherEmployee.id, financeExecutive.id, financeManager.id, superAdmin.id, hr.id, sales.id, viewer.id] } },
      },
    });
    await prisma.payrollEmployeeResult.deleteMany({
      where: { employeeId: { in: [employee.id, otherEmployee.id, financeExecutive.id, financeManager.id, superAdmin.id, hr.id, sales.id, viewer.id] } },
    });
    await prisma.payrollRun.deleteMany({ where: { organizationId } });
    await prisma.payrollPeriod.deleteMany({ where: { organizationId } });
    await prisma.employeeCompensationComponent.deleteMany({
      where: {
        compensation: { employeeId: { in: [employee.id, otherEmployee.id, financeExecutive.id, financeManager.id, superAdmin.id, hr.id, sales.id, viewer.id] } },
      },
    });
    await prisma.employeeCompensation.deleteMany({
      where: { employeeId: { in: [employee.id, otherEmployee.id, financeExecutive.id, financeManager.id, superAdmin.id, hr.id, sales.id, viewer.id] } },
    });
    await prisma.salaryStructureComponent.deleteMany({
      where: { salaryStructure: { organizationId } },
    });
    await prisma.salaryStructure.deleteMany({ where: { organizationId } });
    await prisma.payrollComponent.deleteMany({ where: { organizationId } });
    await prisma.notification.deleteMany({
      where: {
        userId: { in: [employee.userId, otherEmployee.userId, founder.userId, financeExecutive.userId, financeManager.userId, superAdmin.userId, hr.userId, sales.userId, viewer.userId] },
      },
    });
    await prisma.auditLog.deleteMany({
      where: {
        actorUserId: {
          in: [employee.userId, otherEmployee.userId, founder.userId, financeExecutive.userId, financeManager.userId, superAdmin.userId, hr.userId, sales.userId, viewer.userId],
        },
      },
    });
    await prisma.refreshSession.deleteMany({
      where: {
        userId: { in: [employee.userId, otherEmployee.userId, founder.userId, financeExecutive.userId, financeManager.userId, superAdmin.userId, hr.userId, sales.userId, viewer.userId] },
      },
    });
    await prisma.employee.deleteMany({
      where: { id: { in: [employee.id, otherEmployee.id, founder.id, financeExecutive.id, financeManager.id, superAdmin.id, hr.id, sales.id, viewer.id] } },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [employee.userId, otherEmployee.userId, founder.userId, financeExecutive.userId, financeManager.userId, superAdmin.userId, hr.userId, sales.userId, viewer.userId] },
      },
    });
    await prisma.department.deleteMany({ where: { id: departmentId } });
    await prisma.division.deleteMany({ where: { id: divisionId } });
    await prisma.organization.delete({ where: { id: organizationId } });
    await prisma.refreshSession.deleteMany({ where: { userId: externalFounder.userId } });
    await prisma.employee.delete({ where: { id: externalFounder.id } });
    await prisma.user.delete({ where: { id: externalFounder.userId } });
    await prisma.department.delete({ where: { id: externalDepartmentId } });
    await prisma.division.delete({ where: { id: externalDivisionId } });
    await prisma.organization.delete({ where: { id: externalOrganizationId } });
    await app.close();
  });

  it("calculates configurable Decimal payroll and keeps statutory values unopinionated", async () => {
    const headers = { Authorization: `Bearer ${founderToken}` };
    await request(app.getHttpServer())
      .get("/api/v2/payroll/dashboard")
      .set({ Authorization: `Bearer ${employeeToken}` })
      .expect(403);
    await request(app.getHttpServer())
      .get("/api/v2/payroll/dashboard")
      .set({ Authorization: `Bearer ${financeExecutiveToken}` })
      .expect(200);
    await request(app.getHttpServer())
      .get("/api/v2/payroll/dashboard")
      .set({ Authorization: `Bearer ${superAdminToken}` })
      .expect(200);
    for (const token of [salesToken, viewerToken]) {
      await request(app.getHttpServer())
        .get("/api/v2/payroll/dashboard")
        .set({ Authorization: `Bearer ${token}` })
        .expect(403);
    }
    await request(app.getHttpServer())
      .post("/api/v2/payroll/components")
      .set({ Authorization: `Bearer ${financeExecutiveToken}` })
      .send({
        code: "UNAUTHORIZED",
        name: "Unauthorized component",
        type: "EARNING",
        calculationType: "FIXED",
        defaultValue: 1,
      })
      .expect(403);
    await request(app.getHttpServer())
      .post("/api/v2/payroll/components")
      .set({ Authorization: `Bearer ${superAdminToken}` })
      .send({ code: "SUPER_ADMIN_CONFIG", name: "SuperAdmin configured value", type: "EARNING", calculationType: "FIXED", defaultValue: 0 })
      .expect(201);
    await request(app.getHttpServer())
      .get("/api/v2/payroll/compensations")
      .set({ Authorization: `Bearer ${employeeToken}` })
      .expect(403);
    const basic = (
      await request(app.getHttpServer())
        .post("/api/v2/payroll/components")
        .set(headers)
        .send({
          code: "BASIC",
          name: "Basic",
          type: "EARNING",
          calculationType: "FIXED",
          defaultValue: 100000,
        })
        .expect(201)
    ).body.data;
    const hra = (
      await request(app.getHttpServer())
        .post("/api/v2/payroll/components")
        .set(headers)
        .send({
          code: "HRA",
          name: "Housing",
          type: "EARNING",
          calculationType: "PERCENTAGE",
          percentageValue: 50,
          percentageBaseComponentId: basic.id,
        })
        .expect(201)
    ).body.data;
    const pf = (
      await request(app.getHttpServer())
        .post("/api/v2/payroll/components")
        .set(headers)
        .send({
          code: "PF",
          name: "Configured PF",
          type: "DEDUCTION",
          calculationType: "PERCENTAGE",
          percentageValue: 10,
          percentageBaseComponentId: basic.id,
          isStatutory: true,
        })
        .expect(201)
    ).body.data;
    const employer = (
      await request(app.getHttpServer())
        .post("/api/v2/payroll/components")
        .set(headers)
        .send({
          code: "EMPLOYER",
          name: "Employer contribution",
          type: "EMPLOYER_CONTRIBUTION",
          calculationType: "PERCENTAGE",
          percentageValue: 12,
          percentageBaseComponentId: basic.id,
        })
        .expect(201)
    ).body.data;
    const structure = (
      await request(app.getHttpServer())
        .post("/api/v2/payroll/salary-structures")
        .set(headers)
        .send({
          name: "Payroll Test Structure",
          components: [
            { payrollComponentId: basic.id },
            { payrollComponentId: hra.id },
            { payrollComponentId: pf.id },
            { payrollComponentId: employer.id },
          ],
        })
        .expect(201)
    ).body.data;
    await request(app.getHttpServer())
      .get(`/api/v2/payroll/salary-structures/${structure.id}`)
      .set({ Authorization: `Bearer ${externalFounderToken}` })
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/employees/${externalFounder.id}/compensation`)
      .set(headers)
      .send({ salaryStructureId: structure.id, effectiveFrom: "2026-01-01" })
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/employees/${employee.id}/compensation`)
      .set({ Authorization: `Bearer ${hrToken}` })
      .send({ salaryStructureId: structure.id, effectiveFrom: "2026-01-01" })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/api/v2/payroll/compensations/${structure.id}`)
      .set({ Authorization: `Bearer ${employeeToken}` })
      .send({ monthlyGrossTarget: 1 })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/employees/${employee.id}/compensation`)
      .set(headers)
      .send({
        salaryStructureId: structure.id,
        effectiveFrom: "2026-01-01",
        monthlyGrossTarget: 100000,
      })
      .expect(409);
    const period = (
      await request(app.getHttpServer())
        .post("/api/v2/payroll/periods")
        .set(headers)
        .send({
          year: 2026,
          month: 1,
          startDate: "2026-01-01",
          endDate: "2026-01-31",
        })
        .expect(201)
    ).body.data;
    await request(app.getHttpServer())
      .post("/api/v2/payroll/periods")
      .set(headers)
      .send({
        year: 2026,
        month: 1,
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      })
      .expect(409);
    const run = (
      await request(app.getHttpServer())
        .post("/api/v2/payroll/runs")
        .set(headers)
        .send({ payrollPeriodId: period.id })
        .expect(201)
    ).body.data;
    const calculated = (
      await request(app.getHttpServer())
        .post(`/api/v2/payroll/runs/${run.id}/calculate`)
        .set({ Authorization: `Bearer ${financeExecutiveToken}` })
        .send({})
        .expect(201)
    ).body.data;
    expect(calculated.results).toHaveLength(1);
    expect(String(calculated.results[0].grossEarnings)).toBe("150000");
    expect(String(calculated.results[0].totalDeductions)).toBe("10000");
    expect(String(calculated.results[0].netPay)).toBe("140000");
    expect(String(calculated.results[0].employerContributionTotal)).toBe(
      "12000",
    );
    await request(app.getHttpServer())
      .get("/api/v2/payroll/me/payslips")
      .set({ Authorization: `Bearer ${employeeToken}` })
      .expect(200)
      .expect(({ body }) => expect(body.data).toHaveLength(0));
    const recalculated = await request(app.getHttpServer())
      .post(`/api/v2/payroll/runs/${run.id}/calculate`)
      .set(headers)
      .send({})
      .expect(201);
    expect(recalculated.body.data.results).toHaveLength(1);
    const finalizedResultId = recalculated.body.data.results[0].id;
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/runs/${run.id}/submit-review`)
      .set(headers)
      .send({})
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/runs/${run.id}/finalize`)
      .set({ Authorization: `Bearer ${financeExecutiveToken}` })
      .send({})
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/runs/${run.id}/finalize`)
      .set({ Authorization: `Bearer ${financeManagerToken}` })
      .send({})
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/runs/${run.id}/finalize`)
      .set({ Authorization: `Bearer ${financeManagerToken}` })
      .send({})
      .expect(409);
    const payslips = await request(app.getHttpServer())
      .get("/api/v2/payroll/me/payslips")
      .set({ Authorization: `Bearer ${employeeToken}` })
      .expect(200);
    expect(payslips.body.data).toHaveLength(1);
    expect(String(payslips.body.data[0].netPay)).toBe("140000");
    expect(payslips.body.data[0].lineItems).toHaveLength(4);
    await request(app.getHttpServer())
      .patch(`/api/v2/payroll/components/${basic.id}`)
      .set(headers)
      .send({ defaultValue: 1 })
      .expect(200);
    const historical = await request(app.getHttpServer())
      .get(`/api/v2/payroll/runs/${run.id}/results/${payslips.body.data[0].id}`)
      .set(headers)
      .expect(200);
    expect(String(historical.body.data.netPay)).toBe("140000");
    expect(String(historical.body.data.lineItems.find((line: { componentCodeSnapshot: string }) => line.componentCodeSnapshot === "BASIC").amount)).toBe("100000");
    expect(await prisma.notification.count({ where: { userId: employee.userId, resourceId: run.id } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { actorUserId: financeManager.userId, entityId: run.id, action: "PAYROLL_RUN_FINALIZED" } })).toBe(1);
    await request(app.getHttpServer())
      .patch(
        `/api/v2/payroll/runs/${run.id}/results/${finalizedResultId}`,
      )
      .set(headers)
      .send({ payableDays: 10, reason: "Should be immutable" })
      .expect(409);
    await request(app.getHttpServer())
      .get(`/api/v2/payroll/me/payslips/${finalizedResultId}`)
      .set({ Authorization: `Bearer ${otherEmployeeToken}` })
      .expect(404);
  });

  it("selects effective compensation, rounds configurable components, and requires explicit overrides", async () => {
    const headers = { Authorization: `Bearer ${founderToken}` };
    const createComponent = async (payload: Record<string, unknown>) => (
      await request(app.getHttpServer()).post("/api/v2/payroll/components").set(headers).send(payload).expect(201)
    ).body.data;
    const fixedEarning = await createComponent({ code: "ROUND_BASIC", name: "Rounded basic", type: "EARNING", calculationType: "FIXED", defaultValue: 100.01 });
    const fixedDeduction = await createComponent({ code: "FIXED_DED", name: "Fixed deduction", type: "DEDUCTION", calculationType: "FIXED", defaultValue: 10.1 });
    const percentageEarning = await createComponent({ code: "ROUND_EARN", name: "Rounded percentage earning", type: "EARNING", calculationType: "PERCENTAGE", percentageValue: 33.3333, percentageBaseComponentId: fixedEarning.id });
    const percentageDeduction = await createComponent({ code: "PCT_DED", name: "Percentage deduction", type: "DEDUCTION", calculationType: "PERCENTAGE", percentageValue: 10, percentageBaseComponentId: fixedEarning.id });
    const manual = await createComponent({ code: "MANUAL", name: "Manual allowance", type: "EARNING", calculationType: "MANUAL" });
    const cycleA = await createComponent({ code: "CYCLE_A", name: "Cycle A", type: "EARNING", calculationType: "PERCENTAGE", percentageValue: 1 });
    const cycleB = await createComponent({ code: "CYCLE_B", name: "Cycle B", type: "EARNING", calculationType: "PERCENTAGE", percentageValue: 1, percentageBaseComponentId: cycleA.id });
    await request(app.getHttpServer())
      .patch(`/api/v2/payroll/components/${cycleA.id}`)
      .set(headers)
      .send({ percentageBaseComponentId: cycleB.id })
      .expect(400);
    const structure = (
      await request(app.getHttpServer()).post("/api/v2/payroll/salary-structures").set(headers).send({
        name: "Rounding structure",
        components: [
          { payrollComponentId: fixedEarning.id },
          { payrollComponentId: fixedDeduction.id },
          { payrollComponentId: percentageEarning.id },
          { payrollComponentId: percentageDeduction.id },
          { payrollComponentId: manual.id, value: 1.23 },
        ],
      }).expect(201)
    ).body.data;
    const compensation = await request(app.getHttpServer())
      .post(`/api/v2/payroll/employees/${otherEmployee.id}/compensation`).set(headers)
      .send({ salaryStructureId: structure.id, effectiveFrom: "2026-02-01" }).expect(201);
    expect(compensation.body.data.status).toBe("ACTIVE");
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/employees/${otherEmployee.id}/compensation`).set(headers)
      .send({ salaryStructureId: structure.id, effectiveFrom: "2026-02-15" }).expect(409);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/employees/${financeExecutive.id}/compensation`).set(headers)
      .send({ salaryStructureId: structure.id, effectiveFrom: "2026-03-01" }).expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/payroll/employees/${sales.id}/compensation`).set(headers)
      .send({ salaryStructureId: structure.id, effectiveFrom: "2026-02-01", status: "ENDED" }).expect(201);
    const period = (
      await request(app.getHttpServer()).post("/api/v2/payroll/periods").set(headers)
        .send({ year: 2026, month: 2, startDate: "2026-02-01", endDate: "2026-02-28" }).expect(201)
    ).body.data;
    const run = (
      await request(app.getHttpServer()).post("/api/v2/payroll/runs").set(headers)
        .send({ payrollPeriodId: period.id }).expect(201)
    ).body.data;
    const calculated = (
      await request(app.getHttpServer()).post(`/api/v2/payroll/runs/${run.id}/calculate`).set(headers).send({}).expect(201)
    ).body.data;
    expect(calculated.results).toHaveLength(2);
    expect(calculated.results.some((row: { employeeId: string }) => row.employeeId === employee.id)).toBe(true);
    const result = calculated.results.find((row: { employeeId: string }) => row.employeeId === otherEmployee.id);
    expect(result).toBeDefined();
    expect(result.employeeId).toBe(otherEmployee.id);
    expect(String(result.grossEarnings)).toBe("134.58");
    expect(Number(result.totalDeductions)).toBe(20.1);
    expect(String(result.netPay)).toBe("114.48");
    await request(app.getHttpServer()).get("/api/v2/payroll/me/payslips")
      .set({ Authorization: `Bearer ${otherEmployeeToken}` }).expect(200)
      .expect(({ body }) => expect(body.data).toHaveLength(0));
    const dayOverride = await request(app.getHttpServer())
      .patch(`/api/v2/payroll/runs/${run.id}/results/${result.id}`).set(headers)
      .send({ payableDays: 10, leaveWithoutPayDays: 2, reason: "Manual LOP review; no automatic policy" }).expect(200);
    expect(String(dayOverride.body.data.payableDays)).toBe("10");
    expect(String(dayOverride.body.data.leaveWithoutPayDays)).toBe("2");
    expect(Number(dayOverride.body.data.netPay)).toBe(114.48);
    const adjusted = await request(app.getHttpServer())
      .patch(`/api/v2/payroll/runs/${run.id}/results/${result.id}`).set(headers)
      .send({ componentAdjustments: [{ payrollComponentId: fixedEarning.id, value: 200 }], reason: "Approved manual adjustment" }).expect(200);
    expect(Number(adjusted.body.data.netPay)).toBe(237.8);
    await request(app.getHttpServer()).post(`/api/v2/payroll/runs/${run.id}/submit-review`).set(headers).send({}).expect(201);
    await request(app.getHttpServer()).post(`/api/v2/payroll/runs/${run.id}/finalize`).set({ Authorization: `Bearer ${financeManagerToken}` }).send({}).expect(201);
    await request(app.getHttpServer()).patch(`/api/v2/payroll/salary-structures/${structure.id}`).set(headers)
      .send({ name: "Changed after finalization" }).expect(200);
    const finalResult = await request(app.getHttpServer()).get(`/api/v2/payroll/runs/${run.id}/results/${result.id}`).set(headers).expect(200);
    expect(Number(finalResult.body.data.netPay)).toBe(237.8);
    expect(finalResult.body.data.status).toBe("FINALIZED");
    expect(finalResult.body.data.salaryStructureNameSnapshot).toBe("Rounding structure");
  });
});
