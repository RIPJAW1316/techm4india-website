import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Authentication flow", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;
  let email: string;
  const password = "phase3-test-password";

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

    const division = await prisma.division.findUniqueOrThrow({
      where: {
        organizationId_slug: {
          organizationId: (
            await prisma.organization.findUniqueOrThrow({ where: { slug: "techm4india" } })
          ).id,
          slug: "engineering",
        },
      },
    });
    const department = await prisma.department.findFirstOrThrow({
      where: { divisionId: division.id, slug: "software-engineering" },
    });
    const role = await prisma.role.findUniqueOrThrow({ where: { name: "EMPLOYEE" } });
    email = `phase3-${Date.now()}@techm4india.com`;
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      parallelism: 1,
      timeCost: 2,
    });
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        status: "ACTIVE",
        roles: { create: { roleId: role.id } },
        employee: {
          create: {
            employeeCode: `PHASE3-${Date.now()}`,
            firstName: "Phase",
            lastName: "Tester",
            designation: "Employee",
            divisionId: division.id,
            departmentId: department.id,
          },
        },
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { actorUserId: userId } });
    await prisma.refreshSession.deleteMany({ where: { userId } });
    await prisma.employee.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it("accepts valid credentials and returns a safe context", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email, password })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.roles).toContain("EMPLOYEE");
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toBeUndefined();
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("rejects wrong and unknown credentials generically", async () => {
    const wrong = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password: "wrong-password" })
      .expect(401);
    const unknown = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "missing@techm4india.com", password })
      .expect(401);
    expect(wrong.body.error.message).toBe("Invalid email or password");
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
  });

  it("protects /auth/me and accepts a valid access token", async () => {
    await request(app.getHttpServer()).get("/api/v1/auth/me").expect(401);
    await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer malformed")
      .expect(401);
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const me = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${login.body.data.accessToken}`)
      .expect(200);
    expect(me.body.data.user.email).toBe(email);
    expect(me.body.data.employee.designation).toBe("Employee");
  });

  it("rotates refresh sessions and rejects the old token", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const oldCookie = login.headers["set-cookie"][0].split(";")[0];
    const rotated = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", oldCookie)
      .set("Origin", "http://localhost:3000")
      .expect(201);
    expect(rotated.body.data.accessToken).toEqual(expect.any(String));
    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", oldCookie)
      .set("Origin", "http://localhost:3000")
      .expect(401);
    expect(
      await prisma.refreshSession.count({ where: { userId, revokedAt: { not: null } } }),
    ).toBeGreaterThan(0);
    expect(
      await prisma.auditLog.count({
        where: { actorUserId: userId, action: "REFRESH_REUSE_DETECTED" },
      }),
    ).toBeGreaterThan(0);
  });

  it("requires the refresh cookie and rejects an untrusted browser origin", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Origin", "http://localhost:3000")
      .expect(401);
    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Origin", "https://attacker.example")
      .expect(403);
  });

  it("logs out and revokes the current refresh session", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const cookie = login.headers["set-cookie"][0].split(";")[0];
    await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie)
      .set("Origin", "http://localhost:3000")
      .expect(201);
    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookie)
      .set("Origin", "http://localhost:3000")
      .expect(401);
    expect(
      await prisma.auditLog.count({ where: { actorUserId: userId, action: "LOGOUT" } }),
    ).toBeGreaterThan(0);
  });

  it("rejects disabled users at login and on existing access contexts", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    await prisma.user.update({ where: { id: userId }, data: { status: "LOCKED" } });
    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(401);
    await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${login.body.data.accessToken}`)
      .expect(401);
    await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  });
});
