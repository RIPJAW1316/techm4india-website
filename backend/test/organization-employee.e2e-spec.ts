import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Organization and employee domain", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let engineeringDivisionId: string;
  let spaceDivisionId: string;
  let engineeringEmployeeId: string;
  let spaceEmployeeId: string;
  let divisionHeadUserId: string;
  let directorUserId: string;
  const createdUserIds: string[] = [];
  const password = "phase4-domain-password";

  async function createFixture(input: { role: string; divisionId: string; departmentId: string; firstName: string }) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: input.role } });
    const email = `phase4-${input.role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}@techm4india.com`;
    const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, parallelism: 1, timeCost: 2 });
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        status: "ACTIVE",
        roles: { create: { roleId: role.id } },
        employee: {
          create: {
            employeeCode: `PHASE4-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            firstName: input.firstName,
            lastName: "Fixture",
            designation: input.role,
            divisionId: input.divisionId,
            departmentId: input.departmentId,
          },
        },
      },
      include: { employee: true },
    });
    createdUserIds.push(user.id);
    return { ...user, email };
  }

  async function tokenFor(email: string) {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login").send({ email, password }).expect(201);
    return response.body.data.accessToken as string;
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

    const organization = await prisma.organization.findUniqueOrThrow({ where: { slug: "techm4india" } });
    const engineering = await prisma.division.findUniqueOrThrow({ where: { organizationId_slug: { organizationId: organization.id, slug: "engineering" } } });
    const space = await prisma.division.findUniqueOrThrow({ where: { organizationId_slug: { organizationId: organization.id, slug: "space" } } });
    engineeringDivisionId = engineering.id;
    spaceDivisionId = space.id;
    const engineeringDepartment = await prisma.department.findFirstOrThrow({ where: { divisionId: engineering.id, slug: "software-engineering" } });
    const spaceDepartment = await prisma.department.findFirstOrThrow({ where: { divisionId: space.id } });
    const engineeringEmployee = await createFixture({ role: "EMPLOYEE", divisionId: engineering.id, departmentId: engineeringDepartment.id, firstName: "Engineering" });
    const spaceEmployee = await createFixture({ role: "EMPLOYEE", divisionId: space.id, departmentId: spaceDepartment.id, firstName: "Space" });
    const divisionHead = await createFixture({ role: "DIVISION_HEAD", divisionId: engineering.id, departmentId: engineeringDepartment.id, firstName: "Division" });
    const director = await createFixture({ role: "DIRECTOR", divisionId: engineering.id, departmentId: engineeringDepartment.id, firstName: "Director" });
    engineeringEmployeeId = engineeringEmployee.employee!.id;
    spaceEmployeeId = spaceEmployee.employee!.id;
    divisionHeadUserId = divisionHead.id;
    directorUserId = director.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: createdUserIds } } });
    await prisma.refreshSession.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.employee.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await app.close();
  });

  it("returns Aryan-style self profile and organization context", async () => {
    const employee = await prisma.employee.findUniqueOrThrow({ where: { id: engineeringEmployeeId }, include: { user: true } });
    const token = await tokenFor(employee.user.email);
    const profile = await request(app.getHttpServer()).get("/api/v1/employees/me").set("Authorization", `Bearer ${token}`).expect(200);
    expect(profile.body.data.division.slug).toBe("engineering");
    expect(profile.body.data.department.slug).toBe("software-engineering");
    expect(profile.body.data.designation).toBe("EMPLOYEE");
    const organization = await request(app.getHttpServer()).get("/api/v1/organization/me").set("Authorization", `Bearer ${token}`).expect(200);
    expect(organization.body.data.organization.name).toBe("TechM4India");
    const divisions = await request(app.getHttpServer()).get("/api/v1/divisions").set("Authorization", `Bearer ${token}`).expect(200);
    expect(divisions.body.data).toHaveLength(1);
  });

  it("rejects unauthenticated self access and allows own division reads", async () => {
    await request(app.getHttpServer()).get("/api/v1/employees/me").expect(401);
    const employee = await prisma.employee.findUniqueOrThrow({ where: { id: engineeringEmployeeId }, include: { user: true } });
    const token = await tokenFor(employee.user.email);
    await request(app.getHttpServer()).get(`/api/v1/divisions/${engineeringDivisionId}`).set("Authorization", `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/divisions/${spaceDivisionId}`).set("Authorization", `Bearer ${token}`).expect(403);
    await request(app.getHttpServer()).get(`/api/v1/divisions/${engineeringDivisionId}/departments`).set("Authorization", `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/divisions/${spaceDivisionId}/departments`).set("Authorization", `Bearer ${token}`).expect(403);
  });

  it("allows own employee access and denies cross-division employee access", async () => {
    const employee = await prisma.employee.findUniqueOrThrow({ where: { id: engineeringEmployeeId }, include: { user: true } });
    const token = await tokenFor(employee.user.email);
    await request(app.getHttpServer()).get(`/api/v1/employees/${engineeringEmployeeId}`).set("Authorization", `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/employees/${spaceEmployeeId}`).set("Authorization", `Bearer ${token}`).expect(403);
  });

  it("scopes division heads and gives directors organization access", async () => {
    const head = await prisma.user.findUniqueOrThrow({ where: { id: divisionHeadUserId } });
    const headToken = await tokenFor(head.email);
    await request(app.getHttpServer()).get(`/api/v1/employees?divisionId=${engineeringDivisionId}&page=1&limit=20`).set("Authorization", `Bearer ${headToken}`).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/employees?divisionId=${spaceDivisionId}`).set("Authorization", `Bearer ${headToken}`).expect(403);
    const director = await prisma.user.findUniqueOrThrow({ where: { id: directorUserId } });
    const directorToken = await tokenFor(director.email);
    const response = await request(app.getHttpServer()).get("/api/v1/employees?page=1&limit=100").set("Authorization", `Bearer ${directorToken}`).expect(200);
    expect(response.body.meta.total).toBeGreaterThanOrEqual(4);
  });

  it("validates pagination and permits only safe self updates", async () => {
    const employee = await prisma.employee.findUniqueOrThrow({ where: { id: engineeringEmployeeId }, include: { user: true } });
    const token = await tokenFor(employee.user.email);
    await request(app.getHttpServer()).get("/api/v1/employees?page=0&limit=101").set("Authorization", `Bearer ${token}`).expect(400);
    const updated = await request(app.getHttpServer()).patch("/api/v1/employees/me").set("Authorization", `Bearer ${token}`).send({ phone: "+919999999999" }).expect(200);
    expect(updated.body.data.phone).toBe("+919999999999");
  });
});
