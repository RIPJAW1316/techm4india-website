import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(45_000);

/**
 * GST return workings.
 *
 * Indian GST is not a single tax line. Whether a supply attracts CGST + SGST or
 * IGST depends on the place of supply against the supplier's own state, returns
 * are reported rate-wise and HSN/SAC-wise, and output tax is offset by input
 * tax credit. These tests pin that arithmetic down.
 */
describe("V2 GST compliance", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const password = "gst-test-password";
  const stamp = `gst-${Date.now()}`;
  // Karnataka (29) is the supplier state for this fixture organization.
  const SUPPLIER_GSTIN = "29AAACT0000A1Z5";

  let organizationId: string;
  let foreignOrganizationId: string;
  let managerToken: string;
  let employeeToken: string;
  let foreignToken: string;
  let gst18Id: string;
  const actorUserIds: string[] = [];

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function login(email: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    return response.body.data.accessToken as string;
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

    const hash = await argon2.hash(password, {
      memoryCost: 19_456,
      parallelism: 1,
      timeCost: 2,
      type: argon2.argon2id,
    });

    async function organization(slug: string, gstin: string | null) {
      const org = await prisma.organization.create({
        data: {
          legalName: `GST ${slug}`,
          slug,
          gstin,
          registeredState: "Karnataka",
        },
      });
      const division = await prisma.division.create({
        data: { organizationId: org.id, name: "GST", slug },
      });
      const department = await prisma.department.create({
        data: { divisionId: division.id, name: "GST", slug },
      });
      return { org, division, department };
    }

    async function actor(roleName: string, code: string, divisionId: string, departmentId: string) {
      const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
      const user = await prisma.user.create({
        data: {
          email: `${stamp}-${code}@test.local`,
          passwordHash: hash,
          status: "ACTIVE",
          roles: { create: { roleId: role.id } },
          employee: {
            create: {
              employeeCode: `${stamp}-${code}`.slice(0, 40),
              firstName: "GST",
              lastName: code,
              divisionId,
              departmentId,
            },
          },
        },
      });
      actorUserIds.push(user.id);
      return login(`${stamp}-${code}@test.local`);
    }

    const home = await organization(stamp, SUPPLIER_GSTIN);
    organizationId = home.org.id;
    const foreign = await organization(`${stamp}-foreign`, "07AAACT9999A1Z5");
    foreignOrganizationId = foreign.org.id;

    managerToken = await actor("FINANCE_MANAGER", "mgr", home.division.id, home.department.id);
    employeeToken = await actor("EMPLOYEE", "emp", home.division.id, home.department.id);
    foreignToken = await actor(
      "FINANCE_MANAGER",
      "foreign",
      foreign.division.id,
      foreign.department.id,
    );

    const tax = await request(app.getHttpServer())
      .post("/api/v2/finance/tax-rates")
      .set(auth(managerToken))
      .send({
        code: "GST18",
        name: "GST 18%",
        taxType: "GST",
        rate: 18,
        effectiveFrom: "2020-01-01",
      })
      .expect(201);
    gst18Id = tax.body.data.id as string;
  });

  afterAll(async () => {
    const orgs = [organizationId, foreignOrganizationId];
    try {
      await prisma.hsnSacCode.deleteMany({ where: { organizationId: { in: orgs } } });
    } catch {
      // The RED phase runs before the HSN/SAC master exists.
    }
    await prisma.financeInvoiceLine.deleteMany({
      where: { invoice: { organizationId: { in: orgs } } },
    });
    await prisma.financeInvoice.deleteMany({ where: { organizationId: { in: orgs } } });
    await prisma.financeExpenseLine.deleteMany({
      where: { expense: { organizationId: { in: orgs } } },
    });
    await prisma.financeExpense.deleteMany({ where: { organizationId: { in: orgs } } });
    await prisma.financeParty.deleteMany({ where: { organizationId: { in: orgs } } });
    await prisma.financeTaxRate.deleteMany({ where: { organizationId: { in: orgs } } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: actorUserIds } } });
    await prisma.employee.deleteMany({ where: { userId: { in: actorUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: actorUserIds } } });
    await prisma.department.deleteMany({ where: { division: { organizationId: { in: orgs } } } });
    await prisma.division.deleteMany({ where: { organizationId: { in: orgs } } });
    await prisma.organization.deleteMany({ where: { id: { in: orgs } } });
    await app.close();
  });

  /** Creates an issued invoice and returns its id. */
  async function issuedInvoice(options: {
    number: string;
    partyId: string;
    placeOfSupply: string;
    amount: number;
    hsnSacCode: string;
  }) {
    const created = await request(app.getHttpServer())
      .post("/api/v2/finance/invoices")
      .set(auth(managerToken))
      .send({
        invoiceNumber: options.number,
        partyId: options.partyId,
        invoiceDate: "2026-06-10",
        placeOfSupply: options.placeOfSupply,
        lines: [
          {
            description: "Engineering services",
            quantity: 1,
            unitPrice: options.amount,
            taxRateId: gst18Id,
            hsnSacCode: options.hsnSacCode,
          },
        ],
      })
      .expect(201);
    const id = created.body.data.id as string;
    await request(app.getHttpServer())
      .post(`/api/v2/finance/invoices/${id}/issue`)
      .set(auth(managerToken))
      .expect(201);
    return id;
  }

  it("maintains an HSN/SAC master that only tax administrators may write", async () => {
    await request(app.getHttpServer())
      .post("/api/v2/gst/hsn-codes")
      .set(auth(employeeToken))
      .send({ code: "998313", kind: "SAC", description: "IT consulting", defaultRatePercent: 18 })
      .expect(403);

    await request(app.getHttpServer())
      .post("/api/v2/gst/hsn-codes")
      .set(auth(managerToken))
      .send({ code: "998313", kind: "SAC", description: "IT consulting", defaultRatePercent: 18 })
      .expect(201)
      .expect(({ body }) => {
        expect(body.data.code).toBe("998313");
        expect(body.data.kind).toBe("SAC");
      });

    // The same code cannot be registered twice within one organization.
    await request(app.getHttpServer())
      .post("/api/v2/gst/hsn-codes")
      .set(auth(managerToken))
      .send({ code: "998313", kind: "SAC", description: "Duplicate", defaultRatePercent: 18 })
      .expect(409);

    await request(app.getHttpServer())
      .get("/api/v2/gst/hsn-codes")
      .set(auth(managerToken))
      .expect(200)
      .expect(({ body }) => expect(body.data).toHaveLength(1));
  });

  it("splits tax by place of supply and reports GSTR-1 rate-wise", async () => {
    const parties = await Promise.all(
      [
        { name: "Karnataka Institute", gstin: "29BBBCT1111B1Z5" },
        { name: "Maharashtra Institute", gstin: "27CCCCT2222C1Z5" },
        { name: "Walk-in Student", gstin: null },
      ].map((party) =>
        request(app.getHttpServer())
          .post("/api/v2/finance/parties")
          .set(auth(managerToken))
          .send({
            type: "CUSTOMER",
            name: party.name,
            ...(party.gstin ? { gstin: party.gstin } : {}),
          })
          .expect(201),
      ),
    );
    const [intra, inter, consumer] = parties.map((response) => response.body.data.id as string);

    // 1,00,000 at 18% within Karnataka -> CGST 9,000 + SGST 9,000.
    await issuedInvoice({
      number: `${stamp}-B2B-INTRA`,
      partyId: intra,
      placeOfSupply: "29",
      amount: 100000,
      hsnSacCode: "998313",
    });
    // 50,000 at 18% to Maharashtra -> IGST 9,000.
    await issuedInvoice({
      number: `${stamp}-B2B-INTER`,
      partyId: inter,
      placeOfSupply: "27",
      amount: 50000,
      hsnSacCode: "998313",
    });
    // 10,000 at 18% to an unregistered customer within Karnataka.
    await issuedInvoice({
      number: `${stamp}-B2C`,
      partyId: consumer,
      placeOfSupply: "29",
      amount: 10000,
      hsnSacCode: "998314",
    });

    const gstr1 = await request(app.getHttpServer())
      .get("/api/v2/gst/gstr-1")
      .query({ from: "2026-06-01", to: "2026-06-30" })
      .set(auth(managerToken))
      .expect(200);
    const data = gstr1.body.data;

    // Registered customers are reported per counterparty, per rate.
    expect(data.b2b).toHaveLength(2);
    const karnataka = data.b2b.find((row: any) => row.placeOfSupply === "29");
    expect(Number(karnataka.taxableValue)).toBe(100000);
    expect(Number(karnataka.cgst)).toBe(9000);
    expect(Number(karnataka.sgst)).toBe(9000);
    expect(Number(karnataka.igst)).toBe(0);
    expect(Number(karnataka.ratePercent)).toBe(18);

    const maharashtra = data.b2b.find((row: any) => row.placeOfSupply === "27");
    expect(Number(maharashtra.igst)).toBe(9000);
    expect(Number(maharashtra.cgst)).toBe(0);
    expect(Number(maharashtra.sgst)).toBe(0);

    // Unregistered customers are aggregated rate-wise, never per person.
    expect(data.b2c).toHaveLength(1);
    expect(Number(data.b2c[0].taxableValue)).toBe(10000);
    expect(Number(data.b2c[0].cgst)).toBe(900);
    expect(Number(data.b2c[0].sgst)).toBe(900);

    // HSN/SAC summary is required in GSTR-1 and groups across supply types.
    const consulting = data.hsnSummary.find((row: any) => row.hsnSacCode === "998313");
    expect(Number(consulting.taxableValue)).toBe(150000);
    expect(Number(consulting.totalTax)).toBe(27000);

    expect(Number(data.totals.taxableValue)).toBe(160000);
    expect(Number(data.totals.cgst)).toBe(9900);
    expect(Number(data.totals.sgst)).toBe(9900);
    expect(Number(data.totals.igst)).toBe(9000);
    expect(data.documentSummary.issued).toBe(3);
  });

  it("offsets output tax with input credit in GSTR-3B and lists the ITC register", async () => {
    const vendor = (
      await request(app.getHttpServer())
        .post("/api/v2/finance/parties")
        .set(auth(managerToken))
        .send({ type: "VENDOR", name: "Lab Supplies Pvt Ltd", gstin: "29DDDCT3333D1Z5" })
        .expect(201)
    ).body.data.id as string;

    const expense = (
      await request(app.getHttpServer())
        .post("/api/v2/finance/expenses")
        .set(auth(managerToken))
        .send({
          expenseNumber: `${stamp}-EXP`,
          vendorPartyId: vendor,
          category: "Lab consumables",
          description: "Robotics lab consumables",
          expenseDate: "2026-06-15",
          lines: [
            {
              description: "Servo motors",
              amount: 20000,
              taxRateId: gst18Id,
              hsnSacCode: "998313",
            },
          ],
        })
        .expect(201)
    ).body.data.id as string;

    await request(app.getHttpServer())
      .post(`/api/v2/finance/expenses/${expense}/submit`)
      .set(auth(managerToken))
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v2/finance/expenses/${expense}/approve`)
      .set(auth(managerToken))
      .expect(201);

    const gstr3b = await request(app.getHttpServer())
      .get("/api/v2/gst/gstr-3b")
      .query({ from: "2026-06-01", to: "2026-06-30" })
      .set(auth(managerToken))
      .expect(200);
    const data = gstr3b.body.data;

    expect(Number(data.outwardTaxableSupplies.taxableValue)).toBe(160000);
    expect(Number(data.outwardTaxableSupplies.cgst)).toBe(9900);
    expect(Number(data.outwardTaxableSupplies.igst)).toBe(9000);

    // 20,000 at 18% purchased within Karnataka -> CGST 1,800 + SGST 1,800.
    expect(Number(data.eligibleItc.cgst)).toBe(1800);
    expect(Number(data.eligibleItc.sgst)).toBe(1800);
    expect(Number(data.eligibleItc.igst)).toBe(0);

    // Credit is set off head-wise and never goes negative.
    expect(Number(data.netTaxPayable.cgst)).toBe(8100);
    expect(Number(data.netTaxPayable.sgst)).toBe(8100);
    expect(Number(data.netTaxPayable.igst)).toBe(9000);

    const itc = await request(app.getHttpServer())
      .get("/api/v2/gst/itc-register")
      .query({ from: "2026-06-01", to: "2026-06-30" })
      .set(auth(managerToken))
      .expect(200);
    expect(itc.body.data).toHaveLength(1);
    expect(itc.body.data[0].vendorGstin).toBe("29DDDCT3333D1Z5");
    expect(Number(itc.body.data[0].taxableValue)).toBe(20000);
    expect(itc.body.meta.total).toBe(1);
  });

  it("keeps every GST report inside the organization boundary", async () => {
    for (const path of ["gstr-1", "gstr-3b", "itc-register"]) {
      const response = await request(app.getHttpServer())
        .get(`/api/v2/gst/${path}`)
        .query({ from: "2026-06-01", to: "2026-06-30" })
        .set(auth(foreignToken))
        .expect(200);
      const body = JSON.stringify(response.body.data);
      expect(body).not.toContain("998313");
      expect(body).not.toContain("29BBBCT1111B1Z5");
    }

    await request(app.getHttpServer())
      .get("/api/v2/gst/hsn-codes")
      .set(auth(foreignToken))
      .expect(200)
      .expect(({ body }) => expect(body.data).toHaveLength(0));

    // Unknown query parameters are rejected rather than silently ignored.
    await request(app.getHttpServer())
      .get("/api/v2/gst/hsn-codes")
      .query({ from: "2026-06-01" })
      .set(auth(managerToken))
      .expect(400);

    await request(app.getHttpServer())
      .get("/api/v2/gst/gstr-1")
      .query({ from: "2026-06-01", to: "2026-06-30" })
      .set(auth(employeeToken))
      .expect(403);
  });
});
