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

describe("Client MVP admin users and RBAC", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHash: string;
  const password = "client-mvp-admin-password";
  const tokens = new Map<string, string>();
  type Fixture = {
    userId: string;
    employeeId: string;
    email: string;
    roleName: string;
  };
  let organizationId: string;
  let divisionId: string;
  let departmentId: string;
  let foreignOrganizationId: string;
  let foreignDivisionId: string;
  let foreignDepartmentId: string;
  let founder: Fixture;
  let superAdmin: Fixture;
  let employee: Fixture;
  let secondEmployee: Fixture;
  let hr: Fixture;
  let sales: Fixture;
  let viewer: Fixture;
  let foreignEmployee: Fixture;
  let projectId: string;
  let leaveTypeId: string;

  async function fixture(
    roleName: string,
    orgDivisionId: string,
    department: string,
    label: string,
  ): Promise<Fixture> {
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: roleName },
    });
    const stamp = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = await prisma.user.create({
      data: {
        email: `${stamp.toLowerCase()}@admin.test`,
        passwordHash,
        status: "ACTIVE",
        roles: { create: { roleId: role.id } },
        employee: {
          create: {
            employeeCode: `ADM-${stamp.slice(0, 18)}`,
            firstName: label,
            lastName: "AdminTest",
            designation: roleName,
            divisionId: orgDivisionId,
            departmentId: department,
          },
        },
      },
      include: { employee: true },
    });
    return {
      userId: user.id,
      employeeId: user.employee!.id,
      email: user.email,
      roleName,
    };
  }

  async function headers(user: Fixture) {
    let token = tokens.get(user.email);
    if (!token) {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email: user.email, password })
        .expect(201);
      token = response.body.data.accessToken as string;
      tokens.set(user.email, token);
    }
    return { Authorization: `Bearer ${token}` };
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
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
    passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      parallelism: 1,
      timeCost: 2,
    });

    const organization = await prisma.organization.create({
      data: {
        legalName: "Admin Test Organization",
        slug: `admin-test-${Date.now()}`,
      },
    });
    organizationId = organization.id;
    const division = await prisma.division.create({
      data: { organizationId, name: "Admin Division", slug: "admin" },
    });
    divisionId = division.id;
    departmentId = (
      await prisma.department.create({
        data: { divisionId, name: "Admin Department", slug: "admin" },
      })
    ).id;
    const foreignOrganization = await prisma.organization.create({
      data: {
        legalName: "Foreign Admin Organization",
        slug: `foreign-admin-${Date.now()}`,
      },
    });
    foreignOrganizationId = foreignOrganization.id;
    const foreignDivision = await prisma.division.create({
      data: {
        organizationId: foreignOrganizationId,
        name: "Foreign Division",
        slug: "foreign",
      },
    });
    foreignDivisionId = foreignDivision.id;
    foreignDepartmentId = (
      await prisma.department.create({
        data: {
          divisionId: foreignDivisionId,
          name: "Foreign Department",
          slug: "foreign",
        },
      })
    ).id;

    founder = await fixture("FOUNDER_CEO", divisionId, departmentId, "Founder");
    superAdmin = await fixture(
      "SUPER_ADMIN",
      divisionId,
      departmentId,
      "SuperAdmin",
    );
    employee = await fixture("EMPLOYEE", divisionId, departmentId, "Employee");
    secondEmployee = await fixture(
      "EMPLOYEE",
      divisionId,
      departmentId,
      "SecondEmployee",
    );
    hr = await fixture("HR_MANAGER", divisionId, departmentId, "HrManager");
    sales = await fixture(
      "SALES_EXECUTIVE",
      divisionId,
      departmentId,
      "SalesExecutive",
    );
    viewer = await fixture("VIEWER", divisionId, departmentId, "Viewer");
    foreignEmployee = await fixture(
      "EMPLOYEE",
      foreignDivisionId,
      foreignDepartmentId,
      "ForeignEmployee",
    );

    projectId = (
      await prisma.project.create({
        data: {
          organizationId,
          divisionId,
          code: `ADM-${Date.now()}`,
          name: "Admin Task Control",
          createdByUserId: founder.userId,
          projectManagerId: founder.employeeId,
          status: "ACTIVE",
        },
      })
    ).id;
    leaveTypeId = (
      await prisma.leaveType.create({
        data: {
          organizationId,
          code: `ADM-${Date.now()}`,
          name: "Admin Test Leave",
          balanceTracked: false,
        },
      })
    ).id;
    await prisma.employee.update({
      where: { id: employee.employeeId },
      data: { managerEmployeeId: founder.employeeId },
    });
    const todayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    await prisma.attendanceRecord.create({
      data: {
        employeeId: employee.employeeId,
        businessDate: new Date(`${todayKey}T00:00:00.000Z`),
        status: "PRESENT",
        source: "WEB",
      },
    });
    await prisma.leaveApplication.create({
      data: {
        employeeId: employee.employeeId,
        leaveTypeId,
        startDate: new Date(),
        endDate: new Date(),
        dayCount: 1,
        reason: "Admin summary verification",
        status: "PENDING",
      },
    });
  });

  afterAll(async () => {
    const fixtures = [
      founder,
      superAdmin,
      employee,
      secondEmployee,
      hr,
      sales,
      viewer,
      foreignEmployee,
    ].filter(Boolean);
    const userIds = fixtures.map((item) => item.userId);
    const employeeIds = fixtures.map((item) => item.employeeId);
    await prisma.notification.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.auditLog.deleteMany({
      where: {
        OR: [{ actorUserId: { in: userIds } }, { entityId: { in: userIds } }],
      },
    });
    await prisma.leaveApplication.deleteMany({
      where: { employeeId: { in: employeeIds } },
    });
    if (leaveTypeId)
      await prisma.leaveType.delete({ where: { id: leaveTypeId } });
    await prisma.attendanceRecord.deleteMany({
      where: { employeeId: { in: employeeIds } },
    });
    if (projectId) await prisma.project.delete({ where: { id: projectId } });
    await prisma.employee.deleteMany({ where: { id: { in: employeeIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    if (foreignDepartmentId)
      await prisma.department.delete({ where: { id: foreignDepartmentId } });
    if (foreignDivisionId)
      await prisma.division.delete({ where: { id: foreignDivisionId } });
    if (foreignOrganizationId)
      await prisma.organization.delete({
        where: { id: foreignOrganizationId },
      });
    if (departmentId)
      await prisma.department.delete({ where: { id: departmentId } });
    if (divisionId) await prisma.division.delete({ where: { id: divisionId } });
    if (organizationId)
      await prisma.organization.delete({ where: { id: organizationId } });
    await app.close();
  });

  it("lets Founder and SuperAdmin inspect safe organization users, roles and permissions", async () => {
    const founderHeaders = await headers(founder);
    const list = await request(app.getHttpServer())
      .get(
        `/api/v2/admin/users?search=${encodeURIComponent(employee.email)}&division=${divisionId}&department=${departmentId}&employmentStatus=ACTIVE&accountStatus=ACTIVE`,
      )
      .set(founderHeaders)
      .expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe(employee.userId);
    expect(JSON.stringify(list.body)).not.toContain("passwordHash");
    expect(JSON.stringify(list.body)).not.toContain("tokenHash");

    const roleFiltered = await request(app.getHttpServer())
      .get("/api/v2/admin/users?role=EMPLOYEE")
      .set(founderHeaders)
      .expect(200);
    expect(roleFiltered.body.data.map((user: { id: string }) => user.id)).toEqual(
      expect.arrayContaining([employee.userId, secondEmployee.userId]),
    );
    expect(roleFiltered.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roles: expect.arrayContaining([
            expect.objectContaining({ name: "EMPLOYEE" }),
          ]),
        }),
      ]),
    );

    const detail = await request(app.getHttpServer())
      .get(`/api/v2/admin/users/${employee.userId}`)
      .set(founderHeaders)
      .expect(200);
    expect(detail.body.data.employee.employeeCode).toBeTruthy();
    expect(detail.body.data.employee.division.id).toBe(divisionId);
    expect(detail.body.data.employee.department.id).toBe(departmentId);
    expect(detail.body.data.attendance.today.status).toBe("PRESENT");
    expect(detail.body.data.leave.pending).toBe(1);
    expect(detail.body.data.work.summary).toEqual(
      expect.objectContaining({
        active: 0,
        completed: 0,
        overdue: 0,
        projects: 0,
      }),
    );
    expect(JSON.stringify(detail.body)).not.toMatch(
      /passwordHash|tokenHash|accessToken|refreshToken/,
    );

    const employeeDirectory = await request(app.getHttpServer())
      .get(
        `/api/v2/hr/employees?search=${encodeURIComponent(employee.email)}&designation=EMPLOYEE&role=EMPLOYEE&managerId=${founder.employeeId}`,
      )
      .set(founderHeaders)
      .expect(200);
    expect(employeeDirectory.body.data).toHaveLength(1);
    expect(employeeDirectory.body.data[0]).toEqual(
      expect.objectContaining({
        id: employee.employeeId,
        officialEmail: employee.email,
        designation: "EMPLOYEE",
        manager: expect.objectContaining({ id: founder.employeeId }),
      }),
    );

    const roles = await request(app.getHttpServer())
      .get("/api/v2/admin/roles")
      .set(founderHeaders)
      .expect(200);
    expect(roles.body.data).toHaveLength(20);
    expect(
      roles.body.data.find(
        (role: { name: string }) => role.name === "FINANCE_MANAGER",
      ),
    ).toEqual(expect.objectContaining({ capabilityState: "IMPLEMENTED" }));
    expect(
      roles.body.data
        .find((role: { name: string }) => role.name === "FOUNDER_CEO")
        .permissions.map((permission: { key: string }) => permission.key)
        .sort(),
    ).toEqual(
      expect.arrayContaining([
        "admin.users.read",
        "admin.users.manage_roles",
        "admin.users.manage_status",
      ]),
    );
    const permissions = await request(app.getHttpServer())
      .get("/api/v2/admin/permissions")
      .set(founderHeaders)
      .expect(200);
    expect(
      permissions.body.data
        .find(
          (permission: { key: string }) =>
            permission.key === "admin.users.manage_roles",
        )
        .roles.map((role: { name: string }) => role.name),
    ).toEqual(expect.arrayContaining(["FOUNDER_CEO", "SUPER_ADMIN"]));
    await request(app.getHttpServer())
      .get("/api/v2/admin/users")
      .set(await headers(superAdmin))
      .expect(200);
  });

  it("assigns and removes roles, changes account state, and records safe audit events", async () => {
    const founderHeaders = await headers(founder);
    const projectManager = await prisma.role.findUniqueOrThrow({
      where: { name: "PROJECT_MANAGER" },
    });
    const assigned = await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${employee.userId}/roles`)
      .set(founderHeaders)
      .send({ roleId: projectManager.id })
      .expect(201);
    expect(assigned.body.data.created).toBe(true);
    const duplicate = await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${employee.userId}/roles`)
      .set(founderHeaders)
      .send({ roleId: projectManager.id })
      .expect(201);
    expect(duplicate.body.data.created).toBe(false);
    await request(app.getHttpServer())
      .delete(
        `/api/v2/admin/users/${employee.userId}/roles/${projectManager.id}`,
      )
      .set(founderHeaders)
      .expect(200);

    const beforeEmployment = await prisma.employee.findUniqueOrThrow({
      where: { id: employee.employeeId },
      select: { employmentStatus: true },
    });
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${employee.userId}/deactivate`)
      .set(founderHeaders)
      .expect(201);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: employee.userId } }))
        .status,
    ).toBe("DISABLED");
    expect(
      (
        await prisma.employee.findUniqueOrThrow({
          where: { id: employee.employeeId },
        })
      ).employmentStatus,
    ).toBe(beforeEmployment.employmentStatus);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${employee.userId}/activate`)
      .set(founderHeaders)
      .expect(201);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: employee.userId } }))
        .status,
    ).toBe("ACTIVE");

    const events = await prisma.auditLog.findMany({
      where: {
        actorUserId: founder.userId,
        entityId: employee.userId,
        action: {
          in: [
            "USER_ROLE_ASSIGNED",
            "USER_ROLE_REMOVED",
            "USER_DEACTIVATED",
            "USER_ACTIVATED",
          ],
        },
      },
    });
    expect(events.map((event) => event.action)).toEqual(
      expect.arrayContaining([
        "USER_ROLE_ASSIGNED",
        "USER_ROLE_REMOVED",
        "USER_DEACTIVATED",
        "USER_ACTIVATED",
      ]),
    );
    expect(JSON.stringify(events)).not.toMatch(/password|token|credential/i);
  });

  it("denies escalation, Viewer mutation, cross-organization access and critical lockout", async () => {
    const projectManager = await prisma.role.findUniqueOrThrow({
      where: { name: "PROJECT_MANAGER" },
    });
    await request(app.getHttpServer())
      .get("/api/v2/admin/users")
      .set(await headers(employee))
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${hr.userId}/roles`)
      .set(await headers(hr))
      .send({ roleId: projectManager.id })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${sales.userId}/roles`)
      .set(await headers(sales))
      .send({ roleId: projectManager.id })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${viewer.userId}/deactivate`)
      .set(await headers(viewer))
      .expect(403);
    const founderHeaders = await headers(founder);
    await request(app.getHttpServer())
      .get(`/api/v2/admin/users/${foreignEmployee.userId}`)
      .set(founderHeaders)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${foreignEmployee.userId}/roles`)
      .set(founderHeaders)
      .send({ roleId: projectManager.id })
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${foreignEmployee.userId}/deactivate`)
      .set(founderHeaders)
      .expect(404);
    const founderRole = await prisma.role.findUniqueOrThrow({
      where: { name: "FOUNDER_CEO" },
    });
    await request(app.getHttpServer())
      .delete(`/api/v2/admin/users/${founder.userId}/roles/${founderRole.id}`)
      .set(founderHeaders)
      .expect(409);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${founder.userId}/deactivate`)
      .set(founderHeaders)
      .expect(409);
    await request(app.getHttpServer())
      .post(`/api/v2/admin/users/${superAdmin.userId}/deactivate`)
      .set(founderHeaders)
      .expect(409);
  });

  it("preserves Founder task control and exposes active, completed, overdue and cancelled history", async () => {
    const founderHeaders = await headers(founder);
    const overdueDate = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const created = await request(app.getHttpServer())
      .post(`/api/v2/executive/employees/${employee.employeeId}/tasks`)
      .set(founderHeaders)
      .send({
        projectId,
        title: "Client requirement task",
        priority: "HIGH",
        dueDate: overdueDate,
      })
      .expect(201);
    const taskId = created.body.data.id as string;
    await request(app.getHttpServer())
      .patch(`/api/v2/executive/tasks/${taskId}`)
      .set(founderHeaders)
      .send({
        title: "Updated client task",
        assigneeEmployeeId: secondEmployee.employeeId,
        priority: "URGENT",
        status: "IN_PROGRESS",
        dueDate: overdueDate,
      })
      .expect(200);
    let detail = await request(app.getHttpServer())
      .get(`/api/v2/admin/users/${secondEmployee.userId}`)
      .set(founderHeaders)
      .expect(200);
    expect(detail.body.data.work.summary).toEqual(
      expect.objectContaining({ active: 1, overdue: 1 }),
    );
    expect(detail.body.data.work.activeTasks[0]).toEqual(
      expect.objectContaining({
        title: "Updated client task",
        priority: "URGENT",
        status: "IN_PROGRESS",
      }),
    );
    await request(app.getHttpServer())
      .patch(`/api/v2/executive/tasks/${taskId}`)
      .set(founderHeaders)
      .send({ status: "COMPLETED" })
      .expect(200);
    detail = await request(app.getHttpServer())
      .get(`/api/v2/admin/users/${secondEmployee.userId}`)
      .set(founderHeaders)
      .expect(200);
    expect(detail.body.data.work.completedTasks[0].completedAt).toBeTruthy();
    await request(app.getHttpServer())
      .post(`/api/v2/executive/tasks/${taskId}/cancel`)
      .set(founderHeaders)
      .expect(201);
    detail = await request(app.getHttpServer())
      .get(`/api/v2/admin/users/${secondEmployee.userId}`)
      .set(founderHeaders)
      .expect(200);
    expect(detail.body.data.work.cancelledTasks[0].status).toBe("CANCELLED");
  });
});
