import cookieParser from "cookie-parser";
import argon2 from "argon2";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30000);

describe("V2-4 attendance and leave behavior", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgId: string;
  let engineeringId: string;
  let spaceId: string;
  let engineeringDepartmentId: string;
  let spaceDepartmentId: string;
  let employee: { userId: string; employeeId: string; email: string };
  let spaceEmployee: { userId: string; employeeId: string; email: string };
  let founder: { userId: string; employeeId: string; email: string };
  let hr: { userId: string; employeeId: string; email: string };
  let divisionHead: { userId: string; employeeId: string; email: string };
  let trackedTypeId: string;
  let untrackedTypeId: string;
  let trackedBalanceId: string;
  const password = "v2-4-behavior-password";
  const tokens = new Map<string, string>();

  async function createUser(
    roleName: string,
    divisionId: string,
    departmentId: string,
    prefix: string,
  ) {
    const stamp = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const user = await prisma.user.create({
      data: {
        email: `${stamp.toLowerCase()}@techm4india.test`,
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
            employeeCode: `V24-${stamp.slice(0, 20)}`,
            firstName: prefix,
            lastName: "Tester",
            divisionId,
            departmentId,
            designation: roleName,
          },
        },
      },
      include: { employee: true },
    });
    return { userId: user.id, employeeId: user.employee!.id, email: user.email };
  }
  async function token(account: { email: string }) {
    const cached = tokens.get(account.email);
    if (cached) return cached;
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: account.email, password })
      .expect(201);
    const access = response.body.data.accessToken as string;
    tokens.set(account.email, access);
    return access;
  }
  function dateOffset(days: number) {
    const value = new Date();
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
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
    orgId = organization.id;
    const engineering = await prisma.division.findUniqueOrThrow({
      where: { organizationId_slug: { organizationId: orgId, slug: "engineering" } },
    });
    const space = await prisma.division.findUniqueOrThrow({
      where: { organizationId_slug: { organizationId: orgId, slug: "space" } },
    });
    engineeringId = engineering.id;
    spaceId = space.id;
    engineeringDepartmentId = (
      await prisma.department.findFirstOrThrow({ where: { divisionId: engineeringId } })
    ).id;
    spaceDepartmentId = (
      await prisma.department.findFirstOrThrow({ where: { divisionId: spaceId } })
    ).id;
    employee = await createUser(
      "EMPLOYEE",
      engineeringId,
      engineeringDepartmentId,
      "BehaviorEmployee",
    );
    spaceEmployee = await createUser("EMPLOYEE", spaceId, spaceDepartmentId, "SpaceEmployee");
    founder = await createUser(
      "FOUNDER_CEO",
      engineeringId,
      engineeringDepartmentId,
      "BehaviorFounder",
    );
    hr = await createUser("HR_MANAGER", engineeringId, engineeringDepartmentId, "BehaviorHr");
    divisionHead = await createUser(
      "DIVISION_HEAD",
      engineeringId,
      engineeringDepartmentId,
      "BehaviorHead",
    );
    const tracked = await prisma.leaveType.create({
      data: {
        organizationId: orgId,
        code: `V24-${Date.now()}`,
        name: "Tracked Test Leave",
        annualAllowance: 5,
        balanceTracked: true,
      },
    });
    trackedTypeId = tracked.id;
    const untracked = await prisma.leaveType.create({
      data: {
        organizationId: orgId,
        code: `V24-U-${Date.now()}`,
        name: "Untracked Test Leave",
        balanceTracked: false,
      },
    });
    untrackedTypeId = untracked.id;
    const balance = await prisma.leaveBalance.create({
      data: {
        employeeId: employee.employeeId,
        leaveTypeId: trackedTypeId,
        year: new Date().getUTCFullYear(),
        openingBalance: 5,
      },
    });
    trackedBalanceId = balance.id;
  });
  afterAll(async () => {
    const ids = [
      employee.userId,
      spaceEmployee.userId,
      founder.userId,
      hr.userId,
      divisionHead.userId,
    ];
    await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: ids } } });
    await prisma.attendanceRecord.deleteMany({
      where: {
        employeeId: {
          in: [
            employee.employeeId,
            spaceEmployee.employeeId,
            founder.employeeId,
            hr.employeeId,
            divisionHead.employeeId,
          ],
        },
      },
    });
    await prisma.leaveApplication.deleteMany({
      where: { employeeId: { in: [employee.employeeId, spaceEmployee.employeeId] } },
    });
    await prisma.leaveBalance.deleteMany({ where: { id: trackedBalanceId } });
    await prisma.leaveType.deleteMany({ where: { id: { in: [trackedTypeId, untrackedTypeId] } } });
    await prisma.employee.deleteMany({
      where: {
        id: {
          in: [
            employee.employeeId,
            spaceEmployee.employeeId,
            founder.employeeId,
            hr.employeeId,
            divisionHead.employeeId,
          ],
        },
      },
    });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await app.close();
  });

  it("checks in, rejects duplicates, supports own history, and checks out", async () => {
    const access = await token(employee);
    await request(app.getHttpServer())
      .post("/api/v2/attendance/me/check-out")
      .set("Authorization", `Bearer ${access}`)
      .expect(400);
    const checkIn = await request(app.getHttpServer())
      .post("/api/v2/attendance/me/check-in")
      .set("Authorization", `Bearer ${access}`)
      .expect(201);
    expect(checkIn.body.data.employeeId).toBe(employee.employeeId);
    const duplicate = await request(app.getHttpServer())
      .post("/api/v2/attendance/me/check-in")
      .set("Authorization", `Bearer ${access}`)
      .expect(409);
    expect(duplicate.body.error.message).toMatch(/already checked in/i);
    const history = await request(app.getHttpServer())
      .get("/api/v2/attendance/me?page=1&limit=10")
      .set("Authorization", `Bearer ${access}`)
      .expect(200);
    expect(history.body.data[0].employeeId).toBe(employee.employeeId);
    await request(app.getHttpServer())
      .post("/api/v2/attendance/me/check-out")
      .set("Authorization", `Bearer ${access}`)
      .expect(201);
    await request(app.getHttpServer())
      .post("/api/v2/attendance/me/check-out")
      .set("Authorization", `Bearer ${access}`)
      .expect(409);
  });
  it("uses Asia/Kolkata business date and blocks employee corrections or foreign history", async () => {
    const access = await token(employee);
    const now = new Date();
    const indiaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
    const today = await request(app.getHttpServer())
      .get("/api/v2/attendance/me/today")
      .set("Authorization", `Bearer ${access}`)
      .expect(200);
    expect(
      today.body.data === null || today.body.data.businessDate.slice(0, 10) === indiaDate,
    ).toBe(true);
    const history = await request(app.getHttpServer())
      .get(`/api/v2/attendance/me?employeeId=${spaceEmployee.employeeId}`)
      .set("Authorization", `Bearer ${access}`)
      .expect(200);
    expect(
      history.body.data.every(
        (item: { employeeId: string }) => item.employeeId === employee.employeeId,
      ),
    ).toBe(true);
    const row = await prisma.attendanceRecord.findFirstOrThrow({
      where: { employeeId: employee.employeeId },
    });
    await request(app.getHttpServer())
      .patch(`/api/v2/attendance/${row.id}`)
      .set("Authorization", `Bearer ${access}`)
      .send({ status: "PRESENT", reason: "No" })
      .expect(403);
  });
  it("allows Founder and HR correction but requires a reason", async () => {
    const founderAccess = await token(founder);
    const row = await prisma.attendanceRecord.findFirstOrThrow({
      where: { employeeId: employee.employeeId },
    });
    await request(app.getHttpServer())
      .patch(`/api/v2/attendance/${row.id}`)
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({ status: "REMOTE" })
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/api/v2/attendance/${row.id}`)
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({ status: "REMOTE", reason: "Approved remote day" })
      .expect(200);
    const hrAccess = await token(hr);
    await request(app.getHttpServer())
      .patch(`/api/v2/attendance/${row.id}`)
      .set("Authorization", `Bearer ${hrAccess}`)
      .send({ status: "PRESENT", reason: "HR correction" })
      .expect(200);
  });
  it("scopes Division Head attendance and summary to its division", async () => {
    const access = await token(divisionHead);
    const list = await request(app.getHttpServer())
      .get(`/api/v2/attendance?employeeId=${spaceEmployee.employeeId}`)
      .set("Authorization", `Bearer ${access}`)
      .expect(200);
    expect(list.body.data).toHaveLength(0);
    await request(app.getHttpServer())
      .get(`/api/v2/attendance/summary?date=${dateOffset(0)}`)
      .set("Authorization", `Bearer ${access}`)
      .expect(200);
  });
  it("enforces tracked and untracked leave semantics and overlap rules", async () => {
    const access = await token(employee);
    const start = dateOffset(10);
    const valid = await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${access}`)
      .send({
        leaveTypeId: trackedTypeId,
        startDate: start,
        endDate: start,
        reason: "Personal appointment",
      })
      .expect(201);
    await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${access}`)
      .send({ leaveTypeId: trackedTypeId, startDate: start, endDate: start, reason: "Overlap" })
      .expect(409);
    const untracked = await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${access}`)
      .send({
        leaveTypeId: untrackedTypeId,
        startDate: dateOffset(20),
        endDate: dateOffset(20),
        reason: "Untracked",
      })
      .expect(201);
    expect(valid.body.data.id).not.toBe(untracked.body.data.id);
    const balances = await request(app.getHttpServer())
      .get("/api/v2/leave/me/balances")
      .set("Authorization", `Bearer ${access}`)
      .expect(200);
    expect(balances.body.data.some((item: { id: string }) => item.id === trackedBalanceId)).toBe(
      true,
    );
  });
  it("approves once, deducts exactly once, rejects without deduction, and notifies/audits", async () => {
    const employeeAccess = await token(employee);
    const founderAccess = await token(founder);
    const start = dateOffset(11);
    const created = await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${employeeAccess}`)
      .send({
        leaveTypeId: trackedTypeId,
        startDate: start,
        endDate: start,
        reason: "Approved test",
      })
      .expect(201);
    const before = (
      await prisma.leaveBalance.findUniqueOrThrow({ where: { id: trackedBalanceId } })
    ).used;
    await request(app.getHttpServer())
      .post(`/api/v2/leave/applications/${created.body.data.id}/approve`)
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({})
      .expect(201);
    const after = (await prisma.leaveBalance.findUniqueOrThrow({ where: { id: trackedBalanceId } }))
      .used;
    expect(after - before).toBe(1);
    await request(app.getHttpServer())
      .post(`/api/v2/leave/applications/${created.body.data.id}/approve`)
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({})
      .expect(409);
    expect(
      await prisma.auditLog.count({
        where: { entityId: created.body.data.id, action: "LEAVE_APPLICATION_APPROVED" },
      }),
    ).toBe(1);
    expect(
      await prisma.notification.count({
        where: {
          userId: employee.userId,
          resourceId: created.body.data.id,
          type: "LEAVE_APPROVED",
        },
      }),
    ).toBe(1);
    const rejectStart = dateOffset(12);
    const rejected = await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${employeeAccess}`)
      .send({
        leaveTypeId: trackedTypeId,
        startDate: rejectStart,
        endDate: rejectStart,
        reason: "Reject test",
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/leave/applications/${rejected.body.data.id}/reject`)
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({ comment: "Not approved" })
      .expect(201);
    expect(
      (await prisma.leaveBalance.findUniqueOrThrow({ where: { id: trackedBalanceId } })).used,
    ).toBe(after);
  });
  it("cancels pending and future approved leave safely and rejects repeated cancellation", async () => {
    const employeeAccess = await token(employee);
    const founderAccess = await token(founder);
    const pending = await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${employeeAccess}`)
      .send({
        leaveTypeId: untrackedTypeId,
        startDate: dateOffset(30),
        endDate: dateOffset(30),
        reason: "Pending cancel",
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/leave/me/applications/${pending.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${employeeAccess}`)
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/leave/me/applications/${pending.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${employeeAccess}`)
      .expect(409);
    const future = await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${employeeAccess}`)
      .send({
        leaveTypeId: trackedTypeId,
        startDate: dateOffset(40),
        endDate: dateOffset(40),
        reason: "Future cancel",
      })
      .expect(201);
    const before = (
      await prisma.leaveBalance.findUniqueOrThrow({ where: { id: trackedBalanceId } })
    ).used;
    await request(app.getHttpServer())
      .post(`/api/v2/leave/applications/${future.body.data.id}/approve`)
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({})
      .expect(201);
    const used = (await prisma.leaveBalance.findUniqueOrThrow({ where: { id: trackedBalanceId } }))
      .used;
    await request(app.getHttpServer())
      .post(`/api/v2/leave/me/applications/${future.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${employeeAccess}`)
      .expect(201);
    expect(
      (await prisma.leaveBalance.findUniqueOrThrow({ where: { id: trackedBalanceId } })).used,
    ).toBe(before);
    expect(used).toBe(before + 1);
  });
  it("requires initialized tracked balances", async () => {
    const access = await token(spaceEmployee);
    const type = await prisma.leaveType.findUniqueOrThrow({ where: { id: trackedTypeId } });
    expect(type.balanceTracked).toBe(true);
    await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${access}`)
      .send({
        leaveTypeId: trackedTypeId,
        startDate: dateOffset(50),
        endDate: dateOffset(50),
        reason: "Missing balance",
      })
      .expect(400);
  });
  it("rejects tracked leave that exceeds the available balance", async () => {
    const access = await token(employee);
    await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${access}`)
      .send({
        leaveTypeId: trackedTypeId,
        startDate: dateOffset(100),
        endDate: dateOffset(110),
        reason: "Too many days",
      })
      .expect(400);
  });
  it("lets HR review a request and reports approved leave before attendance", async () => {
    const employeeAccess = await token(employee);
    const hrAccess = await token(hr);
    const start = dateOffset(80);
    const created = await request(app.getHttpServer())
      .post("/api/v2/leave/me/applications")
      .set("Authorization", `Bearer ${employeeAccess}`)
      .send({
        leaveTypeId: untrackedTypeId,
        startDate: start,
        endDate: start,
        reason: "HR review test",
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/leave/applications/${created.body.data.id}/approve`)
      .set("Authorization", `Bearer ${hrAccess}`)
      .send({})
      .expect(201);
    const summary = await request(app.getHttpServer())
      .get(`/api/v2/attendance/summary?date=${start}`)
      .set("Authorization", `Bearer ${await token(founder)}`)
      .expect(200);
    expect(summary.body.data.onLeave).toBeGreaterThanOrEqual(1);
  });
  it("keeps holiday scope and mutation permissions server-side", async () => {
    const founderAccess = await token(founder);
    const employeeAccess = await token(employee);
    const holiday = await request(app.getHttpServer())
      .post("/api/v2/holidays")
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({ name: `V2-4 Test Holiday ${Date.now()}`, date: dateOffset(60), type: "COMPANY" })
      .expect(201);
    await request(app.getHttpServer())
      .get("/api/v2/holidays")
      .set("Authorization", `Bearer ${employeeAccess}`)
      .expect(200);
    await request(app.getHttpServer())
      .post("/api/v2/holidays")
      .set("Authorization", `Bearer ${employeeAccess}`)
      .send({ name: "No", date: dateOffset(61) })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/api/v2/holidays/${holiday.body.data.id}`)
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({ name: "Updated Test Holiday", date: dateOffset(60), type: "COMPANY" })
      .expect(200);
    await prisma.holiday.delete({ where: { id: holiday.body.data.id } });
  });
  it("does not leak division holidays and rejects duplicate scoped records", async () => {
    const founderAccess = await token(founder);
    const engineeringAccess = await token(employee);
    const scoped = await request(app.getHttpServer())
      .post("/api/v2/holidays")
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({
        name: `V2-4 Engineering Holiday ${Date.now()}`,
        date: dateOffset(61),
        type: "REGIONAL",
        divisionId: engineeringId,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post("/api/v2/holidays")
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({
        name: scoped.body.data.name,
        date: dateOffset(61),
        type: "REGIONAL",
        divisionId: engineeringId,
      })
      .expect(409);
    const visible = await request(app.getHttpServer())
      .get(`/api/v2/holidays?from=${dateOffset(61)}&to=${dateOffset(61)}`)
      .set("Authorization", `Bearer ${engineeringAccess}`)
      .expect(200);
    expect(visible.body.data.some((item: { id: string }) => item.id === scoped.body.data.id)).toBe(
      true,
    );
    const spaceAccess = await token(spaceEmployee);
    const hidden = await request(app.getHttpServer())
      .get(`/api/v2/holidays?from=${dateOffset(61)}&to=${dateOffset(61)}`)
      .set("Authorization", `Bearer ${spaceAccess}`)
      .expect(200);
    expect(hidden.body.data.some((item: { id: string }) => item.id === scoped.body.data.id)).toBe(
      false,
    );
    const branch = await prisma.branch.create({
      data: {
        organizationId: orgId,
        code: `V24-${Date.now()}`,
        name: "Behavior branch",
        type: "OTHER",
      },
    });
    const branchHoliday = await request(app.getHttpServer())
      .post("/api/v2/holidays")
      .set("Authorization", `Bearer ${founderAccess}`)
      .send({
        name: `V2-4 Branch Holiday ${Date.now()}`,
        date: dateOffset(62),
        type: "REGIONAL",
        branchId: branch.id,
      })
      .expect(201);
    const branchHidden = await request(app.getHttpServer())
      .get(`/api/v2/holidays?from=${dateOffset(62)}&to=${dateOffset(62)}`)
      .set("Authorization", `Bearer ${engineeringAccess}`)
      .expect(200);
    expect(
      branchHidden.body.data.some((item: { id: string }) => item.id === branchHoliday.body.data.id),
    ).toBe(false);
    await prisma.holiday.deleteMany({
      where: { id: { in: [scoped.body.data.id, branchHoliday.body.data.id] } },
    });
    await prisma.branch.delete({ where: { id: branch.id } });
  });
});
