import cookieParser from "cookie-parser";
import argon2 from "argon2";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("V2-5 CRM", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgId: string;
  let departmentId: string;
  let otherOrgId: string;
  let otherDepartmentId: string;
  const password = "v2-5-crm-password";
  const tokens = new Map<string, string>();
  type Fixture = { userId: string; employeeId: string; email: string };
  let founder: Fixture;
  let manager: Fixture;
  let director: Fixture;
  let executive: Fixture;
  let otherExecutive: Fixture;
  let employee: Fixture;
  let hr: Fixture;
  let foreignFounder: Fixture;
  async function fixture(
    roleName: string,
    organizationId: string,
    department: string,
    label: string,
  ): Promise<Fixture> {
    const stamp = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: roleName },
    });
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
            employeeCode: `CRM-${stamp.slice(0, 20)}`,
            firstName: label,
            lastName: "CRM",
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
  async function token(user: Fixture) {
    const cached = tokens.get(user.email);
    if (cached) return cached;
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: user.email, password })
      .expect(201);
    const value = response.body.data.accessToken as string;
    tokens.set(user.email, value);
    return value;
  }
  const auth = async (user: Fixture) => ({
    Authorization: `Bearer ${await token(user)}`,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ defaultVersion: "1", type: VersioningType.URI });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    prisma = app.get(PrismaService);
    const org = await prisma.organization.findUniqueOrThrow({
      where: { slug: "techm4india" },
    });
    orgId = org.id;
    departmentId = (
      await prisma.department.findFirstOrThrow({
        where: { division: { organizationId: orgId } },
      })
    ).id;
    const other = await prisma.organization.create({
      data: {
        legalName: "CRM Test Other Organization",
        slug: `crm-other-${Date.now()}`,
      },
    });
    otherOrgId = other.id;
    const division = await prisma.division.create({
      data: { organizationId: otherOrgId, name: "Other", slug: "other" },
    });
    otherDepartmentId = (
      await prisma.department.create({
        data: {
          divisionId: division.id,
          name: "Other Department",
          slug: "other",
        },
      })
    ).id;
    founder = await fixture("FOUNDER_CEO", orgId, departmentId, "Founder");
    manager = await fixture("SALES_MANAGER", orgId, departmentId, "Manager");
    director = await fixture("DIRECTOR", orgId, departmentId, "Director");
    executive = await fixture("SALES_EXECUTIVE", orgId, departmentId, "Executive");
    otherExecutive = await fixture("SALES_EXECUTIVE", orgId, departmentId, "OtherExecutive");
    employee = await fixture("EMPLOYEE", orgId, departmentId, "Employee");
    hr = await fixture("HR_MANAGER", orgId, departmentId, "Hr");
    foreignFounder = await fixture("FOUNDER_CEO", otherOrgId, otherDepartmentId, "ForeignFounder");
  });
  afterAll(async () => {
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
    const users = [
      founder,
      manager,
      director,
      executive,
      otherExecutive,
      employee,
      hr,
      foreignFounder,
    ];
    await prisma.notification.deleteMany({
      where: { userId: { in: users.map((item) => item.userId) } },
    });
    await prisma.auditLog.deleteMany({
      where: { actorUserId: { in: users.map((item) => item.userId) } },
    });
    await prisma.employee.deleteMany({
      where: { id: { in: users.map((item) => item.employeeId) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: users.map((item) => item.userId) } },
    });
    await prisma.department.delete({ where: { id: otherDepartmentId } });
    const division = await prisma.division.findFirst({
      where: { organizationId: otherOrgId },
    });
    if (division) await prisma.division.delete({ where: { id: division.id } });
    await prisma.organization.delete({ where: { id: otherOrgId } });
    await app.close();
  });

  it("enforces CRM role and ownership scope", async () => {
    const headers = await auth(founder);
    const created = await request(app.getHttpServer())
      .post("/api/v2/crm/leads")
      .set(headers)
      .send({
        firstName: "Asha",
        lastName: "Lead",
        companyName: "Demo Prospect",
        source: "WEBSITE",
        ownerEmployeeId: executive.employeeId,
        estimatedValue: 120000,
        currency: "INR",
      })
      .expect(201);
    const leadId = created.body.data.id;
    expect(
      await prisma.notification.count({
        where: {
          userId: executive.userId,
          resourceId: leadId,
          type: "CRM_LEAD_ASSIGNED",
        },
      }),
    ).toBe(1);
    await request(app.getHttpServer())
      .get("/api/v2/crm/leads")
      .set(await auth(manager))
      .expect(200);
    await request(app.getHttpServer())
      .get("/api/v2/crm/leads")
      .set(await auth(director))
      .expect(200);
    await request(app.getHttpServer())
      .post("/api/v2/crm/leads")
      .set(await auth(director))
      .send({ firstName: "Read", lastName: "Only" })
      .expect(403);
    const owned = await request(app.getHttpServer())
      .get(`/api/v2/crm/leads/${leadId}`)
      .set(await auth(executive))
      .expect(200);
    expect(owned.body.data.ownerEmployeeId).toBe(executive.employeeId);
    await request(app.getHttpServer())
      .get(`/api/v2/crm/leads/${leadId}`)
      .set(await auth(otherExecutive))
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/api/v2/crm/leads/${leadId}`)
      .set(await auth(executive))
      .send({ ownerEmployeeId: otherExecutive.employeeId })
      .expect(403);
    await request(app.getHttpServer())
      .post("/api/v2/crm/leads")
      .set(await auth(employee))
      .send({ firstName: "No", lastName: "Access" })
      .expect(403);
    await request(app.getHttpServer())
      .post("/api/v2/crm/leads")
      .set(await auth(hr))
      .send({ firstName: "No", lastName: "Access" })
      .expect(403);
  });
  it("converts once, validates cross-organization relations, and supports pipeline/activity lifecycle", async () => {
    const founderHeaders = await auth(founder);
    const foreignLead = await request(app.getHttpServer())
      .post("/api/v2/crm/leads")
      .set(await auth(foreignFounder))
      .send({ firstName: "Foreign", lastName: "Lead" })
      .expect(201);
    await request(app.getHttpServer())
      .get(`/api/v2/crm/leads/${foreignLead.body.data.id}`)
      .set(founderHeaders)
      .expect(404);
    const foreignAccount = await prisma.crmAccount.create({
      data: { organizationId: otherOrgId, name: "Foreign Account" },
    });
    const foreignContact = await prisma.crmContact.create({
      data: {
        organizationId: otherOrgId,
        accountId: foreignAccount.id,
        firstName: "Foreign",
        lastName: "Contact",
      },
    });
    await request(app.getHttpServer())
      .post("/api/v2/crm/contacts")
      .set(founderHeaders)
      .send({
        firstName: "Cross",
        lastName: "Contact",
        accountId: foreignAccount.id,
      })
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/v2/crm/opportunities")
      .set(founderHeaders)
      .send({ name: "Cross account", accountId: foreignAccount.id })
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/v2/crm/opportunities")
      .set(founderHeaders)
      .send({ name: "Cross contact", primaryContactId: foreignContact.id })
      .expect(400);
    const lead = await request(app.getHttpServer())
      .post("/api/v2/crm/leads")
      .set(founderHeaders)
      .send({
        firstName: "Conversion",
        lastName: "Lead",
        companyName: "Example Prospect",
        ownerEmployeeId: executive.employeeId,
        estimatedValue: 5000,
        currency: "USD",
        nextFollowUpAt: new Date(Date.now() - 86_400_000).toISOString(),
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/crm/leads/${lead.body.data.id}/convert`)
      .set(founderHeaders)
      .send({ existingAccountId: foreignAccount.id })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/api/v2/crm/leads/${lead.body.data.id}/convert`)
      .set(founderHeaders)
      .send({ existingContactId: foreignContact.id })
      .expect(400);
    const converted = await request(app.getHttpServer())
      .post(`/api/v2/crm/leads/${lead.body.data.id}/convert`)
      .set(founderHeaders)
      .send({
        opportunityName: "Example opportunity",
        estimatedValue: 5000,
        currency: "USD",
      })
      .expect(201);
    expect(converted.body.data.status).toBe("CONVERTED");
    expect(converted.body.data.convertedOpportunityId).toBeTruthy();
    await request(app.getHttpServer())
      .post(`/api/v2/crm/leads/${lead.body.data.id}/convert`)
      .set(founderHeaders)
      .send({})
      .expect(409);
    const opportunityId = converted.body.data.convertedOpportunityId;
    await request(app.getHttpServer())
      .post("/api/v2/crm/opportunities")
      .set(founderHeaders)
      .send({
        name: "INR pipeline opportunity",
        accountId: converted.body.data.convertedAccountId,
        estimatedValue: 120000,
        currency: "INR",
      })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/api/v2/crm/opportunities/${opportunityId}`)
      .set(founderHeaders)
      .send({ stage: "WON" })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/v2/crm/opportunities/${opportunityId}`)
      .set(founderHeaders)
      .send({ stage: "LOST", lostReason: "Demo lifecycle test" })
      .expect(200);
    const activity = await request(app.getHttpServer())
      .post("/api/v2/crm/activities")
      .set(founderHeaders)
      .send({
        subject: "Follow up Example",
        type: "FOLLOW_UP",
        leadId: lead.body.data.id,
        ownerEmployeeId: executive.employeeId,
        dueAt: new Date(Date.now() - 86_400_000).toISOString(),
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/crm/activities/${activity.body.data.id}/complete`)
      .set(founderHeaders)
      .expect(201);
    await request(app.getHttpServer())
      .get(`/api/v2/crm/activities?ownerEmployeeId=${executive.employeeId}`)
      .set(await auth(otherExecutive))
      .expect(403);
    const dashboard = await request(app.getHttpServer())
      .get("/api/v2/crm/dashboard")
      .set(founderHeaders)
      .expect(200);
    expect(
      dashboard.body.data.opportunityStages.some(
        (item: { currency: string }) => item.currency === "USD",
      ),
    ).toBe(true);
    expect(
      dashboard.body.data.opportunityStages.some(
        (item: { currency: string }) => item.currency === "INR",
      ),
    ).toBe(true);
  });
});
