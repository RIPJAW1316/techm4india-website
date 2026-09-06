import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

describe("V2 HR employee master", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let organizationId: string;
  let engineeringDivisionId: string;
  let spaceDivisionId: string;
  let engineeringDepartmentId: string;
  let spaceDepartmentId: string;
  let branchId: string;
  let foreignBranchId: string;
  let founderToken: string;
  let hrManagerToken: string;
  let hrExecutiveToken: string;
  let employeeToken: string;
  let divisionHeadToken: string;
  let directorToken: string;
  let targetEmployeeId: string;
  let spaceEmployeeId: string;
  const createdUserIds: string[] = [];
  const createdEmployeeIds: string[] = [];
  const password = "v2-3-hr-test-password";

  async function createFixture(roleName: string, divisionId: string, departmentId: string, label: string) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const email = `v23-${label.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}@techm4india.com`;
    const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, parallelism: 1, timeCost: 2 });
    const user = await prisma.user.create({ data: { email, passwordHash: hash, status: "ACTIVE", roles: { create: { roleId: role.id } }, employee: { create: { employeeCode: `V23-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, firstName: label, lastName: "Fixture", designation: roleName, divisionId, departmentId } } }, include: { employee: true } });
    createdUserIds.push(user.id);
    if (user.employee) createdEmployeeIds.push(user.employee.id);
    return { ...user, email, employee: user.employee! };
  }

  async function tokenFor(email: string) {
    return (await request(app.getHttpServer()).post("/api/v1/auth/login").send({ email, password }).expect(201)).body.data.accessToken as string;
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
    organizationId = organization.id;
    const engineering = await prisma.division.findUniqueOrThrow({ where: { organizationId_slug: { organizationId, slug: "engineering" } } });
    const space = await prisma.division.findUniqueOrThrow({ where: { organizationId_slug: { organizationId, slug: "space" } } });
    engineeringDivisionId = engineering.id;
    spaceDivisionId = space.id;
    engineeringDepartmentId = (await prisma.department.findFirstOrThrow({ where: { divisionId: engineering.id, slug: "software-engineering" } })).id;
    spaceDepartmentId = (await prisma.department.findFirstOrThrow({ where: { divisionId: space.id } })).id;
    const branch = await prisma.branch.create({ data: { organizationId, code: `V23-${Date.now()}`, name: "V2-3 Test Branch", city: "Hyderabad" } });
    branchId = branch.id;
    const foreignOrganization = await prisma.organization.create({ data: { legalName: `V2-3 Foreign ${Date.now()}`, slug: `v23-foreign-${Date.now()}` } });
    const foreignBranch = await prisma.branch.create({ data: { organizationId: foreignOrganization.id, code: "FOREIGN", name: "Foreign Branch" } });
    foreignBranchId = foreignBranch.id;

    const founder = await createFixture("FOUNDER_CEO", engineeringDivisionId, engineeringDepartmentId, "Founder");
    const hrManager = await createFixture("HR_MANAGER", engineeringDivisionId, engineeringDepartmentId, "HrManager");
    const hrExecutive = await createFixture("HR_EXECUTIVE", engineeringDivisionId, engineeringDepartmentId, "HrExecutive");
    const employee = await createFixture("EMPLOYEE", engineeringDivisionId, engineeringDepartmentId, "Employee");
    const divisionHead = await createFixture("DIVISION_HEAD", engineeringDivisionId, engineeringDepartmentId, "DivisionHead");
    const director = await createFixture("DIRECTOR", engineeringDivisionId, engineeringDepartmentId, "Director");
    const spaceEmployee = await createFixture("EMPLOYEE", spaceDivisionId, spaceDepartmentId, "SpaceEmployee");
    targetEmployeeId = employee.employee.id; spaceEmployeeId = spaceEmployee.employee.id;
    founderToken = await tokenFor(founder.email); hrManagerToken = await tokenFor(hrManager.email); hrExecutiveToken = await tokenFor(hrExecutive.email); employeeToken = await tokenFor(employee.email); divisionHeadToken = await tokenFor(divisionHead.email); directorToken = await tokenFor(director.email);
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: createdUserIds } } });
    await prisma.refreshSession.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.employee.deleteMany({ where: { id: { in: createdEmployeeIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.branch.deleteMany({ where: { id: { in: [branchId, foreignBranchId] } } });
    await prisma.organization.deleteMany({ where: { slug: { startsWith: "v23-foreign-" } } });
    await app.close();
  });

  it("lists cross-division employees for Founder and blocks the normal employee directory", async () => {
    const response = await request(app.getHttpServer()).get("/api/v2/hr/employees?limit=100").set("Authorization", `Bearer ${founderToken}`).expect(200);
    expect(response.body.data.some((row: { id: string }) => row.id === targetEmployeeId)).toBe(true);
    expect(response.body.data.some((row: { id: string }) => row.id === spaceEmployeeId)).toBe(true);
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    await request(app.getHttpServer()).get("/api/v2/hr/employees").set("Authorization", `Bearer ${employeeToken}`).expect(403);
  });

  it("supports HR Manager and HR Executive access while scoping Division Heads", async () => {
    await request(app.getHttpServer()).get("/api/v2/hr/employees").set("Authorization", `Bearer ${hrManagerToken}`).expect(200);
    await request(app.getHttpServer()).get("/api/v2/hr/employees").set("Authorization", `Bearer ${hrExecutiveToken}`).expect(200);
    await request(app.getHttpServer()).get(`/api/v2/hr/employees?divisionId=${spaceDivisionId}`).set("Authorization", `Bearer ${divisionHeadToken}`).expect(403);
    await request(app.getHttpServer()).get("/api/v2/hr/employees?limit=100").set("Authorization", `Bearer ${directorToken}`).expect(200);
  });

  it("creates employees without returning credentials and validates code, structure, and branch", async () => {
    const code = `V23-CREATE-${Date.now()}`;
    const payload = { officialEmail: `created-${Date.now()}@techm4india.com`, firstName: "Created", lastName: "Employee", employeeCode: code, divisionId: engineeringDivisionId, departmentId: engineeringDepartmentId, branchId, designation: "HR Test Employee", joiningDate: "2026-01-10", employmentType: "FULL_TIME" };
    const created = await request(app.getHttpServer()).post("/api/v2/hr/employees").set("Authorization", `Bearer ${founderToken}`).send(payload).expect(201);
    expect(created.body.data.employeeCode).toBe(code);
    expect(created.body.data.passwordHash).toBeUndefined();
    createdEmployeeIds.push(created.body.data.id);
    const createdUser = await prisma.employee.findUniqueOrThrow({ where: { id: created.body.data.id }, select: { userId: true } });
    createdUserIds.push(createdUser.userId);
    await request(app.getHttpServer()).post("/api/v2/hr/employees").set("Authorization", `Bearer ${founderToken}`).send(payload).expect(409);
    await request(app.getHttpServer()).post("/api/v2/hr/employees").set("Authorization", `Bearer ${founderToken}`).send({ ...payload, employeeCode: `${code}-2`, officialEmail: `created-2-${Date.now()}@techm4india.com`, branchId: foreignBranchId }).expect(400);
    await request(app.getHttpServer()).post("/api/v2/hr/employees").set("Authorization", `Bearer ${employeeToken}`).send({ ...payload, employeeCode: `${code}-3`, officialEmail: `created-3-${Date.now()}@techm4india.com` }).expect(403);
  });

  it("rejects self and transitive manager cycles", async () => {
    await request(app.getHttpServer()).patch(`/api/v2/hr/employees/${targetEmployeeId}`).set("Authorization", `Bearer ${founderToken}`).send({ managerEmployeeId: targetEmployeeId }).expect(400);
    await request(app.getHttpServer()).patch(`/api/v2/hr/employees/${spaceEmployeeId}`).set("Authorization", `Bearer ${founderToken}`).send({ managerEmployeeId: targetEmployeeId }).expect(200);
    await request(app.getHttpServer()).patch(`/api/v2/hr/employees/${targetEmployeeId}`).set("Authorization", `Bearer ${founderToken}`).send({ managerEmployeeId: spaceEmployeeId }).expect(400);
    await request(app.getHttpServer()).patch(`/api/v2/hr/employees/${spaceEmployeeId}`).set("Authorization", `Bearer ${founderToken}`).send({ managerEmployeeId: null }).expect(200);
  });

  it("records meaningful employment changes and preserves no-op updates", async () => {
    const before = await prisma.employmentHistory.count({ where: { employeeId: targetEmployeeId } });
    await request(app.getHttpServer()).patch(`/api/v2/hr/employees/${targetEmployeeId}`).set("Authorization", `Bearer ${founderToken}`).send({ designation: "Senior HR Test Employee" }).expect(200);
    const afterChange = await prisma.employmentHistory.count({ where: { employeeId: targetEmployeeId, eventType: "DESIGNATION_CHANGED" } });
    expect(afterChange).toBeGreaterThan(0);
    await request(app.getHttpServer()).patch(`/api/v2/hr/employees/${targetEmployeeId}`).set("Authorization", `Bearer ${founderToken}`).send({ designation: "Senior HR Test Employee" }).expect(200);
    expect(await prisma.employmentHistory.count({ where: { employeeId: targetEmployeeId } })).toBeGreaterThanOrEqual(before + 1);
  });

  it("keeps private emergency contacts out of safe division and employee views", async () => {
    await request(app.getHttpServer()).post(`/api/v2/hr/employees/${targetEmployeeId}/emergency-contacts`).set("Authorization", `Bearer ${founderToken}`).send({ name: "Synthetic Contact", relationship: "Parent", phone: "+910000000000", isPrimary: true }).expect(201);
    const managerDetail = await request(app.getHttpServer()).get(`/api/v2/hr/employees/${targetEmployeeId}`).set("Authorization", `Bearer ${hrManagerToken}`).expect(200);
    expect(managerDetail.body.data.emergencyContacts).toHaveLength(1);
    const divisionDetail = await request(app.getHttpServer()).get(`/api/v2/hr/employees/${targetEmployeeId}`).set("Authorization", `Bearer ${divisionHeadToken}`).expect(200);
    expect(divisionDetail.body.data.emergencyContacts).toHaveLength(0);
    await request(app.getHttpServer()).get(`/api/v2/hr/employees/${spaceEmployeeId}`).set("Authorization", `Bearer ${employeeToken}`).expect(403);
  });

  it("exits an employee without deleting the record or history", async () => {
    await request(app.getHttpServer()).post(`/api/v2/hr/employees/${targetEmployeeId}/exit`).set("Authorization", `Bearer ${founderToken}`).send({ effectiveDate: "2026-09-06", reason: "Synthetic lifecycle test" }).expect(201);
    const row = await prisma.employee.findUniqueOrThrow({ where: { id: targetEmployeeId }, select: { employmentStatus: true } });
    expect(row.employmentStatus).toBe("EXITED");
    expect(await prisma.employmentHistory.count({ where: { employeeId: targetEmployeeId, eventType: "EXITED" } })).toBeGreaterThan(0);
  });
});
