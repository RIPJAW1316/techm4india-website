import cookieParser from "cookie-parser";
import argon2 from "argon2";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(30_000);

describe("MVP-3 finance and GST engine", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let founderToken: string;
  let financeManagerToken: string;
  let financeExecutiveToken: string;
  let superAdminToken: string;
  let directorToken: string;
  let employeeToken: string;
  let hrToken: string;
  let salesToken: string;
  let viewerToken: string;
  let externalFounderToken: string;
  let organizationId: string;
  let externalOrganizationId: string;
  let vendorId: string;
  const taxIds: Record<string, string> = {};
  const password = "finance-test-password";
  const stamp = `finance-${Date.now()}`;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  async function login(email: string) {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login").send({ email, password }).expect(201);
    return response.body.data.accessToken as string;
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ defaultVersion: "1", type: VersioningType.URI });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    prisma = app.get(PrismaService);
    const org = await prisma.organization.create({ data: { legalName: "Finance Test Organization", slug: stamp } });
    organizationId = org.id;
    const division = await prisma.division.create({ data: { organizationId, name: "Finance Division", slug: stamp } });
    const department = await prisma.department.create({ data: { divisionId: division.id, name: "Finance Department", slug: stamp } });
    const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, parallelism: 1, timeCost: 2 });
    const actor = async (roleName: string, code: string, divisionId = division.id, departmentId = department.id) => {
      const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
      const user = await prisma.user.create({ data: { email: `${stamp}-${code}@test.local`, passwordHash: hash, status: "ACTIVE", roles: { create: { roleId: role.id } }, employee: { create: { employeeCode: `${stamp}-${code}`, firstName: "Finance", lastName: code, divisionId, departmentId } } } });
      return user.email;
    };
    founderToken = await login(await actor("FOUNDER_CEO", "founder"));
    financeManagerToken = await login(await actor("FINANCE_MANAGER", "manager"));
    financeExecutiveToken = await login(await actor("FINANCE_EXECUTIVE", "executive"));
    superAdminToken = await login(await actor("SUPER_ADMIN", "super-admin"));
    directorToken = await login(await actor("DIRECTOR", "director"));
    employeeToken = await login(await actor("EMPLOYEE", "employee"));
    hrToken = await login(await actor("HR_MANAGER", "hr"));
    salesToken = await login(await actor("SALES_MANAGER", "sales"));
    viewerToken = await login(await actor("VIEWER", "viewer"));
    const external = await prisma.organization.create({ data: { legalName: "External Finance Organization", slug: `${stamp}-external` } });
    externalOrganizationId = external.id;
    const externalDivision = await prisma.division.create({ data: { organizationId: external.id, name: "External Division", slug: `${stamp}-external` } });
    const externalDepartment = await prisma.department.create({ data: { divisionId: externalDivision.id, name: "External Department", slug: `${stamp}-external` } });
    externalFounderToken = await login(await actor("FOUNDER_CEO", "external", externalDivision.id, externalDepartment.id));
  });

  it("enforces finance permissions and organization isolation", async () => {
    for (const token of [employeeToken, hrToken, salesToken, viewerToken]) {
      await request(app.getHttpServer()).get("/api/v2/finance/dashboard").set(auth(token)).expect(403);
    }
    await request(app.getHttpServer()).get("/api/v2/finance/dashboard").set(auth(directorToken)).expect(200);
    await request(app.getHttpServer()).get("/api/v2/finance/parties").set(auth(directorToken)).expect(403);
    await request(app.getHttpServer()).get("/api/v2/finance/dashboard").set(auth(financeExecutiveToken)).expect(200);
    await request(app.getHttpServer()).get("/api/v2/finance/dashboard").set(auth(superAdminToken)).expect(200);
    await request(app.getHttpServer()).get("/api/v2/finance/parties").set(auth(superAdminToken)).expect(200);
    const externalParty = (await request(app.getHttpServer()).post("/api/v2/finance/parties").set(auth(externalFounderToken)).send({ type: "CUSTOMER", name: "External customer" }).expect(201)).body.data;
    await request(app.getHttpServer()).get(`/api/v2/finance/parties/${externalParty.id}`).set(auth(founderToken)).expect(404);
    await request(app.getHttpServer()).post("/api/v2/finance/invoices").set(auth(founderToken)).send({ invoiceNumber: "CROSS-ORG", partyId: externalParty.id, invoiceDate: "2026-07-01", lines: [{ description: "No access", quantity: 1, unitPrice: 1 }] }).expect(404);
  });

  it("calculates configurable tax invoices, snapshots issue history, and keeps payment integrity", async () => {
    const headers = auth(founderToken);
    const party = (await request(app.getHttpServer()).post("/api/v2/finance/parties").set(headers).send({ type: "CUSTOMER", name: "Test Customer", gstin: "TEST-ONLY-NOT-REAL" }).expect(201)).body.data;
    const vendor = (await request(app.getHttpServer()).post("/api/v2/finance/parties").set(headers).send({ type: "VENDOR", name: "Test Vendor" }).expect(201)).body.data;
    vendorId = vendor.id;
    for (const [code, taxType, rate] of [["TEST-CGST", "CGST", 5], ["TEST-SGST", "SGST", 5], ["TEST-IGST", "IGST", 12]] as const) {
      const row = (await request(app.getHttpServer()).post("/api/v2/finance/tax-rates").set(headers).send({ code, name: `${taxType} synthetic test`, taxType, rate, effectiveFrom: "2026-01-01" }).expect(201)).body.data;
      taxIds[taxType] = row.id;
    }
    const futureTax = (await request(app.getHttpServer()).post("/api/v2/finance/tax-rates").set(headers).send({ code: "FUTURE", name: "Future test", taxType: "GST", rate: 1, effectiveFrom: "2030-01-01" }).expect(201)).body.data;
    await request(app.getHttpServer()).post("/api/v2/finance/invoices").set(headers).send({ invoiceNumber: "INV-INACTIVE-TEST", partyId: party.id, invoiceDate: "2026-07-01", lines: [{ description: "Future tax is unavailable", quantity: 1, unitPrice: 1, taxRateId: futureTax.id }] }).expect(409);
    const draft = (await request(app.getHttpServer()).post("/api/v2/finance/invoices").set(headers).send({ invoiceNumber: "INV-TEST-001", partyId: party.id, invoiceDate: "2026-07-01", dueDate: "2026-07-15", currency: "INR", lines: [{ description: "Engineering service", quantity: 2, unitPrice: 100, discountAmount: 20, hsnSacCode: "TEST-HSN", taxRateId: taxIds.CGST }] }).expect(201)).body.data;
    expect(String(draft.subtotal)).toBe("200");
    expect(String(draft.discountTotal)).toBe("20");
    expect(String(draft.taxTotal)).toBe("9");
    expect(String(draft.grandTotal)).toBe("189");
    await request(app.getHttpServer()).post("/api/v2/finance/invoices").set(headers).send({ invoiceNumber: "INV-TEST-001", partyId: party.id, invoiceDate: "2026-07-01", lines: [{ description: "Duplicate", quantity: 1, unitPrice: 1 }] }).expect(409);
    await request(app.getHttpServer()).post(`/api/v2/finance/invoices/${draft.id}/issue`).set(auth(financeExecutiveToken)).expect(403);
    const issued = await request(app.getHttpServer()).post(`/api/v2/finance/invoices/${draft.id}/issue`).set(headers).expect(201);
    expect(issued.body.data.status).toBe("ISSUED");
    expect(issued.body.data.partyNameSnapshot).toBe("Test Customer");
    expect(String(issued.body.data.lines[0].taxRateSnapshot)).toBe("5");
    await request(app.getHttpServer()).patch(`/api/v2/finance/tax-rates/${taxIds.CGST}`).set(headers).send({ rate: 15 }).expect(200);
    await request(app.getHttpServer()).patch(`/api/v2/finance/invoices/${draft.id}`).set(headers).send({ notes: "not allowed" }).expect(409);
    const historical = await request(app.getHttpServer()).get(`/api/v2/finance/invoices/${draft.id}`).set(headers).expect(200);
    expect(String(historical.body.data.lines[0].taxRateSnapshot)).toBe("5");
    const partial = (await request(app.getHttpServer()).post("/api/v2/finance/payments").set(headers).send({ direction: "RECEIVED", invoiceId: draft.id, amount: 50, currency: "INR", method: "UPI", paymentDate: "2026-07-02" }).expect(201)).body.data;
    expect((await request(app.getHttpServer()).get(`/api/v2/finance/invoices/${draft.id}`).set(headers).expect(200)).body.data.status).toBe("PARTIALLY_PAID");
    await request(app.getHttpServer()).post("/api/v2/finance/payments").set(headers).send({ direction: "RECEIVED", invoiceId: draft.id, amount: 140, currency: "INR", paymentDate: "2026-07-03" }).expect(409);
    await request(app.getHttpServer()).post(`/api/v2/finance/payments/${partial.id}/void`).set(auth(financeExecutiveToken)).send({ reason: "Not permitted" }).expect(403);
    await request(app.getHttpServer()).post(`/api/v2/finance/payments/${partial.id}/void`).set(headers).send({ reason: "Correcting receipt" }).expect(201);
    await request(app.getHttpServer()).post(`/api/v2/finance/payments/${partial.id}/void`).set(headers).send({ reason: "Duplicate" }).expect(409);
    await request(app.getHttpServer()).post("/api/v2/finance/payments").set(headers).send({ direction: "RECEIVED", invoiceId: draft.id, amount: 189, currency: "INR", paymentDate: "2026-07-03" }).expect(201);
    const paid = await request(app.getHttpServer()).get(`/api/v2/finance/invoices/${draft.id}`).set(headers).expect(200);
    expect(paid.body.data.status).toBe("PAID");
    await request(app.getHttpServer()).post(`/api/v2/finance/invoices/${draft.id}/cancel`).set(headers).send({ reason: "Unsafe after payment" }).expect(409);
    const cancelDraft = (await request(app.getHttpServer()).post("/api/v2/finance/invoices").set(headers).send({ invoiceNumber: "INV-TEST-CANCEL", partyId: party.id, invoiceDate: "2026-07-01", lines: [{ description: "Cancelled history", quantity: 1, unitPrice: 10 }] }).expect(201)).body.data;
    await request(app.getHttpServer()).post(`/api/v2/finance/invoices/${cancelDraft.id}/cancel`).set(headers).send({ reason: "Test cancellation" }).expect(201);
    const gst = await request(app.getHttpServer()).get("/api/v2/finance/gst/summary?from=2026-07-01&to=2026-07-31").set(headers).expect(200);
    expect(String(gst.body.data.CGST)).toBe("9");
    expect(String(gst.body.data.taxableValue)).toBe("180");
    const register = await request(app.getHttpServer()).get("/api/v2/finance/gst/register?from=2026-07-01&to=2026-07-31").set(headers).expect(200);
    expect(register.body.data.some((row: { id: string }) => row.id === cancelDraft.id)).toBe(false);
  });

  it("runs expense, payable, journal and reporting workflows with constrained approvals", async () => {
    const headers = auth(founderToken);
    const expense = (await request(app.getHttpServer()).post("/api/v2/finance/expenses").set(headers).send({ expenseNumber: "EXP-TEST-001", vendorPartyId: vendorId, category: "Lab supplies", description: "Prototype materials", expenseDate: "2026-07-04", currency: "INR", lines: [{ description: "Materials", amount: 100, taxRateId: taxIds.IGST }] }).expect(201)).body.data;
    expect(String(expense.totalAmount)).toBe("112");
    await request(app.getHttpServer()).patch(`/api/v2/finance/expenses/${expense.id}`).set(headers).send({ description: "Updated materials", lines: [{ description: "Updated materials", amount: 200, taxRateId: taxIds.IGST }] }).expect(200);
    await request(app.getHttpServer()).post(`/api/v2/finance/expenses/${expense.id}/submit`).set(auth(financeExecutiveToken)).expect(201);
    await request(app.getHttpServer()).post(`/api/v2/finance/expenses/${expense.id}/approve`).set(auth(financeExecutiveToken)).expect(403);
    await request(app.getHttpServer()).post(`/api/v2/finance/expenses/${expense.id}/approve`).set(auth(financeManagerToken)).expect(201);
    const approved = await request(app.getHttpServer()).get(`/api/v2/finance/expenses/${expense.id}`).set(headers).expect(200);
    expect(String(approved.body.data.totalAmount)).toBe("224");
    const payment = (await request(app.getHttpServer()).post("/api/v2/finance/payments").set(auth(financeExecutiveToken)).send({ direction: "PAID", expenseId: expense.id, amount: 224, currency: "INR", method: "BANK_TRANSFER", paymentDate: "2026-07-05" }).expect(201)).body.data;
    expect((await request(app.getHttpServer()).get(`/api/v2/finance/expenses/${expense.id}`).set(headers).expect(200)).body.data.paymentStatus).toBe("PAID");
    await request(app.getHttpServer()).post(`/api/v2/finance/payments/${payment.id}/void`).set(headers).send({ reason: "Reversal test" }).expect(201);
    const payables = await request(app.getHttpServer()).get("/api/v2/finance/payables").set(headers).expect(200);
    expect(payables.body.data.some((row: { id: string }) => row.id === expense.id)).toBe(true);
    const rejected = (await request(app.getHttpServer()).post("/api/v2/finance/expenses").set(headers).send({ expenseNumber: "EXP-TEST-REJECT", vendorPartyId: vendorId, category: "Test", description: "Reject path", expenseDate: "2026-07-04", lines: [{ description: "Reject path", amount: 1 }] }).expect(201)).body.data;
    await request(app.getHttpServer()).post(`/api/v2/finance/expenses/${rejected.id}/submit`).set(headers).expect(201);
    await request(app.getHttpServer()).post(`/api/v2/finance/expenses/${rejected.id}/reject`).set(auth(financeManagerToken)).send({ reason: "Not approved" }).expect(201);
    const debit = (await request(app.getHttpServer()).post("/api/v2/finance/ledger/accounts").set(headers).send({ code: "TEST-CASH", name: "Test cash", type: "ASSET" }).expect(201)).body.data;
    const credit = (await request(app.getHttpServer()).post("/api/v2/finance/ledger/accounts").set(headers).send({ code: "TEST-INCOME", name: "Test income", type: "INCOME" }).expect(201)).body.data;
    await request(app.getHttpServer()).post("/api/v2/finance/journals").set(headers).send({ entryDate: "2026-07-06", description: "Unbalanced", lines: [{ ledgerAccountId: debit.id, debit: 100, credit: 0 }, { ledgerAccountId: credit.id, debit: 0, credit: 90 }] }).expect(400);
    const journal = (await request(app.getHttpServer()).post("/api/v2/finance/journals").set(headers).send({ entryDate: "2026-07-06", description: "Balanced test entry", lines: [{ ledgerAccountId: debit.id, debit: 100, credit: 0 }, { ledgerAccountId: credit.id, debit: 0, credit: 100 }] }).expect(201)).body.data;
    await request(app.getHttpServer()).post(`/api/v2/finance/journals/${journal.id}/post`).set(auth(financeExecutiveToken)).expect(403);
    await request(app.getHttpServer()).post(`/api/v2/finance/journals/${journal.id}/post`).set(headers).expect(201);
    await request(app.getHttpServer()).post(`/api/v2/finance/journals/${journal.id}/post`).set(headers).expect(409);
    await request(app.getHttpServer()).get(`/api/v2/finance/journals/${journal.id}`).set(auth(externalFounderToken)).expect(404);
    const dashboard = await request(app.getHttpServer()).get("/api/v2/finance/dashboard?from=2026-07-01&to=2026-07-31").set(headers).expect(200);
    expect(dashboard.body.data.gst).toBeDefined();
  });

  afterAll(async () => {
    await prisma.journalLine.deleteMany({ where: { journalEntry: { organizationId: { in: [organizationId, externalOrganizationId] } } } });
    await prisma.journalEntry.deleteMany({ where: { organizationId: { in: [organizationId, externalOrganizationId] } } });
    await prisma.financePayment.deleteMany({ where: { organizationId: { in: [organizationId, externalOrganizationId] } } });
    await prisma.financeInvoiceLine.deleteMany({ where: { invoice: { organizationId: { in: [organizationId, externalOrganizationId] } } } });
    await prisma.financeExpenseLine.deleteMany({ where: { expense: { organizationId: { in: [organizationId, externalOrganizationId] } } } });
    await prisma.financeInvoice.deleteMany({ where: { organizationId: { in: [organizationId, externalOrganizationId] } } });
    await prisma.financeExpense.deleteMany({ where: { organizationId: { in: [organizationId, externalOrganizationId] } } });
    await prisma.ledgerAccount.deleteMany({ where: { organizationId: { in: [organizationId, externalOrganizationId] } } });
    await prisma.financeTaxRate.deleteMany({ where: { organizationId: { in: [organizationId, externalOrganizationId] } } });
    await prisma.financeParty.deleteMany({ where: { organizationId: { in: [organizationId, externalOrganizationId] } } });
    const users = await prisma.user.findMany({ where: { email: { startsWith: stamp } }, select: { id: true } });
    const ids = users.map((row) => row.id);
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: ids } } });
    await prisma.refreshSession.deleteMany({ where: { userId: { in: ids } } });
    await prisma.employee.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.department.deleteMany({ where: { slug: { startsWith: stamp } } });
    await prisma.division.deleteMany({ where: { slug: { startsWith: stamp } } });
    await prisma.organization.deleteMany({ where: { slug: { startsWith: stamp } } });
    await app.close();
  });
});
