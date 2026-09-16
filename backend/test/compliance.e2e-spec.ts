import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("V2 compliance calendar", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const password = "compliance-test-password";
  let organizationId: string;
  let foreignOrganizationId: string;
  let divisionId: string;
  let departmentId: string;

  type Fixture = { userId: string; employeeId: string; email: string };
  let founder: Fixture;
  let officer: Fixture;
  let employee: Fixture;
  let foreignFounder: Fixture;
  const tokens = new Map<string, string>();

  async function fixture(
    roleName: string,
    targetDivisionId: string,
    targetDepartmentId: string,
    label: string,
  ): Promise<Fixture> {
    const stamp = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const user = await prisma.user.create({
      data: {
        email: `${stamp.toLowerCase()}@example.test`,
        passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
        status: "ACTIVE",
        roles: { create: { roleId: role.id } },
        employee: {
          create: {
            employeeCode: `CMP-${stamp.slice(0, 18)}`,
            firstName: label,
            lastName: "Compliance",
            designation: roleName,
            divisionId: targetDivisionId,
            departmentId: targetDepartmentId,
          },
        },
      },
      include: { employee: true },
    });
    return { userId: user.id, employeeId: user.employee!.id, email: user.email };
  }

  async function auth(user: Fixture) {
    const cached = tokens.get(user.userId);
    if (cached) return { Authorization: `Bearer ${cached}` };
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: user.email, password })
      .expect(201);
    const token = response.body.data.accessToken as string;
    tokens.set(user.userId, token);
    return { Authorization: `Bearer ${token}` };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ defaultVersion: "1", type: VersioningType.URI });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    prisma = app.get(PrismaService);

    const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "techm4india" } });
    organizationId = org.id;
    const department = await prisma.department.findFirstOrThrow({
      where: { division: { organizationId } },
      select: { id: true, divisionId: true },
    });
    divisionId = department.divisionId;
    departmentId = department.id;

    const foreign = await prisma.organization.create({
      data: { legalName: "Foreign Compliance Org", slug: `compliance-${Date.now()}` },
    });
    foreignOrganizationId = foreign.id;
    const foreignDivision = await prisma.division.create({
      data: { organizationId: foreign.id, name: "Foreign", slug: "foreign" },
    });
    const foreignDepartment = await prisma.department.create({
      data: { divisionId: foreignDivision.id, name: "Foreign", slug: "foreign" },
    });

    founder = await fixture("FOUNDER_CEO", divisionId, departmentId, "Founder");
    officer = await fixture("FINANCE_MANAGER", divisionId, departmentId, "Officer");
    employee = await fixture("EMPLOYEE", divisionId, departmentId, "Employee");
    foreignFounder = await fixture(
      "FOUNDER_CEO",
      foreignDivision.id,
      foreignDepartment.id,
      "Foreign",
    );
  });

  afterAll(async () => {
    try {
      await prisma.complianceObligation.deleteMany({
        where: { organizationId: { in: [organizationId, foreignOrganizationId] } },
      });
    } catch {
      // RED phase runs before compliance tables exist.
    }
    const fixtures = [founder, officer, employee, foreignFounder];
    await prisma.auditLog.deleteMany({
      where: { actorUserId: { in: fixtures.map((item) => item.userId) } },
    });
    await prisma.employee.deleteMany({
      where: { id: { in: fixtures.map((item) => item.employeeId) } },
    });
    await prisma.user.deleteMany({ where: { id: { in: fixtures.map((item) => item.userId) } } });
    await prisma.department.deleteMany({
      where: { division: { organizationId: foreignOrganizationId } },
    });
    await prisma.division.deleteMany({ where: { organizationId: foreignOrganizationId } });
    await prisma.organization.delete({ where: { id: foreignOrganizationId } });
    await app.close();
  });

  it("requires evidence before submission and runs the obligation workflow", async () => {
    await request(app.getHttpServer())
      .post("/api/v2/compliance/obligations")
      .set(await auth(employee))
      .send({})
      .expect(403);

    const created = await request(app.getHttpServer())
      .post("/api/v2/compliance/obligations")
      .set(await auth(officer))
      .send({
        code: `GST-${Date.now()}`,
        title: "GSTR-3B filing for Q1",
        category: "TAX",
        authority: "GSTN",
        frequency: "QUARTERLY",
        dueDate: "2026-04-20",
        ownerEmployeeId: officer.employeeId,
      })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("PENDING"));
    const obligationId = created.body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/compliance/obligations/${obligationId}/start`)
      .set(await auth(officer))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("IN_PROGRESS"));

    // Submission is blocked until evidence is attached.
    await request(app.getHttpServer())
      .post(`/api/v2/compliance/obligations/${obligationId}/submit`)
      .set(await auth(officer))
      .expect(409);

    await request(app.getHttpServer())
      .post(`/api/v2/compliance/obligations/${obligationId}/evidence`)
      .set(await auth(officer))
      .send({ title: "Filed return acknowledgement", documentUrl: "https://example.test/ack.pdf" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v2/compliance/obligations/${obligationId}/submit`)
      .set(await auth(officer))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("SUBMITTED"));

    await request(app.getHttpServer())
      .post(`/api/v2/compliance/obligations/${obligationId}/complete`)
      .set(await auth(founder))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("COMPLETED"));

    await request(app.getHttpServer())
      .get(`/api/v2/compliance/obligations/${obligationId}`)
      .set(await auth(foreignFounder))
      .expect(404);
  });
});
