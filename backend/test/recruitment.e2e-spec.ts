import argon2 from "argon2";
import cookieParser from "cookie-parser";
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

describe("V2 recruitment and onboarding", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let organizationId: string;
  let otherOrganizationId: string;
  let divisionId: string;
  let departmentId: string;
  let hiringManagerId: string;
  const password = "recruitment-test-password";

  type Fixture = { userId: string; employeeId: string; email: string };
  let founder: Fixture;
  let hrManager: Fixture;
  let hrExecutive: Fixture;
  let employee: Fixture;
  let foreignFounder: Fixture;
  const accessTokens = new Map<string, string>();

  async function createFixture(
    roleName: string,
    orgId: string,
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
            employeeCode: `REC-${stamp.slice(0, 18)}`,
            firstName: label,
            lastName: "Recruitment",
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

  async function auth(fixture: Fixture) {
    const cached = accessTokens.get(fixture.userId);
    if (cached) return { Authorization: `Bearer ${cached}` };
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: fixture.email, password })
      .expect(201);
    const token = response.body.data.accessToken as string;
    accessTokens.set(fixture.userId, token);
    return { Authorization: `Bearer ${token}` };
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

    const other = await prisma.organization.create({
      data: { legalName: "Recruitment Isolation Org", slug: `recruitment-${Date.now()}` },
    });
    otherOrganizationId = other.id;
    const otherDivision = await prisma.division.create({
      data: { organizationId: other.id, name: "Other", slug: "other" },
    });
    const otherDepartment = await prisma.department.create({
      data: { divisionId: otherDivision.id, name: "Other", slug: "other" },
    });

    founder = await createFixture("FOUNDER_CEO", organizationId, divisionId, departmentId, "Founder");
    hrManager = await createFixture("HR_MANAGER", organizationId, divisionId, departmentId, "Manager");
    hrExecutive = await createFixture("HR_EXECUTIVE", organizationId, divisionId, departmentId, "Executive");
    employee = await createFixture("EMPLOYEE", organizationId, divisionId, departmentId, "Employee");
    foreignFounder = await createFixture("FOUNDER_CEO", other.id, otherDivision.id, otherDepartment.id, "Foreign");
    hiringManagerId = founder.employeeId;
  });

  afterAll(async () => {
    for (const table of [
      "RecruitmentOnboardingTask",
      "RecruitmentOffer",
      "RecruitmentInterview",
      "RecruitmentApplicant",
      "JobRequisition",
    ]) {
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "${table}" WHERE "organizationId" IN ($1::uuid, $2::uuid)`,
          organizationId,
          otherOrganizationId,
        );
      } catch {
        // The RED phase runs before these tables exist.
      }
    }
    const fixtures = [founder, hrManager, hrExecutive, employee, foreignFounder];
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: fixtures.map((item) => item.userId) } } });
    await prisma.notification.deleteMany({ where: { userId: { in: fixtures.map((item) => item.userId) } } });
    await prisma.employee.deleteMany({ where: { id: { in: fixtures.map((item) => item.employeeId) } } });
    await prisma.user.deleteMany({ where: { id: { in: fixtures.map((item) => item.userId) } } });
    await prisma.department.deleteMany({ where: { division: { organizationId: otherOrganizationId } } });
    await prisma.division.deleteMany({ where: { organizationId: otherOrganizationId } });
    await prisma.organization.delete({ where: { id: otherOrganizationId } });
    await app.close();
  });

  it("enforces role boundaries and the requisition approval state machine", async () => {
    await request(app.getHttpServer())
      .get("/api/v2/recruitment/requisitions")
      .set(await auth(employee))
      .expect(403);

    const created = await request(app.getHttpServer())
      .post("/api/v2/recruitment/requisitions")
      .set(await auth(hrManager))
      .send({
        code: `REQ-${Date.now()}`,
        title: "Senior Robotics Engineer",
        divisionId,
        departmentId,
        hiringManagerEmployeeId: hiringManagerId,
        employmentType: "FULL_TIME",
        openings: 2,
        priority: "HIGH",
        description: "Build and deliver robotics laboratory programmes.",
        requirements: "Five years of embedded systems and mentoring experience.",
      })
      .expect(201);
    const requisitionId = created.body.data.id as string;
    expect(created.body.data.status).toBe("DRAFT");

    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/requisitions/${requisitionId}/submit`)
      .set(await auth(hrExecutive))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/requisitions/${requisitionId}/approve`)
      .set(await auth(hrExecutive))
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/requisitions/${requisitionId}/approve`)
      .set(await auth(founder))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("APPROVED"));
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/requisitions/${requisitionId}/open`)
      .set(await auth(hrManager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("OPEN"));

    await request(app.getHttpServer())
      .get(`/api/v2/recruitment/requisitions/${requisitionId}`)
      .set(await auth(foreignFounder))
      .expect(404);
  });

  it("runs applicant, interview, offer, and onboarding workflows without cross-org leakage", async () => {
    const requisition = await request(app.getHttpServer())
      .post("/api/v2/recruitment/requisitions")
      .set(await auth(hrManager))
      .send({
        code: `REQ-FLOW-${Date.now()}`,
        title: "Learning Programme Manager",
        divisionId,
        departmentId,
        hiringManagerEmployeeId: hiringManagerId,
        employmentType: "FULL_TIME",
        openings: 1,
        priority: "MEDIUM",
        description: "Own programme delivery and the candidate onboarding workflow.",
      })
      .expect(201);
    const requisitionId = requisition.body.data.id as string;
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/requisitions/${requisitionId}/submit`)
      .set(await auth(hrManager))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/requisitions/${requisitionId}/approve`)
      .set(await auth(founder))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/requisitions/${requisitionId}/open`)
      .set(await auth(hrManager))
      .expect(201);

    const applicant = await request(app.getHttpServer())
      .post("/api/v2/recruitment/applicants")
      .set(await auth(hrExecutive))
      .send({
        requisitionId,
        firstName: "Asha",
        lastName: "Rao",
        email: `asha-${Date.now()}@example.test`,
        phone: "+919876543210",
        source: "REFERRAL",
        consentAt: new Date().toISOString(),
      })
      .expect(201);
    const applicantId = applicant.body.data.id as string;

    const interview = await request(app.getHttpServer())
      .post(`/api/v2/recruitment/applicants/${applicantId}/interviews`)
      .set(await auth(hrManager))
      .send({
        roundName: "Technical panel",
        scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
        durationMinutes: 60,
        mode: "VIDEO",
        interviewerEmployeeId: hiringManagerId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/interviews/${interview.body.data.id}/complete`)
      .set(await auth(hrManager))
      .send({ score: 4.5, recommendation: "STRONG_HIRE", feedback: "Strong technical and teaching evidence." })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/applicants/${applicantId}/offers`)
      .set(await auth(hrExecutive))
      .send({ annualCtc: 1200000, currency: "INR", joiningDate: "2026-10-01" })
      .expect(403);

    const offer = await request(app.getHttpServer())
      .post(`/api/v2/recruitment/applicants/${applicantId}/offers`)
      .set(await auth(hrManager))
      .send({ annualCtc: 1200000, currency: "INR", joiningDate: "2026-10-01" })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/offers/${offer.body.data.id}/issue`)
      .set(await auth(hrManager))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/recruitment/offers/${offer.body.data.id}/record-response`)
      .set(await auth(hrManager))
      .send({ accepted: true })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("ACCEPTED"));

    const onboarding = await request(app.getHttpServer())
      .post(`/api/v2/recruitment/applicants/${applicantId}/onboarding-tasks`)
      .set(await auth(hrExecutive))
      .send({ title: "Collect policy acknowledgements", ownerEmployeeId: hrExecutive.employeeId })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/api/v2/recruitment/onboarding-tasks/${onboarding.body.data.id}`)
      .set(await auth(hrExecutive))
      .send({ status: "COMPLETED" })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v2/recruitment/applicants/${applicantId}`)
      .set(await auth(foreignFounder))
      .expect(404);
  });
});
