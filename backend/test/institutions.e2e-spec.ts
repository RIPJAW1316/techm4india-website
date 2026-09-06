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
describe("V2-6 institutions", () => {
  let app: INestApplication,
    prisma: PrismaService,
    orgId: string,
    departmentId: string,
    otherOrgId: string,
    otherDepartmentId: string;
  const password = "v2-6-institution-password";
  type Fixture = { userId: string; employeeId: string; email: string };
  const cache = new Map<string, string>();
  let founder: Fixture,
    manager: Fixture,
    executive: Fixture,
    otherExecutive: Fixture,
    employee: Fixture,
    hr: Fixture,
    foreignFounder: Fixture;
  async function fixture(
    roleName: string,
    organizationId: string,
    department: string,
    label: string,
  ): Promise<Fixture> {
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: roleName },
    });
    const stamp = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = await prisma.user.create({
      data: {
        email: `${stamp.toLowerCase()}@example.test`,
        passwordHash: await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 19_456,
          parallelism: 1,
          timeCost: 2,
        }),
        status: "ACTIVE",
        roles: { create: { roleId: role.id } },
        employee: {
          create: {
            employeeCode: `INS-${stamp.slice(0, 20)}`,
            firstName: label,
            lastName: "Institution",
            designation: roleName,
            division: {
              connect: {
                id: (
                  await prisma.department.findUniqueOrThrow({
                    where: { id: department },
                    select: { divisionId: true },
                  })
                ).divisionId,
              },
            },
            department: { connect: { id: department } },
          },
        },
      },
      include: { employee: true },
    });
    return {
      userId: user.id,
      employeeId: user.employee!.id,
      email: user.email,
    };
  }
  async function headers(user: Fixture) {
    let token = cache.get(user.email);
    if (!token) {
      const responseToken = (
        await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({ email: user.email, password })
          .expect(201)
      ).body.data.accessToken as string;
      token = responseToken;
      cache.set(user.email, responseToken);
    }
    return { Authorization: `Bearer ${token}` };
  }
  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
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
    orgId = (
      await prisma.organization.findUniqueOrThrow({
        where: { slug: "techm4india" },
      })
    ).id;
    departmentId = (
      await prisma.department.findFirstOrThrow({
        where: { division: { organizationId: orgId } },
      })
    ).id;
    const other = await prisma.organization.create({
      data: {
        legalName: "Institution Test Foreign",
        slug: `institution-foreign-${Date.now()}`,
      },
    });
    otherOrgId = other.id;
    const division = await prisma.division.create({
      data: { organizationId: otherOrgId, name: "Foreign", slug: "foreign" },
    });
    otherDepartmentId = (
      await prisma.department.create({
        data: { divisionId: division.id, name: "Foreign", slug: "foreign" },
      })
    ).id;
    founder = await fixture("FOUNDER_CEO", orgId, departmentId, "Founder");
    manager = await fixture("SALES_MANAGER", orgId, departmentId, "Manager");
    executive = await fixture(
      "SALES_EXECUTIVE",
      orgId,
      departmentId,
      "Executive",
    );
    otherExecutive = await fixture(
      "SALES_EXECUTIVE",
      orgId,
      departmentId,
      "OtherExecutive",
    );
    employee = await fixture("EMPLOYEE", orgId, departmentId, "Employee");
    hr = await fixture("HR_MANAGER", orgId, departmentId, "Hr");
    foreignFounder = await fixture(
      "FOUNDER_CEO",
      otherOrgId,
      otherDepartmentId,
      "ForeignFounder",
    );
  });
  afterAll(async () => {
    const users = [
      founder,
      manager,
      executive,
      otherExecutive,
      employee,
      hr,
      foreignFounder,
    ];
    await prisma.institutionEngagement.deleteMany({
      where: { organizationId: { in: [orgId, otherOrgId] } },
    });
    await prisma.institutionContact.deleteMany({
      where: { institution: { organizationId: { in: [orgId, otherOrgId] } } },
    });
    await prisma.institution.deleteMany({
      where: { organizationId: { in: [orgId, otherOrgId] } },
    });
    await prisma.crmActivity.deleteMany({
      where: { organizationId: { in: [orgId, otherOrgId] } },
    });
    await prisma.crmLead.deleteMany({
      where: { organizationId: { in: [orgId, otherOrgId] } },
    });
    await prisma.crmOpportunity.deleteMany({
      where: { organizationId: { in: [orgId, otherOrgId] } },
    });
    await prisma.crmContact.deleteMany({
      where: { organizationId: { in: [orgId, otherOrgId] } },
    });
    await prisma.crmAccount.deleteMany({
      where: { organizationId: { in: [orgId, otherOrgId] } },
    });
    await prisma.notification.deleteMany({
      where: { userId: { in: users.map((x) => x.userId) } },
    });
    await prisma.auditLog.deleteMany({
      where: { actorUserId: { in: users.map((x) => x.userId) } },
    });
    await prisma.employee.deleteMany({
      where: { id: { in: users.map((x) => x.employeeId) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: users.map((x) => x.userId) } },
    });
    await prisma.department.delete({ where: { id: otherDepartmentId } });
    const division = await prisma.division.findFirst({
      where: { organizationId: otherOrgId },
    });
    if (division) await prisma.division.delete({ where: { id: division.id } });
    await prisma.organization.delete({ where: { id: otherOrgId } });
    await app.close();
  });
  it("enforces organization, role, owner and CRM link boundaries", async () => {
    const h = await headers(founder);
    const account = await prisma.crmAccount.create({
      data: { organizationId: orgId, name: "Institution account" },
    });
    const created = await request(app.getHttpServer())
      .post("/api/v2/institutions")
      .set(h)
      .send({
        code: `SCH-${Date.now()}`,
        name: "Northstar Demo School",
        type: "SCHOOL",
        relationshipOwnerEmployeeId: executive.employeeId,
        crmAccountId: account.id,
        studentStrength: 120,
      })
      .expect(201);
    const id = created.body.data.id;
    expect(
      await prisma.notification.count({
        where: {
          userId: executive.userId,
          resourceId: id,
          type: "INSTITUTION_ASSIGNED",
        },
      }),
    ).toBe(1);
    await request(app.getHttpServer())
      .get("/api/v2/institutions")
      .set(await headers(manager))
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/v2/institutions/${id}`)
      .set(await headers(executive))
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/v2/institutions/${id}`)
      .set(await headers(otherExecutive))
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/api/v2/institutions/${id}`)
      .set(await headers(executive))
      .send({ relationshipOwnerEmployeeId: otherExecutive.employeeId })
      .expect(403);
    await request(app.getHttpServer())
      .post("/api/v2/institutions")
      .set(await headers(employee))
      .send({ code: "NO", name: "No access" })
      .expect(403);
    await request(app.getHttpServer())
      .post("/api/v2/institutions")
      .set(await headers(hr))
      .send({ code: "NOHR", name: "No access" })
      .expect(403);
    const foreignAccount = await prisma.crmAccount.create({
      data: { organizationId: otherOrgId, name: "Foreign account" },
    });
    await request(app.getHttpServer())
      .post("/api/v2/institutions")
      .set(h)
      .send({
        code: `BAD-${Date.now()}`,
        name: "Cross org",
        crmAccountId: foreignAccount.id,
      })
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/v2/institutions")
      .set(h)
      .send({ code: created.body.data.code, name: "Duplicate" })
      .expect(409);
  });
  it("manages contacts, primary replacement, engagements and dashboard without cross-org leakage", async () => {
    const h = await headers(founder);
    const inst = await request(app.getHttpServer())
      .post("/api/v2/institutions")
      .set(h)
      .send({
        code: `UNI-${Date.now()}`,
        name: "Example Institute of Technology",
        status: "ACTIVE",
        relationshipOwnerEmployeeId: executive.employeeId,
      })
      .expect(201);
    const id = inst.body.data.id;
    const first = await request(app.getHttpServer())
      .post(`/api/v2/institutions/${id}/contacts`)
      .set(h)
      .send({
        firstName: "Asha",
        lastName: "Principal",
        email: "asha@example.test",
        isPrimary: true,
      })
      .expect(201);
    const second = await request(app.getHttpServer())
      .post(`/api/v2/institutions/${id}/contacts`)
      .set(h)
      .send({ firstName: "Ravi", lastName: "Dean", isPrimary: true })
      .expect(201);
    const contacts = await request(app.getHttpServer())
      .get(`/api/v2/institutions/${id}/contacts`)
      .set(h)
      .expect(200);
    expect(
      contacts.body.data.filter((x: { isPrimary: boolean }) => x.isPrimary),
    ).toHaveLength(1);
    expect(contacts.body.data[0].id).toBe(second.body.data.id);
    const foreignInstitution = await request(app.getHttpServer())
      .post("/api/v2/institutions")
      .set(await headers(foreignFounder))
      .send({ code: `FOR-${Date.now()}`, name: "Foreign Institution" })
      .expect(201);
    await request(app.getHttpServer())
      .patch(
        `/api/v2/institutions/${foreignInstitution.body.data.id}/contacts/${first.body.data.id}`,
      )
      .set(h)
      .send({ roleTitle: "Invalid" })
      .expect(404);
    const opportunity = await prisma.crmOpportunity.create({
      data: { organizationId: orgId, name: "Institution opportunity" },
    });
    const engagement = await request(app.getHttpServer())
      .post(`/api/v2/institutions/${id}/engagements`)
      .set(h)
      .send({
        title: "Robotics workshop",
        type: "WORKSHOP",
        status: "PLANNED",
        startDate: "2030-01-10",
        endDate: "2030-01-12",
        ownerEmployeeId: executive.employeeId,
        crmOpportunityId: opportunity.id,
        estimatedParticipants: 40,
      })
      .expect(201);
    await request(app.getHttpServer())
      .patch(
        `/api/v2/institutions/${id}/engagements/${engagement.body.data.id}`,
      )
      .set(h)
      .send({ status: "COMPLETED" })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/v2/institutions/${id}/engagements`)
      .set(h)
      .send({
        title: "Invalid dates",
        startDate: "2030-02-10",
        endDate: "2030-01-10",
      })
      .expect(400);
    const foreignOpportunity = await prisma.crmOpportunity.create({
      data: { organizationId: otherOrgId, name: "Foreign opportunity" },
    });
    await request(app.getHttpServer())
      .post(`/api/v2/institutions/${id}/engagements`)
      .set(h)
      .send({ title: "Cross", crmOpportunityId: foreignOpportunity.id })
      .expect(400);
    const dash = await request(app.getHttpServer())
      .get("/api/v2/institutions/dashboard")
      .set(h)
      .expect(200);
    expect(dash.body.data.total).toBeGreaterThanOrEqual(1);
    expect(dash.body.data.engagementCounts.COMPLETED).toBeGreaterThanOrEqual(1);
    await request(app.getHttpServer())
      .post(`/api/v2/institutions/${id}/archive`)
      .set(h)
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/api/v2/institutions/${id}`)
      .set(h)
      .send({ name: "Cannot edit" })
      .expect(409);
  });
});
