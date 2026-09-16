import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Company and organization V2", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let organizationId: string;
  let engineeringId: string;
  let engineeringDepartmentId: string;
  let founderUserId: string;
  let employeeUserId: string;
  let divisionHeadUserId: string;
  let directorUserId: string;
  let employeeId: string;
  let branchId: string;
  let costCentreId: string;
  let teamId: string;
  let foreignOrganizationId: string;
  let foreignDivisionId: string;
  const fixtureUserIds: string[] = [];
  const tokenCache = new Map<string, string>();
  const password = "phase-v2-2-company-password";

  async function token(userId: string) {
    const cached = tokenCache.get(userId);
    if (cached) return cached;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: user.email, password })
      .expect(201);
    const accessToken = response.body.data.accessToken as string;
    tokenCache.set(userId, accessToken);
    return accessToken;
  }

  async function fixture(roleName: string, firstName: string) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await prisma.user.create({
      data: {
        email: `v22-${firstName.toLowerCase()}-${suffix}@techm4india.com`,
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
            employeeCode: `V22-${suffix}`,
            firstName,
            lastName: "Fixture",
            designation: roleName,
            divisionId: engineeringId,
            departmentId: engineeringDepartmentId,
          },
        },
      },
      include: { employee: true },
    });
    fixtureUserIds.push(user.id);
    return user;
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

    const organization = await prisma.organization.findUniqueOrThrow({
      where: { slug: "techm4india" },
    });
    organizationId = organization.id;
    const engineering = await prisma.division.findUniqueOrThrow({
      where: { organizationId_slug: { organizationId, slug: "engineering" } },
    });
    engineeringId = engineering.id;
    engineeringDepartmentId = (
      await prisma.department.findFirstOrThrow({
        where: { divisionId: engineeringId, slug: "software-engineering" },
      })
    ).id;

    const founderRole = await prisma.role.findUniqueOrThrow({ where: { name: "FOUNDER_CEO" } });
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const founder = await prisma.user.create({
      data: {
        email: `v22-founder-${suffix}@techm4india.com`,
        passwordHash: await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 19_456,
          parallelism: 1,
          timeCost: 2,
        }),
        status: "ACTIVE",
        roles: { create: { roleId: founderRole.id } },
        employee: {
          create: {
            employeeCode: `V22-FOUNDER-${suffix}`,
            firstName: "Founder",
            lastName: "Fixture",
            designation: "Founder / CEO",
            divisionId: engineeringId,
            departmentId: engineeringDepartmentId,
          },
        },
      },
    });
    founderUserId = founder.id;
    fixtureUserIds.push(founder.id);
    const employee = await fixture("EMPLOYEE", "Organization");
    const head = await fixture("DIVISION_HEAD", "Division");
    const director = await fixture("DIRECTOR", "Director");
    employeeUserId = employee.id;
    employeeId = employee.employee!.id;
    divisionHeadUserId = head.id;
    directorUserId = director.id;

    const foreignOrganization = await prisma.organization.create({
      data: { legalName: "Synthetic Other Organization", slug: `v22-other-${suffix}` },
    });
    foreignOrganizationId = foreignOrganization.id;
    const foreignDivision = await prisma.division.create({
      data: { organizationId: foreignOrganizationId, name: "Foreign Division", slug: "foreign" },
    });
    foreignDivisionId = foreignDivision.id;
  });

  afterAll(async () => {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { displayName: null, mission: null },
    });
    await prisma.teamMember.deleteMany({ where: { teamId } });
    await prisma.team.deleteMany({ where: { id: teamId } });
    await prisma.costCentre.deleteMany({ where: { id: costCentreId } });
    await prisma.branch.deleteMany({ where: { id: branchId } });
    await prisma.department.deleteMany({ where: { divisionId: foreignDivisionId } });
    await prisma.division.deleteMany({ where: { id: foreignDivisionId } });
    await prisma.organization.deleteMany({ where: { id: foreignOrganizationId } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: fixtureUserIds } } });
    await prisma.refreshSession.deleteMany({ where: { userId: { in: fixtureUserIds } } });
    await prisma.employee.deleteMany({ where: { userId: { in: fixtureUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: fixtureUserIds } } });
    await app.close();
  });

  it("reads and updates a safe company profile", async () => {
    const founderAuth = `Bearer ${await token(founderUserId)}`;
    const initial = await request(app.getHttpServer())
      .get("/api/v2/company/profile")
      .set("Authorization", founderAuth)
      .expect(200);
    expect(initial.body.data.legalName).toBe("TechM4India");
    // The seed records statutory identity because the GST module needs the
    // supplier's state code to classify a supply. It must be exposed here.
    expect(initial.body.data.identifiers).toHaveProperty("gstin");
    expect(initial.body.data.identifiers.gstin).toMatch(/^\d{2}[A-Z0-9]+$/);
    const updated = await request(app.getHttpServer())
      .patch("/api/v2/company/profile")
      .set("Authorization", founderAuth)
      .send({ displayName: "TechM4India Innovations", mission: "Synthetic test mission" })
      .expect(200);
    expect(updated.body.data.displayName).toBe("TechM4India Innovations");
    const employeeResponse = await request(app.getHttpServer())
      .get("/api/v2/company/profile")
      .set("Authorization", `Bearer ${await token(employeeUserId)}`)
      .expect(403);
    expect(employeeResponse.body.error.message).toBe("Insufficient permission");
    await request(app.getHttpServer())
      .patch("/api/v2/company/profile")
      .set("Authorization", `Bearer ${await token(employeeUserId)}`)
      .send({ displayName: "Not allowed" })
      .expect(403);
  });

  it("supports branch lifecycle and rejects duplicate organization codes", async () => {
    const auth = `Bearer ${await token(founderUserId)}`;
    const created = await request(app.getHttpServer())
      .post("/api/v2/company/branches")
      .set("Authorization", auth)
      .send({
        code: "V22-HQ",
        name: "Synthetic Headquarters",
        type: "HEADQUARTERS",
        city: "Test City",
        isActive: true,
      })
      .expect(201);
    branchId = created.body.data.id;
    await request(app.getHttpServer())
      .post("/api/v2/company/branches")
      .set("Authorization", auth)
      .send({ code: "V22-HQ", name: "Duplicate" })
      .expect(409);
    const updated = await request(app.getHttpServer())
      .patch(`/api/v2/company/branches/${branchId}`)
      .set("Authorization", auth)
      .send({
        code: "V22-HQ",
        name: "Synthetic Headquarters",
        type: "HEADQUARTERS",
        isActive: false,
      })
      .expect(200);
    expect(updated.body.data.isActive).toBe(false);
    const list = await request(app.getHttpServer())
      .get("/api/v2/company/branches?isActive=false")
      .set("Authorization", auth)
      .expect(200);
    expect(list.body.data.some((item: { id: string }) => item.id === branchId)).toBe(true);
    await request(app.getHttpServer())
      .post("/api/v2/company/branches")
      .set("Authorization", `Bearer ${await token(employeeUserId)}`)
      .send({ code: "V22-EMP", name: "Denied" })
      .expect(403);
  });

  it("creates a cost centre and rejects foreign structure linkage", async () => {
    const auth = `Bearer ${await token(founderUserId)}`;
    const created = await request(app.getHttpServer())
      .post("/api/v2/company/cost-centres")
      .set("Authorization", auth)
      .send({ code: "V22-ENG", name: "Synthetic Engineering Centre", divisionId: engineeringId })
      .expect(201);
    costCentreId = created.body.data.id;
    await request(app.getHttpServer())
      .post("/api/v2/company/cost-centres")
      .set("Authorization", auth)
      .send({ code: "V22-FOREIGN", name: "Invalid", divisionId: foreignDivisionId })
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/api/v2/company/cost-centres/${costCentreId}`)
      .set("Authorization", auth)
      .send({ code: "V22-ENG", name: "Synthetic Engineering Centre", isActive: false })
      .expect(200);
    const headList = await request(app.getHttpServer())
      .get("/api/v2/company/cost-centres")
      .set("Authorization", `Bearer ${await token(divisionHeadUserId)}`)
      .expect(200);
    expect(headList.body.data.some((item: { id: string }) => item.id === costCentreId)).toBe(true);
    await request(app.getHttpServer())
      .post("/api/v2/company/cost-centres")
      .set("Authorization", `Bearer ${await token(divisionHeadUserId)}`)
      .send({ code: "V22-HEAD", name: "Denied" })
      .expect(403);
  });

  it("creates teams and preserves historical membership removal", async () => {
    const auth = `Bearer ${await token(founderUserId)}`;
    const created = await request(app.getHttpServer())
      .post("/api/v2/company/teams")
      .set("Authorization", auth)
      .send({
        code: "V22-LAB",
        name: "Synthetic Lab Team",
        divisionId: engineeringId,
        departmentId: engineeringDepartmentId,
      })
      .expect(201);
    teamId = created.body.data.id;
    await request(app.getHttpServer())
      .post(`/api/v2/company/teams/${teamId}/members`)
      .set("Authorization", auth)
      .send({ employeeId, role: "MEMBER" })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/company/teams/${teamId}/members`)
      .set("Authorization", auth)
      .send({ employeeId, role: "MEMBER" })
      .expect(409);
    await request(app.getHttpServer())
      .delete(`/api/v2/company/teams/${teamId}/members/${employeeId}`)
      .set("Authorization", auth)
      .expect(200);
    const members = await request(app.getHttpServer())
      .get(`/api/v2/company/teams/${teamId}/members`)
      .set("Authorization", auth)
      .expect(200);
    expect(members.body.data).toHaveLength(1);
    expect(members.body.data[0].removedAt).not.toBeNull();
    await request(app.getHttpServer())
      .post(`/api/v2/company/teams/${teamId}/members`)
      .set("Authorization", auth)
      .send({ employeeId, role: "LEAD" })
      .expect(201);
    const history = await request(app.getHttpServer())
      .get(`/api/v2/company/teams/${teamId}/members`)
      .set("Authorization", auth)
      .expect(200);
    expect(history.body.data).toHaveLength(2);
    expect(
      history.body.data.filter((item: { removedAt: string | null }) => item.removedAt === null),
    ).toHaveLength(1);
    await request(app.getHttpServer())
      .get("/api/v2/company/teams")
      .set("Authorization", `Bearer ${await token(directorUserId)}`)
      .expect(200);
    await request(app.getHttpServer())
      .post("/api/v2/company/teams")
      .set("Authorization", `Bearer ${await token(divisionHeadUserId)}`)
      .send({ code: "V22-DENIED", name: "Denied" })
      .expect(403);
  });

  it("keeps division head reads scoped and director reads organization-wide", async () => {
    const headAuth = `Bearer ${await token(divisionHeadUserId)}`;
    const headDivisions = await request(app.getHttpServer())
      .get("/api/v2/company/divisions")
      .set("Authorization", headAuth)
      .expect(200);
    expect(headDivisions.body.data.every((item: { id: string }) => item.id === engineeringId)).toBe(
      true,
    );
    const directorDepartments = await request(app.getHttpServer())
      .get("/api/v2/company/departments")
      .set("Authorization", `Bearer ${await token(directorUserId)}`)
      .expect(200);
    expect(directorDepartments.body.data.length).toBeGreaterThan(1);
  });
});
