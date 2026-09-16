import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("V2 project delivery", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const password = "delivery-test-password";
  let organizationId: string;
  let foreignOrganizationId: string;
  let divisionId: string;
  let departmentId: string;
  let projectId: string;

  type Fixture = { userId: string; employeeId: string; email: string };
  let founder: Fixture;
  let manager: Fixture;
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
            employeeCode: `DEL-${stamp.slice(0, 18)}`,
            firstName: label,
            lastName: "Delivery",
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
      data: { legalName: "Foreign Delivery Org", slug: `delivery-${Date.now()}` },
    });
    foreignOrganizationId = foreign.id;
    const foreignDivision = await prisma.division.create({
      data: { organizationId: foreign.id, name: "Foreign", slug: "foreign" },
    });
    const foreignDepartment = await prisma.department.create({
      data: { divisionId: foreignDivision.id, name: "Foreign", slug: "foreign" },
    });

    founder = await fixture("FOUNDER_CEO", divisionId, departmentId, "Founder");
    manager = await fixture("PROJECT_MANAGER", divisionId, departmentId, "Manager");
    employee = await fixture("EMPLOYEE", divisionId, departmentId, "Employee");
    foreignFounder = await fixture(
      "FOUNDER_CEO",
      foreignDivision.id,
      foreignDepartment.id,
      "Foreign",
    );

    const project = await prisma.project.create({
      data: {
        organizationId,
        divisionId,
        code: `PRJ-${Date.now()}`,
        name: "Robotics Lab Rollout",
        projectManagerId: manager.employeeId,
        createdByUserId: founder.userId,
      },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    try {
      await prisma.project.deleteMany({ where: { id: projectId } });
    } catch {
      // RED phase runs before delivery tables exist.
    }
    const fixtures = [founder, manager, employee, foreignFounder];
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

  it("manages milestones, risks, sprints and time logs with role gating", async () => {
    await request(app.getHttpServer())
      .post(`/api/v2/projects/${projectId}/milestones`)
      .set(await auth(employee))
      .send({ title: "Blocked", dueDate: "2026-05-01" })
      .expect(403);

    const milestone = await request(app.getHttpServer())
      .post(`/api/v2/projects/${projectId}/milestones`)
      .set(await auth(manager))
      .send({ title: "Lab hardware installed", dueDate: "2026-05-01" })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("PENDING"));
    await request(app.getHttpServer())
      .post(`/api/v2/project-milestones/${milestone.body.data.id}/complete`)
      .set(await auth(manager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("COMPLETED"));

    const risk = await request(app.getHttpServer())
      .post(`/api/v2/projects/${projectId}/risks`)
      .set(await auth(manager))
      .send({ title: "Component lead time", severity: "HIGH", likelihood: "MEDIUM" })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("OPEN"));
    await request(app.getHttpServer())
      .patch(`/api/v2/project-risks/${risk.body.data.id}`)
      .set(await auth(manager))
      .send({ status: "CLOSED", mitigation: "Ordered from a second supplier." })
      .expect(200)
      .expect(({ body }) => expect(body.data.status).toBe("CLOSED"));

    const sprint = await request(app.getHttpServer())
      .post(`/api/v2/projects/${projectId}/sprints`)
      .set(await auth(manager))
      .send({ name: `Sprint 1 ${Date.now()}`, startsOn: "2026-05-01", endsOn: "2026-05-14" })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/project-sprints/${sprint.body.data.id}/start`)
      .set(await auth(manager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("ACTIVE"));

    await request(app.getHttpServer())
      .post(`/api/v2/projects/${projectId}/time-logs`)
      .set(await auth(employee))
      .send({ workDate: "2026-05-03", hours: 6.5, note: "Sensor calibration." })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/projects/${projectId}/time-logs`)
      .set(await auth(manager))
      .send({ workDate: "2026-05-03", hours: 4 })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v2/projects/${projectId}/milestones`)
      .set(await auth(foreignFounder))
      .expect(404);
  });
});
