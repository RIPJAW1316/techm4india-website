import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("V2 programs assessments (assignments, grading, certificates)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const password = "assessments-test-password";
  let organizationId: string;
  let foreignOrganizationId: string;
  let divisionId: string;
  let departmentId: string;
  let programId: string;
  let completedEnrollmentId: string;
  let activeEnrollmentId: string;

  type Fixture = { userId: string; employeeId: string; email: string };
  let founder: Fixture;
  let trainer: Fixture;
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
            employeeCode: `ASM-${stamp.slice(0, 18)}`,
            firstName: label,
            lastName: "Assess",
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
      data: { legalName: "Foreign Assess Org", slug: `assess-${Date.now()}` },
    });
    foreignOrganizationId = foreign.id;
    const foreignDivision = await prisma.division.create({
      data: { organizationId: foreign.id, name: "Foreign", slug: "foreign" },
    });
    const foreignDepartment = await prisma.department.create({
      data: { divisionId: foreignDivision.id, name: "Foreign", slug: "foreign" },
    });

    founder = await fixture("FOUNDER_CEO", divisionId, departmentId, "Founder");
    trainer = await fixture("FACULTY_TRAINER", divisionId, departmentId, "Trainer");
    employee = await fixture("EMPLOYEE", divisionId, departmentId, "Employee");
    foreignFounder = await fixture(
      "FOUNDER_CEO",
      foreignDivision.id,
      foreignDepartment.id,
      "Foreign",
    );

    const stamp = Date.now();
    const program = await prisma.program.create({
      data: {
        organizationId,
        divisionId,
        code: `PRG-ASM-${stamp}`,
        name: "Robotics Certification",
        slug: `robotics-cert-${stamp}`,
        category: "Coding & Robotics",
        shortDescription: "Certification programme for robotics fundamentals.",
        durationHours: 20,
        assessmentMethod: "PROJECT",
        status: "PUBLISHED",
        createdByUserId: founder.userId,
      },
    });
    programId = program.id;
    const batch = await prisma.programBatch.create({
      data: {
        organizationId,
        programId,
        code: `BAT-ASM-${stamp}`,
        name: "Cert Cohort",
        startsOn: new Date("2026-05-01"),
        endsOn: new Date("2026-05-30"),
        capacity: 10,
        status: "OPEN",
      },
    });
    const [studentA, studentB] = await Promise.all([
      prisma.student.create({
        data: {
          organizationId,
          studentCode: `STU-A-${stamp}`,
          firstName: "Aisha",
          lastName: "Khan",
          consentAt: new Date(),
        },
      }),
      prisma.student.create({
        data: {
          organizationId,
          studentCode: `STU-B-${stamp}`,
          firstName: "Rohan",
          lastName: "Mehta",
          consentAt: new Date(),
        },
      }),
    ]);
    const completed = await prisma.programEnrollment.create({
      data: {
        organizationId,
        batchId: batch.id,
        studentId: studentA.id,
        status: "COMPLETED",
        progressPercent: 100,
      },
    });
    const active = await prisma.programEnrollment.create({
      data: { organizationId, batchId: batch.id, studentId: studentB.id, status: "ACTIVE" },
    });
    completedEnrollmentId = completed.id;
    activeEnrollmentId = active.id;
  });

  afterAll(async () => {
    try {
      const orgs = [organizationId, foreignOrganizationId];
      await prisma.programCertificate.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.assignmentSubmission.deleteMany({
        where: { assignment: { organizationId: { in: orgs } } },
      });
      await prisma.programAssignment.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.programEnrollment.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.programBatch.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.student.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.program.deleteMany({ where: { organizationId: { in: orgs } } });
    } catch {
      // RED phase runs before assessment tables exist.
    }
    const fixtures = [founder, trainer, employee, foreignFounder];
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

  it("grades submissions within the maximum and certifies completed enrollments", async () => {
    await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/assignments`)
      .set(await auth(employee))
      .send({ title: "Blocked", maxScore: 100 })
      .expect(403);

    const assignment = await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/assignments`)
      .set(await auth(trainer))
      .send({ title: "Final robotics build", maxScore: 100 })
      .expect(201);
    const assignmentId = assignment.body.data.id as string;

    const submission = await request(app.getHttpServer())
      .post(`/api/v2/program-enrollments/${completedEnrollmentId}/submissions`)
      .set(await auth(trainer))
      .send({ assignmentId, submissionUrl: "https://example.test/build.pdf" })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("SUBMITTED"));
    const submissionId = submission.body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/assignment-submissions/${submissionId}/grade`)
      .set(await auth(trainer))
      .send({ score: 90, feedback: "Excellent build quality." })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("GRADED"));

    // A score above the assignment maximum is rejected.
    await request(app.getHttpServer())
      .post(`/api/v2/assignment-submissions/${submissionId}/grade`)
      .set(await auth(trainer))
      .send({ score: 150 })
      .expect(400);

    const certificate = await request(app.getHttpServer())
      .post(`/api/v2/program-enrollments/${completedEnrollmentId}/certificate`)
      .set(await auth(trainer))
      .send({})
      .expect(201)
      .expect(({ body }) => expect(body.data.certificateNumber).toBeTruthy());
    expect(certificate.body.data.enrollmentId).toBe(completedEnrollmentId);

    // A certificate cannot be issued twice.
    await request(app.getHttpServer())
      .post(`/api/v2/program-enrollments/${completedEnrollmentId}/certificate`)
      .set(await auth(trainer))
      .send({})
      .expect(409);

    // A certificate cannot be issued for an incomplete enrollment.
    await request(app.getHttpServer())
      .post(`/api/v2/program-enrollments/${activeEnrollmentId}/certificate`)
      .set(await auth(trainer))
      .send({})
      .expect(409);

    // Cross-organization access is denied.
    await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/assignments`)
      .set(await auth(foreignFounder))
      .send({ title: "Cross-org", maxScore: 100 })
      .expect(404);
  });
});
