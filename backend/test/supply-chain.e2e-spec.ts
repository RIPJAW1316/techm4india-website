import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("V2 supply chain (vendors, inventory, procurement, assets)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const password = "supply-chain-test-password";
  let organizationId: string;
  let foreignOrganizationId: string;
  let divisionId: string;
  let departmentId: string;

  type Fixture = { userId: string; employeeId: string; email: string };
  let founder: Fixture;
  let procurementManager: Fixture;
  let employee: Fixture;
  let foreignFounder: Fixture;
  const tokens = new Map<string, string>();

  async function fixture(
    roleName: string,
    targetDivisionId: string,
    targetDepartmentId: string,
    label: string,
  ): Promise<Fixture> {
    const stamp = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const user = await prisma.user.create({
      data: {
        email: `${stamp.toLowerCase()}@example.test`,
        passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
        status: "ACTIVE",
        roles: { create: { roleId: role.id } },
        employee: {
          create: {
            employeeCode: `SC-${stamp.slice(0, 18)}`,
            firstName: label,
            lastName: "Supply",
            designation: roleName,
            divisionId: targetDivisionId,
            departmentId: targetDepartmentId,
          },
        },
      },
      include: { employee: true },
    });
    return { userId: user.id, employeeId: user.employee!.id, email: user.email };
  }

  async function auth(user: Fixture) {
    const cached = tokens.get(user.userId);
    if (cached) return { Authorization: `Bearer ${cached}` };
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: user.email, password })
      .expect(201);
    const token = response.body.data.accessToken as string;
    tokens.set(user.userId, token);
    return { Authorization: `Bearer ${token}` };
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

    const org = await prisma.organization.findUniqueOrThrow({ where: { slug: "techm4india" } });
    organizationId = org.id;
    const department = await prisma.department.findFirstOrThrow({
      where: { division: { organizationId } },
      select: { id: true, divisionId: true },
    });
    divisionId = department.divisionId;
    departmentId = department.id;

    const foreign = await prisma.organization.create({
      data: { legalName: "Foreign Supply Org", slug: `supply-${Date.now()}` },
    });
    foreignOrganizationId = foreign.id;
    const foreignDivision = await prisma.division.create({
      data: { organizationId: foreign.id, name: "Foreign", slug: "foreign" },
    });
    const foreignDepartment = await prisma.department.create({
      data: { divisionId: foreignDivision.id, name: "Foreign", slug: "foreign" },
    });

    founder = await fixture("FOUNDER_CEO", divisionId, departmentId, "Founder");
    procurementManager = await fixture("FINANCE_MANAGER", divisionId, departmentId, "Manager");
    employee = await fixture("EMPLOYEE", divisionId, departmentId, "Employee");
    foreignFounder = await fixture("FOUNDER_CEO", foreignDivision.id, foreignDepartment.id, "Foreign");
  });

  afterAll(async () => {
    try {
      const orgs = [organizationId, foreignOrganizationId];
      await prisma.stockMovement.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.purchaseOrder.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.asset.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.inventoryItem.deleteMany({ where: { organizationId: { in: orgs } } });
      await prisma.vendor.deleteMany({ where: { organizationId: { in: orgs } } });
    } catch {
      // RED phase runs before supply-chain tables exist.
    }
    const fixtures = [founder, procurementManager, employee, foreignFounder];
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: fixtures.map((item) => item.userId) } } });
    await prisma.employee.deleteMany({ where: { id: { in: fixtures.map((item) => item.employeeId) } } });
    await prisma.user.deleteMany({ where: { id: { in: fixtures.map((item) => item.userId) } } });
    await prisma.department.deleteMany({ where: { division: { organizationId: foreignOrganizationId } } });
    await prisma.division.deleteMany({ where: { organizationId: foreignOrganizationId } });
    await prisma.organization.delete({ where: { id: foreignOrganizationId } });
    await app.close();
  });

  it("procures against an approved vendor and receives stock into inventory", async () => {
    await request(app.getHttpServer())
      .post("/api/v2/vendors")
      .set(await auth(employee))
      .send({})
      .expect(403);

    const vendor = await request(app.getHttpServer())
      .post("/api/v2/vendors")
      .set(await auth(procurementManager))
      .send({ code: `VEN-${Date.now()}`, name: "Robotics Components Pvt Ltd", category: "GOODS" })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("PENDING_APPROVAL"));
    const vendorId = vendor.body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/vendors/${vendorId}/approve`)
      .set(await auth(procurementManager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("ACTIVE"));

    const item = await request(app.getHttpServer())
      .post("/api/v2/inventory-items")
      .set(await auth(procurementManager))
      .send({ sku: `SKU-${Date.now()}`, name: "Servo Motor", category: "Components", unitCost: 100 })
      .expect(201);
    const itemId = item.body.data.id as string;

    const order = await request(app.getHttpServer())
      .post("/api/v2/purchase-orders")
      .set(await auth(procurementManager))
      .send({
        code: `PO-${Date.now()}`,
        vendorId,
        title: "Servo motors for robotics lab",
        orderDate: "2026-04-01",
        items: [{ itemId, description: "Servo Motor", quantity: 10, unitCost: 100 }],
      })
      .expect(201)
      .expect(({ body }) => expect(Number(body.data.totalAmount)).toBe(1000));
    const orderId = order.body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/purchase-orders/${orderId}/submit`)
      .set(await auth(procurementManager))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/purchase-orders/${orderId}/approve`)
      .set(await auth(procurementManager))
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v2/purchase-orders/${orderId}/approve`)
      .set(await auth(founder))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("APPROVED"));
    await request(app.getHttpServer())
      .post(`/api/v2/purchase-orders/${orderId}/issue`)
      .set(await auth(procurementManager))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/purchase-orders/${orderId}/receive`)
      .set(await auth(procurementManager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("RECEIVED"));

    await request(app.getHttpServer())
      .get(`/api/v2/inventory-items/${itemId}`)
      .set(await auth(procurementManager))
      .expect(200)
      .expect(({ body }) => expect(Number(body.data.quantityOnHand)).toBe(10));

    await request(app.getHttpServer())
      .get(`/api/v2/purchase-orders/${orderId}`)
      .set(await auth(foreignFounder))
      .expect(404);
  });

  it("runs the asset assignment lifecycle and blocks cross-org reads", async () => {
    const asset = await request(app.getHttpServer())
      .post("/api/v2/assets")
      .set(await auth(procurementManager))
      .send({ assetTag: `AST-${Date.now()}`, name: "Lab Laptop", category: "IT_EQUIPMENT" })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("IN_STORE"));
    const assetId = asset.body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/assets/${assetId}/assign`)
      .set(await auth(procurementManager))
      .send({ assignedEmployeeId: employee.employeeId })
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("ASSIGNED"));
    await request(app.getHttpServer())
      .post(`/api/v2/assets/${assetId}/return`)
      .set(await auth(procurementManager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("IN_STORE"));
    await request(app.getHttpServer())
      .post(`/api/v2/assets/${assetId}/retire`)
      .set(await auth(procurementManager))
      .expect(201)
      .expect(({ body }) => expect(body.data.status).toBe("RETIRED"));

    await request(app.getHttpServer())
      .get(`/api/v2/assets/${assetId}`)
      .set(await auth(foreignFounder))
      .expect(404);
  });
});
