import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("V2 programs and learning delivery", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const password = "program-test-password";
  let organizationId: string;
  let foreignOrganizationId: string;
  let divisionId: string;
  let departmentId: string;

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
            employeeCode: `LMS-${stamp.slice(0, 18)}`,
            firstName: label,
            lastName: "Learning",
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
      data: { legalName: "Foreign Learning Org", slug: `learning-${Date.now()}` },
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
  });

  afterAll(async () => {
    try {
      const orgs = [organizationId, foreignOrganizationId];
      await prisma.lessonProgress.deleteMany({
        where: { enrollment: { batch: { organizationId: { in: orgs } } } },
      });
      await prisma.programEnrollment.deleteMany({
        where: { batch: { organizationId: { in: orgs } } },
      });
      await prisma.programBatch.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.programLesson.deleteMany({
        where: { module: { program: { organizationId: { in: orgs } } } },
      });
      await prisma.programModule.deleteMany({
        where: { program: { organizationId: { in: orgs } } },
      });
      await prisma.student.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.program.deleteMany({ where: { organizationId: { in: orgs } } });
    } catch {
      // RED phase runs before learning tables exist.
    }
    const fixtures = [founder, trainer, employee, foreignFounder];
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: fixtures.map((item) => item.userId) } } });
    await prisma.employee.deleteMany({ where: { id: { in: fixtures.map((item) => item.employeeId) } } });
    await prisma.user.deleteMany({ where: { id: { in: fixtures.map((item) => item.userId) } } });
    await prisma.department.deleteMany({ where: { division: { organizationId: foreignOrganizationId } } });
    await prisma.division.deleteMany({ where: { organizationId: foreignOrganizationId } });
    await prisma.organization.delete({ where: { id: foreignOrganizationId } });
    await app.close();
  });

  it("enforces curriculum permissions and the publication workflow", async () => {
    await request(app.getHttpServer())
      .post("/api/v2/programs")
      .set(await auth(employee))
      .send({})
      .expect(403);

    const created = await request(app.getHttpServer())
      .post("/api/v2/programs")
      .set(await auth(founder))
      .send({
        code: `PRG-${Date.now()}`,
        name: "Robotics Lab Foundations",
        slug: `robotics-lab-${Date.now()}`,
        version: "1.0",
        divisionId,
        departmentId,
        category: "Coding & Robotics",
        shortDescription: "A practical robotics laboratory foundation programme.",
        durationHours: 24,
        deliveryMode: "HYBRID",
        assessmentMethod: "PROJECT",
        capacity: 30,
      })
      .expect(201);
    const programId = created.body.data.id as string;

    const curriculumModule = await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/modules`)
      .set(await auth(trainer))
      .send({ title: "Sensors and control", description: "Build reliable sensor loops.", position: 1 })
      .expect(201);
    const lesson = await request(app.getHttpServer())
      .post(`/api/v2/program-modules/${curriculumModule.body.data.id}/lessons`)
      .set(await auth(trainer))
      .send({
        title: "Sensor calibration",
        contentType: "TEXT",
        contentBody: "Calibration steps and lab safety checks.",
        durationMinutes: 90,
        position: 1,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/publish`)
      .set(await auth(trainer))
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/submit`)
      .set(await auth(trainer))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/publish`)
      .set(await auth(founder))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("PUBLISHED"));

    await request(app.getHttpServer())
      .get(`/api/v2/programs/${programId}`)
      .set(await auth(foreignFounder))
      .expect(404);

    expect(lesson.body.data.status).toBe("DRAFT");
  });

  it("enrolls a consented student and records lesson progress", async () => {
    const program = await request(app.getHttpServer())
      .post("/api/v2/programs")
      .set(await auth(founder))
      .send({
        code: `PRG-FLOW-${Date.now()}`,
        name: "Space Systems Bootcamp",
        slug: `space-systems-${Date.now()}`,
        version: "1.0",
        divisionId,
        category: "Space Technology",
        shortDescription: "Applied systems engineering for student satellite teams.",
        durationHours: 16,
        deliveryMode: "OFFLINE",
        assessmentMethod: "PROJECT",
        capacity: 20,
      })
      .expect(201);
    const programId = program.body.data.id as string;
    const moduleResponse = await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/modules`)
      .set(await auth(founder))
      .send({ title: "Mission design", position: 1 })
      .expect(201);
    const lessonResponse = await request(app.getHttpServer())
      .post(`/api/v2/program-modules/${moduleResponse.body.data.id}/lessons`)
      .set(await auth(founder))
      .send({ title: "Mission requirements", contentType: "TEXT", contentBody: "Mission requirements lesson.", durationMinutes: 60, position: 1 })
      .expect(201);
    await request(app.getHttpServer()).post(`/api/v2/programs/${programId}/submit`).set(await auth(founder)).expect(201);
    await request(app.getHttpServer()).post(`/api/v2/programs/${programId}/publish`).set(await auth(founder)).expect(201);

    const student = await request(app.getHttpServer())
      .post("/api/v2/students")
      .set(await auth(founder))
      .send({
        studentCode: `STU-${Date.now()}`,
        firstName: "Neha",
        lastName: "Iyer",
        email: `neha-${Date.now()}@example.test`,
        consentAt: new Date().toISOString(),
      })
      .expect(201);

    const batch = await request(app.getHttpServer())
      .post(`/api/v2/programs/${programId}/batches`)
      .set(await auth(trainer))
      .send({
        code: `BAT-${Date.now()}`,
        name: "October Cohort",
        trainerEmployeeId: trainer.employeeId,
        startsOn: "2026-10-01",
        endsOn: "2026-10-15",
        capacity: 20,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/program-batches/${batch.body.data.id}/open`)
      .set(await auth(trainer))
      .expect(201);
    const enrollment = await request(app.getHttpServer())
      .post(`/api/v2/program-batches/${batch.body.data.id}/enrollments`)
      .set(await auth(trainer))
      .send({ studentId: student.body.data.id })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/api/v2/program-enrollments/${enrollment.body.data.id}/lessons/${lessonResponse.body.data.id}/progress`)
      .set(await auth(trainer))
      .send({ progressPercent: 100 })
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/v2/program-enrollments/${enrollment.body.data.id}`)
      .set(await auth(founder))
      .expect(200)
      .expect(({ body }) => expect(Number(body.data.progressPercent)).toBe(100));
  });
});
