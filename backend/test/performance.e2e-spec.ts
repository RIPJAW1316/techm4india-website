import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("V2 performance management", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const password = "performance-test-password";
  let organizationId: string;
  let foreignOrganizationId: string;
  let divisionId: string;
  let departmentId: string;

  type Fixture = { userId: string; employeeId: string; email: string };
  let founder: Fixture;
  let hrManager: Fixture;
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
            employeeCode: `PERF-${stamp.slice(0, 16)}`,
            firstName: label,
            lastName: "Performance",
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

  async function createActiveCycle(): Promise<string> {
    const created = await request(app.getHttpServer())
      .post("/api/v2/performance/cycles")
      .set(await auth(founder))
      .send({
        code: `CYC-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name: "FY26 Annual Review",
        type: "ANNUAL",
        startsOn: "2026-04-01",
        endsOn: "2027-03-31",
        ratingScaleMax: 5,
      })
      .expect(201);
    const cycleId = created.body.data.id as string;
    await request(app.getHttpServer())
      .post(`/api/v2/performance/cycles/${cycleId}/activate`)
      .set(await auth(founder))
      .expect(201);
    return cycleId;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ defaultVersion: "1", type: VersioningType.URI });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true }));
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
      data: { legalName: "Foreign Performance Org", slug: `performance-${Date.now()}` },
    });
    foreignOrganizationId = foreign.id;
    const foreignDivision = await prisma.division.create({
      data: { organizationId: foreign.id, name: "Foreign", slug: "foreign" },
    });
    const foreignDepartment = await prisma.department.create({
      data: { divisionId: foreignDivision.id, name: "Foreign", slug: "foreign" },
    });

    founder = await fixture("FOUNDER_CEO", divisionId, departmentId, "Founder");
    hrManager = await fixture("HR_MANAGER", divisionId, departmentId, "Manager");
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
      const orgs = [organizationId, foreignOrganizationId];
      await prisma.performanceReview.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.performanceGoal.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.performanceCycle.deleteMany({ where: { organizationId: { in: orgs } } });
    } catch {
      // RED phase runs before performance tables exist.
    }
    const fixtures = [founder, hrManager, employee, foreignFounder];
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: fixtures.map((item) => item.userId) } } });
    await prisma.employee.deleteMany({ where: { id: { in: fixtures.map((item) => item.employeeId) } } });
    await prisma.user.deleteMany({ where: { id: { in: fixtures.map((item) => item.userId) } } });
    await prisma.department.deleteMany({ where: { division: { organizationId: foreignOrganizationId } } });
    await prisma.division.deleteMany({ where: { organizationId: foreignOrganizationId } });
    await prisma.organization.delete({ where: { id: foreignOrganizationId } });
    await app.close();
  });

  it("enforces permissions and the cycle and goal lifecycle", async () => {
    await request(app.getHttpServer())
      .post("/api/v2/performance/cycles")
      .set(await auth(employee))
      .send({})
      .expect(403);

    const created = await request(app.getHttpServer())
      .post("/api/v2/performance/cycles")
      .set(await auth(founder))
      .send({
        code: `CYC-${Date.now()}`,
        name: "FY26 Annual Review",
        type: "ANNUAL",
        startsOn: "2026-04-01",
        endsOn: "2027-03-31",
        ratingScaleMax: 5,
      })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("DRAFT"));
    const cycleId = created.body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/performance/cycles/${cycleId}/activate`)
      .set(await auth(hrManager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("ACTIVE"));

    await request(app.getHttpServer())
      .post(`/api/v2/performance/cycles/${cycleId}/goals`)
      .set(await auth(founder))
      .send({
        employeeId: employee.employeeId,
        title: "Ship the robotics delivery milestones",
        category: "BUSINESS",
        weight: 70,
      })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("ACTIVE"));

    await request(app.getHttpServer())
      .post(`/api/v2/performance/cycles/${cycleId}/goals`)
      .set(await auth(founder))
      .send({ employeeId: employee.employeeId, title: "Overweight goal", weight: 40 })
      .expect(409);

    await request(app.getHttpServer())
      .post(`/api/v2/performance/cycles/${cycleId}/goals`)
      .set(await auth(founder))
      .send({ employeeId: employee.employeeId, title: "Mentor two juniors", category: "BEHAVIORAL", weight: 30 })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v2/performance/cycles/${cycleId}`)
      .set(await auth(foreignFounder))
      .expect(404);
  });

  it("runs the multi-stage review workflow without cross-org leakage", async () => {
    const cycleId = await createActiveCycle();

    const review = await request(app.getHttpServer())
      .post(`/api/v2/performance/cycles/${cycleId}/reviews`)
      .set(await auth(founder))
      .send({ employeeId: employee.employeeId, reviewerEmployeeId: hrManager.employeeId })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("PENDING_SELF"));
    const reviewId = review.body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/performance/reviews/${reviewId}/self-assessment`)
      .set(await auth(hrManager))
      .send({ selfRating: 4, selfComments: "Not my review to submit." })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v2/performance/reviews/${reviewId}/self-assessment`)
      .set(await auth(employee))
      .send({ selfRating: 4, selfComments: "Delivered milestones and mentored the team." })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("PENDING_MANAGER"));

    await request(app.getHttpServer())
      .post(`/api/v2/performance/reviews/${reviewId}/manager-review`)
      .set(await auth(employee))
      .send({ managerRating: 5, managerComments: "Employees cannot rate themselves as manager." })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v2/performance/reviews/${reviewId}/manager-review`)
      .set(await auth(hrManager))
      .send({ managerRating: 4.5, managerComments: "Consistent delivery and strong ownership." })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("PENDING_FINALIZATION"));

    await request(app.getHttpServer())
      .post(`/api/v2/performance/reviews/${reviewId}/finalize`)
      .set(await auth(hrManager))
      .send({ finalRating: 4.2 })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v2/performance/reviews/${reviewId}/finalize`)
      .set(await auth(founder))
      .send({ finalRating: 4.2, calibrationNotes: "Calibrated against division peers." })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("FINALIZED"));

    await request(app.getHttpServer())
      .post(`/api/v2/performance/reviews/${reviewId}/acknowledge`)
      .set(await auth(employee))
      .send({ acknowledgement: "Reviewed and agreed." })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("ACKNOWLEDGED"));

    await request(app.getHttpServer())
      .get(`/api/v2/performance/reviews/${reviewId}`)
      .set(await auth(foreignFounder))
      .expect(404);
  });
});
