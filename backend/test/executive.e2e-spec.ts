import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Founder / CEO executive workspace", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let organizationId: string;
  let engineeringId: string;
  let engineeringDepartmentId: string;
  let spaceId: string;
  let spaceDepartmentId: string;
  let founderUserId: string;
  let founderEmployeeId: string;
  let employeeAUserId: string;
  let employeeAId: string;
  let employeeBUserId: string;
  let employeeBId: string;
  let projectId: string;
  let taskId: string;
  const password = "phase-v2-1-founder-password";
  const userIds: string[] = [];

  async function token(email: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    return response.body.data.accessToken as string;
  }

  async function fixture(
    roleName: string,
    divisionId: string,
    departmentId: string,
    firstName: string,
  ) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await prisma.user.create({
      data: {
        email: `v21-${firstName.toLowerCase()}-${suffix}@techm4india.com`,
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
            employeeCode: `V21-${suffix}`,
            firstName,
            lastName: "Fixture",
            designation: roleName,
            divisionId,
            departmentId,
          },
        },
      },
      include: { employee: true },
    });
    userIds.push(user.id);
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
    const space = await prisma.division.findUniqueOrThrow({
      where: { organizationId_slug: { organizationId, slug: "space" } },
    });
    engineeringId = engineering.id;
    spaceId = space.id;
    engineeringDepartmentId = (
      await prisma.department.findFirstOrThrow({
        where: { divisionId: engineeringId, slug: "software-engineering" },
      })
    ).id;
    spaceDepartmentId = (
      await prisma.department.findFirstOrThrow({ where: { divisionId: spaceId } })
    ).id;

    const founderRole = await prisma.role.findUniqueOrThrow({ where: { name: "FOUNDER_CEO" } });
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const founder = await prisma.user.create({
      data: {
        email: `v21-founder-${suffix}@techm4india.com`,
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
            employeeCode: `V21-FOUNDER-${suffix}`,
            firstName: "Founder",
            lastName: "Fixture",
            designation: "Founder / CEO",
            divisionId: engineeringId,
            departmentId: engineeringDepartmentId,
          },
        },
      },
      include: { employee: true },
    });
    founderUserId = founder.id;
    founderEmployeeId = founder.employee!.id;
    userIds.push(founder.id);

    const employeeA = await fixture(
      "EMPLOYEE",
      engineeringId,
      engineeringDepartmentId,
      "Engineering",
    );
    const employeeB = await fixture("EMPLOYEE", spaceId, spaceDepartmentId, "Space");
    employeeAUserId = employeeA.id;
    employeeAId = employeeA.employee!.id;
    employeeBUserId = employeeB.id;
    employeeBId = employeeB.employee!.id;

    const project = await prisma.project.create({
      data: {
        organizationId,
        divisionId: engineeringId,
        code: `V21-EXEC-${suffix}`,
        name: "Executive Control Centre Fixture",
        projectManagerId: founderEmployeeId,
        createdByUserId: founderUserId,
        status: "ACTIVE",
        priority: "HIGH",
        progress: 15,
      },
    });
    projectId = project.id;
    const task = await prisma.projectTask.create({
      data: {
        projectId,
        title: "Existing completed fixture",
        assigneeId: employeeAId,
        createdByUserId: founderUserId,
        createdByEmployeeId: founderEmployeeId,
        status: "COMPLETED",
        priority: "MEDIUM",
        completedAt: new Date(),
      },
    });
    taskId = task.id;
  });

  afterAll(async () => {
    await prisma.project.deleteMany({ where: { id: projectId } });
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: userIds } } });
    await prisma.refreshSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.employee.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it("returns the organization-wide summary and safe workforce list", async () => {
    const auth = `Bearer ${await token((await prisma.user.findUniqueOrThrow({ where: { id: founderUserId } })).email)}`;
    const summary = await request(app.getHttpServer())
      .get("/api/v2/executive/workforce/summary")
      .set("Authorization", auth)
      .expect(200);
    expect(summary.body.data.employeesTotal).toBeGreaterThanOrEqual(3);
    expect(summary.body.data.activeProjects).toBeGreaterThanOrEqual(1);
    const employees = await request(app.getHttpServer())
      .get("/api/v2/executive/employees?limit=100")
      .set("Authorization", auth)
      .expect(200);
    expect(employees.body.data.some((item: { id: string }) => item.id === employeeAId)).toBe(true);
    expect(employees.body.data.some((item: { id: string }) => item.id === employeeBId)).toBe(true);
    expect(
      employees.body.data.find((item: { id: string }) => item.id === employeeAId).passwordHash,
    ).toBeUndefined();
  });

  it("denies the executive API to a regular employee", async () => {
    const employee = await prisma.user.findUniqueOrThrow({ where: { id: employeeAUserId } });
    await request(app.getHttpServer())
      .get("/api/v2/executive/workforce/summary")
      .set("Authorization", `Bearer ${await token(employee.email)}`)
      .expect(403);
  });

  it("assigns across divisions, notifies the employee, and exposes work detail", async () => {
    const founder = await prisma.user.findUniqueOrThrow({ where: { id: founderUserId } });
    const employeeB = await prisma.user.findUniqueOrThrow({ where: { id: employeeBUserId } });
    const auth = `Bearer ${await token(founder.email)}`;
    const created = await request(app.getHttpServer())
      .post(`/api/v2/executive/employees/${employeeBId}/tasks`)
      .set("Authorization", auth)
      .send({
        projectId,
        title: "Founder assigned cross-division task",
        description: "Coordinate the launch review.",
        priority: "URGENT",
      })
      .expect(201);
    const assignedTaskId = created.body.data.id as string;
    expect(created.body.data.assignee.id).toBe(employeeBId);
    const detail = await request(app.getHttpServer())
      .get(`/api/v2/executive/employees/${employeeBId}/work`)
      .set("Authorization", auth)
      .expect(200);
    expect(
      detail.body.data.activeTasks.some((task: { id: string }) => task.id === assignedTaskId),
    ).toBe(true);
    const notifications = await request(app.getHttpServer())
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${await token(employeeB.email)}`)
      .expect(200);
    expect(
      notifications.body.data.some(
        (item: { type: string; resourceId: string }) =>
          item.type === "TASK_ASSIGNED" && item.resourceId === assignedTaskId,
      ),
    ).toBe(true);
  });

  it("supports reassignment and cancellation without deleting history", async () => {
    const founder = await prisma.user.findUniqueOrThrow({ where: { id: founderUserId } });
    const employeeA = await prisma.user.findUniqueOrThrow({ where: { id: employeeAUserId } });
    const employeeB = await prisma.user.findUniqueOrThrow({ where: { id: employeeBUserId } });
    const auth = `Bearer ${await token(founder.email)}`;
    const created = await request(app.getHttpServer())
      .post(`/api/v2/executive/employees/${employeeAId}/tasks`)
      .set("Authorization", auth)
      .send({ projectId, title: "Reassignment fixture", priority: "HIGH" })
      .expect(201);
    const assignedTaskId = created.body.data.id as string;
    const beforeReassignment = await request(app.getHttpServer())
      .get("/api/v1/tasks/my")
      .set("Authorization", `Bearer ${await token(employeeA.email)}`)
      .expect(200);
    expect(
      beforeReassignment.body.data.some((task: { id: string }) => task.id === assignedTaskId),
    ).toBe(true);
    await request(app.getHttpServer())
      .patch(`/api/v2/executive/tasks/${assignedTaskId}`)
      .set("Authorization", auth)
      .send({ assigneeEmployeeId: employeeBId, status: "IN_PROGRESS" })
      .expect(200);
    const moved = await prisma.projectTask.findUniqueOrThrow({ where: { id: assignedTaskId } });
    expect(moved.assigneeId).toBe(employeeBId);
    const oldAssigneeTasks = await request(app.getHttpServer())
      .get("/api/v1/tasks/my")
      .set("Authorization", `Bearer ${await token(employeeA.email)}`)
      .expect(200);
    expect(
      oldAssigneeTasks.body.data.some((task: { id: string }) => task.id === assignedTaskId),
    ).toBe(false);
    const newAssigneeTasks = await request(app.getHttpServer())
      .get("/api/v1/tasks/my")
      .set("Authorization", `Bearer ${await token(employeeB.email)}`)
      .expect(200);
    expect(
      newAssigneeTasks.body.data.some((task: { id: string }) => task.id === assignedTaskId),
    ).toBe(true);
    await request(app.getHttpServer())
      .post(`/api/v2/executive/tasks/${assignedTaskId}/cancel`)
      .set("Authorization", auth)
      .expect(201);
    const cancelled = await prisma.projectTask.findUniqueOrThrow({ where: { id: assignedTaskId } });
    expect(cancelled.status).toBe("CANCELLED");
    const workHistory = await request(app.getHttpServer())
      .get(`/api/v2/executive/employees/${employeeBId}/work`)
      .set("Authorization", auth)
      .expect(200);
    expect(
      workHistory.body.data.cancelledTasks.some(
        (task: { id: string }) => task.id === assignedTaskId,
      ),
    ).toBe(true);
    expect(workHistory.body.data.taskSummary.cancelled).toBeGreaterThanOrEqual(1);
    expect(
      await prisma.auditLog.count({
        where: {
          entityId: assignedTaskId,
          action: {
            in: [
              "FOUNDER_TASK_CREATED",
              "TASK_REASSIGNED",
              "FOUNDER_TASK_UPDATED",
              "TASK_CANCELLED",
            ],
          },
        },
      }),
    ).toBeGreaterThanOrEqual(4);
  });

  it("includes existing completed work in employee history", async () => {
    const founder = await prisma.user.findUniqueOrThrow({ where: { id: founderUserId } });
    const response = await request(app.getHttpServer())
      .get(`/api/v2/executive/employees/${employeeAId}/work`)
      .set("Authorization", `Bearer ${await token(founder.email)}`)
      .expect(200);
    expect(
      response.body.data.completedTasks.some((task: { id: string }) => task.id === taskId),
    ).toBe(true);
    expect(response.body.data.taskSummary.completed).toBeGreaterThanOrEqual(1);
  });
});
