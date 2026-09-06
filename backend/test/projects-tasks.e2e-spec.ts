import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Projects, tasks, comments, and notifications", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let aryanUserId: string;
  let aryanEmployeeId: string;
  let spaceEmployeeId: string;
  let managerUserId: string;
  let managerEmployeeId: string;
  let headUserId: string;
  let directorUserId: string;
  let spaceProjectId: string;
  let spaceTaskId: string;
  let aryanPasswordHash: string;
  const password = "phase5-domain-password";
  const createdUserIds: string[] = [];

  async function fixture(roleName: string, divisionId: string, departmentId: string, firstName: string) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = await prisma.user.create({
      data: {
        email: `phase5-${roleName.toLowerCase()}-${suffix}@techm4india.com`,
        passwordHash: await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, parallelism: 1, timeCost: 2 }),
        status: "ACTIVE",
        roles: { create: { roleId: role.id } },
        employee: { create: { employeeCode: `P5-${suffix}`, firstName, lastName: "Fixture", designation: roleName, divisionId, departmentId } },
      },
      include: { employee: true },
    });
    createdUserIds.push(user.id);
    return user;
  }

  async function token(email: string) {
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
    const engineeringDepartment = await prisma.department.findFirstOrThrow({ where: { divisionId: engineering.id, slug: "software-engineering" } });
    const spaceDepartment = await prisma.department.findFirstOrThrow({ where: { divisionId: space.id } });
    const aryan = await prisma.user.findUniqueOrThrow({ where: { email: "aryan@techm4india.com" }, include: { employee: true } });
    aryanUserId = aryan.id;
    aryanEmployeeId = aryan.employee!.id;
    aryanPasswordHash = aryan.passwordHash;
    await prisma.user.update({ where: { id: aryan.id }, data: { passwordHash: await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, parallelism: 1, timeCost: 2 }) } });
    const manager = await fixture("PROJECT_MANAGER", engineering.id, engineeringDepartment.id, "Manager");
    const head = await fixture("DIVISION_HEAD", engineering.id, engineeringDepartment.id, "Head");
    const director = await fixture("DIRECTOR", engineering.id, engineeringDepartment.id, "Director");
    const spaceEmployee = await fixture("EMPLOYEE", space.id, spaceDepartment.id, "Space");
    managerUserId = manager.id;
    managerEmployeeId = manager.employee!.id;
    headUserId = head.id;
    directorUserId = director.id;
    spaceEmployeeId = spaceEmployee.employee!.id;

    const project = await prisma.project.create({ data: { organizationId: organization.id, divisionId: space.id, code: `P5-SPACE-${Date.now()}`, name: "Private Space Fixture", projectManagerId: spaceEmployeeId, createdByUserId: director.id, status: "ACTIVE", priority: "HIGH", progress: 10 } });
    spaceProjectId = project.id;
    const task = await prisma.projectTask.create({ data: { projectId: project.id, title: "Private Space Task", assigneeId: spaceEmployeeId, createdByUserId: director.id, status: "TODO", priority: "HIGH" } });
    spaceTaskId = task.id;
    await prisma.projectMember.create({ data: { projectId: project.id, employeeId: spaceEmployeeId } });
    await prisma.project.update({ where: { organizationId_code: { organizationId: organization.id, code: "TM4-FOUNDATION" } }, data: { projectManagerId: managerEmployeeId } });
    const foundation = await prisma.project.findUniqueOrThrow({ where: { organizationId_code: { organizationId: organization.id, code: "TM4-FOUNDATION" } } });
    await prisma.projectMember.upsert({ where: { projectId_employeeId: { projectId: foundation.id, employeeId: managerEmployeeId } }, update: { removedAt: null }, create: { projectId: foundation.id, employeeId: managerEmployeeId } });
  });

  afterAll(async () => {
    await prisma.project.deleteMany({ where: { id: spaceProjectId } });
    await prisma.project.updateMany({ where: { code: "TM4-FOUNDATION" }, data: { projectManagerId: aryanEmployeeId } });
    await prisma.projectMember.deleteMany({ where: { employee: { userId: { in: createdUserIds } } } });
    await prisma.projectTask.deleteMany({ where: { createdByUserId: { in: createdUserIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds.concat(aryanUserId) } } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: createdUserIds } } });
    await prisma.refreshSession.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.employee.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.user.update({ where: { id: aryanUserId }, data: { passwordHash: aryanPasswordHash } });
    await app.close();
  });

  it("returns my projects, tasks, and summary", async () => {
    const aryan = await prisma.user.findUniqueOrThrow({ where: { id: aryanUserId } });
    const auth = `Bearer ${await token(aryan.email)}`;
    const projects = await request(app.getHttpServer()).get("/api/v1/projects/my").set("Authorization", auth).expect(200);
    expect(projects.body.data.some((project: { code: string }) => project.code === "TM4-FOUNDATION")).toBe(true);
    const tasks = await request(app.getHttpServer()).get("/api/v1/tasks/my").set("Authorization", auth).expect(200);
    expect(tasks.body.data.length).toBeGreaterThanOrEqual(3);
    const summary = await request(app.getHttpServer()).get("/api/v1/tasks/my/summary").set("Authorization", auth).expect(200);
    expect(summary.body.data.inProgress).toBeGreaterThanOrEqual(1);
    expect(summary.body.data.todo).toBeGreaterThanOrEqual(1);
  });

  it("enforces project/task division security and membership override", async () => {
    const aryan = await prisma.user.findUniqueOrThrow({ where: { id: aryanUserId } });
    const auth = `Bearer ${await token(aryan.email)}`;
    await request(app.getHttpServer()).get(`/api/v1/projects/${spaceProjectId}`).set("Authorization", auth).expect(403);
    await request(app.getHttpServer()).get(`/api/v1/tasks/${spaceTaskId}`).set("Authorization", auth).expect(403);
    await prisma.projectMember.create({ data: { projectId: spaceProjectId, employeeId: aryanEmployeeId } });
    await request(app.getHttpServer()).get(`/api/v1/projects/${spaceProjectId}`).set("Authorization", auth).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/tasks/${spaceTaskId}`).set("Authorization", auth).expect(200);
  });

  it("allows assigned status updates but rejects employee field escalation", async () => {
    const aryan = await prisma.user.findUniqueOrThrow({ where: { id: aryanUserId } });
    const auth = `Bearer ${await token(aryan.email)}`;
    const task = await prisma.projectTask.findUniqueOrThrow({ where: { id: "00000000-0000-0000-0000-000000000002" } });
    await request(app.getHttpServer()).patch(`/api/v1/tasks/${task.id}`).set("Authorization", auth).send({ status: "IN_PROGRESS" }).expect(200);
    await request(app.getHttpServer()).patch(`/api/v1/tasks/${task.id}`).set("Authorization", auth).send({ status: "TODO", priority: "URGENT" }).expect(403);
  });

  it("supports manager task creation and rejects invalid assignment", async () => {
    const manager = await prisma.user.findUniqueOrThrow({ where: { id: managerUserId } });
    const auth = `Bearer ${await token(manager.email)}`;
    const project = await prisma.project.findUniqueOrThrow({ where: { organizationId_code: { organizationId: (await prisma.organization.findUniqueOrThrow({ where: { slug: "techm4india" } })).id, code: "TM4-FOUNDATION" } } });
    await prisma.projectMember.upsert({ where: { projectId_employeeId: { projectId: project.id, employeeId: managerEmployeeId } }, update: { removedAt: null }, create: { projectId: project.id, employeeId: managerEmployeeId } });
    await request(app.getHttpServer()).post(`/api/v1/projects/${project.id}/members`).set("Authorization", auth).send({ employeeId: aryanEmployeeId }).expect(201);
    await request(app.getHttpServer()).delete(`/api/v1/projects/${project.id}/members/${aryanEmployeeId}`).set("Authorization", auth).expect(200);
    await request(app.getHttpServer()).post(`/api/v1/projects/${project.id}/members`).set("Authorization", auth).send({ employeeId: aryanEmployeeId }).expect(201);
    const created = await request(app.getHttpServer()).post(`/api/v1/projects/${project.id}/tasks`).set("Authorization", auth).send({ title: "Manager-created task", assigneeEmployeeId: aryanEmployeeId, priority: "MEDIUM" }).expect(201);
    expect(created.body.data.title).toBe("Manager-created task");
    await request(app.getHttpServer()).post(`/api/v1/projects/${project.id}/tasks`).set("Authorization", auth).send({ title: "Invalid assignment", assigneeEmployeeId: spaceEmployeeId }).expect(403);
    const aryan = await prisma.user.findUniqueOrThrow({ where: { id: aryanUserId } });
    const notifications = await request(app.getHttpServer()).get("/api/v1/notifications").set("Authorization", `Bearer ${await token(aryan.email)}`).expect(200);
    expect(notifications.body.data.some((item: { type: string; resourceId: string }) => item.type === "TASK_ASSIGNED" && item.resourceId === created.body.data.id)).toBe(true);
    const spaceEmployee = await prisma.employee.findUniqueOrThrow({ where: { id: spaceEmployeeId }, include: { user: true } });
    const otherNotifications = await request(app.getHttpServer()).get("/api/v1/notifications").set("Authorization", `Bearer ${await token(spaceEmployee.user.email)}`).expect(200);
    expect(otherNotifications.body.data.some((item: { resourceId: string }) => item.resourceId === created.body.data.id)).toBe(false);
  });

  it("scopes heads/directors and protects comments/notifications", async () => {
    const head = await prisma.user.findUniqueOrThrow({ where: { id: headUserId } });
    const director = await prisma.user.findUniqueOrThrow({ where: { id: directorUserId } });
    const headAuth = `Bearer ${await token(head.email)}`;
    const directorAuth = `Bearer ${await token(director.email)}`;
    const engineering = await prisma.project.findUniqueOrThrow({ where: { organizationId_code: { organizationId: (await prisma.organization.findUniqueOrThrow({ where: { slug: "techm4india" } })).id, code: "TM4-FOUNDATION" } } });
    await request(app.getHttpServer()).get(`/api/v1/projects/${engineering.id}`).set("Authorization", headAuth).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/projects/${spaceProjectId}`).set("Authorization", headAuth).expect(403);
    await request(app.getHttpServer()).get(`/api/v1/projects/${spaceProjectId}`).set("Authorization", directorAuth).expect(200);
    const aryan = await prisma.user.findUniqueOrThrow({ where: { id: aryanUserId } });
    const aryanAuth = `Bearer ${await token(aryan.email)}`;
    const ownTask = await prisma.projectTask.findUniqueOrThrow({ where: { id: "00000000-0000-0000-0000-000000000003" } });
    await request(app.getHttpServer()).post(`/api/v1/tasks/${ownTask.id}/comments`).set("Authorization", aryanAuth).send({ body: "Ready for review." }).expect(201);
    await request(app.getHttpServer()).get(`/api/v1/tasks/${ownTask.id}/comments`).set("Authorization", aryanAuth).expect(200);
    await prisma.projectMember.delete({ where: { projectId_employeeId: { projectId: spaceProjectId, employeeId: aryanEmployeeId } } });
    await request(app.getHttpServer()).get(`/api/v1/tasks/${spaceTaskId}/comments`).set("Authorization", aryanAuth).expect(403);
    const notifications = await request(app.getHttpServer()).get("/api/v1/notifications").set("Authorization", aryanAuth).expect(200);
    expect(notifications.body.data).toBeInstanceOf(Array);
  });
});
