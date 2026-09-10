import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  FinanceExpenseStatus,
  FinanceInvoiceStatus,
  FinancePartyType,
  FinancePaymentDirection,
  Prisma,
} from "@prisma/client";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  DateRangeDto,
  ExpenseDto,
  ExpenseQueryDto,
  InvoiceDto,
  InvoiceLineDto,
  InvoiceQueryDto,
  JournalDto,
  LedgerAccountDto,
  PartyDto,
  PartyQueryDto,
  PaymentDto,
  PaymentQueryDto,
  TaxRateDto,
} from "./dto/finance.dto";

const decimal = (value: Prisma.Decimal | number | string | null | undefined) =>
  new Prisma.Decimal(value ?? 0).toDecimalPlaces(2);
const currency = (value?: string) => (value || "INR").trim().toUpperCase();

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  private org(p: Principal) {
    if (!p.organizationId) throw new ForbiddenException("Organization context required");
    return p.organizationId;
  }
  private async auditEvent(action: string, p: Principal, entityType: string, entityId: string, request?: RequestMetadata, metadata?: Record<string, unknown>) {
    await this.audit.record({ action, actorUserId: p.userId, entityType, entityId, request, metadata });
  }
  private page(q: { page?: number; limit?: number }) { return { skip: ((q.page ?? 1) - 1) * (q.limit ?? 20), take: q.limit ?? 20 }; }
  private duplicate(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictException(message);
    throw error;
  }
  private async party(p: Principal, id: string) {
    const row = await this.prisma.financeParty.findFirst({ where: { id, organizationId: this.org(p), archivedAt: null } });
    if (!row) throw new NotFoundException("Finance party not found");
    return row;
  }
  private async tax(p: Principal, id: string, date?: Date) {
    const row = await this.prisma.financeTaxRate.findFirst({ where: { id, organizationId: this.org(p) } });
    if (!row) throw new NotFoundException("Tax configuration not found");
    if (!row.isActive || (date && ((row.effectiveFrom && row.effectiveFrom > date) || (row.effectiveTo && row.effectiveTo < date)))) throw new ConflictException("Tax configuration is not active for this document date");
    return row;
  }
  private snapshotParty(row: any) {
    const address = [row.billingAddressLine1, row.billingAddressLine2, row.city, row.state, row.postalCode, row.country].filter(Boolean).join(", ");
    return { partyNameSnapshot: row.displayName || row.name, partyAddressSnapshot: address || null, partyGstinSnapshot: row.gstin || null };
  }
  private async validatePartyLinks(p: Principal, dto: PartyDto) {
    const organizationId = this.org(p);
    if (dto.crmAccountId) {
      const account = await this.prisma.crmAccount.findFirst({ where: { id: dto.crmAccountId, organizationId } });
      if (!account) throw new NotFoundException("CRM account not found in organization");
    }
    if (dto.institutionId) {
      const institution = await this.prisma.institution.findFirst({ where: { id: dto.institutionId, organizationId } });
      if (!institution) throw new NotFoundException("Institution not found in organization");
    }
  }

  async listParties(p: Principal, q: PartyQueryDto) {
    const organizationId = this.org(p); const where: any = { organizationId, archivedAt: null, type: q.type, isActive: q.active };
    if (q.search) where.OR = ["name", "displayName", "email", "phone"].map((field) => ({ [field]: { contains: q.search, mode: "insensitive" } }));
    const [data, total] = await this.prisma.$transaction([this.prisma.financeParty.findMany({ where, orderBy: { name: "asc" }, ...this.page(q) }), this.prisma.financeParty.count({ where })]);
    return { data, meta: { page: q.page, limit: q.limit, total } };
  }
  async getParty(p: Principal, id: string) { return this.party(p, id); }
  async createParty(p: Principal, dto: PartyDto, request?: RequestMetadata) {
    if (!dto.name?.trim() || !dto.type) throw new BadRequestException("name and type are required");
    await this.validatePartyLinks(p, dto);
    const row = await this.prisma.financeParty.create({ data: { organizationId: this.org(p), type: dto.type, name: dto.name.trim(), displayName: dto.displayName, email: dto.email, phone: dto.phone, billingAddressLine1: dto.billingAddressLine1, billingAddressLine2: dto.billingAddressLine2, city: dto.city, state: dto.state, postalCode: dto.postalCode, country: dto.country, gstin: dto.gstin, pan: dto.pan, crmAccountId: dto.crmAccountId, institutionId: dto.institutionId, isActive: dto.isActive ?? true } });
    await this.auditEvent("FINANCE_PARTY_CREATED", p, "FinanceParty", row.id, request, { type: row.type, name: row.name }); return row;
  }
  async updateParty(p: Principal, id: string, dto: PartyDto, request?: RequestMetadata) {
    await this.party(p, id); await this.validatePartyLinks(p, dto);
    const row = await this.prisma.financeParty.update({ where: { id }, data: { type: dto.type, name: dto.name?.trim(), displayName: dto.displayName, email: dto.email, phone: dto.phone, billingAddressLine1: dto.billingAddressLine1, billingAddressLine2: dto.billingAddressLine2, city: dto.city, state: dto.state, postalCode: dto.postalCode, country: dto.country, gstin: dto.gstin, pan: dto.pan, crmAccountId: dto.crmAccountId, institutionId: dto.institutionId, isActive: dto.isActive } });
    await this.auditEvent("FINANCE_PARTY_UPDATED", p, "FinanceParty", id, request, { type: row.type, name: row.name }); return row;
  }

  async listTaxRates(p: Principal) { return this.prisma.financeTaxRate.findMany({ where: { organizationId: this.org(p) }, orderBy: [{ taxType: "asc" }, { code: "asc" }] }); }
  async createTaxRate(p: Principal, dto: TaxRateDto, request?: RequestMetadata) {
    if (!dto.code?.trim() || !dto.name?.trim() || dto.rate === undefined || !dto.taxType) throw new BadRequestException("code, name, rate and taxType are required");
    if (dto.effectiveFrom && dto.effectiveTo && new Date(dto.effectiveTo) < new Date(dto.effectiveFrom)) throw new BadRequestException("effectiveTo must follow effectiveFrom");
    let row;
    try { row = await this.prisma.financeTaxRate.create({ data: { organizationId: this.org(p), code: dto.code.trim().toUpperCase(), name: dto.name.trim(), rate: decimal(dto.rate), taxType: dto.taxType, description: dto.description, isActive: dto.isActive ?? true, effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined, effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined } }); }
    catch (error) { this.duplicate(error, "Tax code already exists in this organization"); }
    await this.auditEvent("TAX_RATE_CREATED", p, "FinanceTaxRate", row.id, request, { code: row.code, taxType: row.taxType }); return row;
  }
  async updateTaxRate(p: Principal, id: string, dto: TaxRateDto, request?: RequestMetadata) {
    const existing = await this.prisma.financeTaxRate.findFirst({ where: { id, organizationId: this.org(p) } }); if (!existing) throw new NotFoundException("Tax configuration not found");
    const row = await this.prisma.financeTaxRate.update({ where: { id }, data: { code: dto.code?.trim().toUpperCase(), name: dto.name?.trim(), rate: dto.rate === undefined ? undefined : decimal(dto.rate), taxType: dto.taxType, description: dto.description, isActive: dto.isActive, effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined, effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined } });
    await this.auditEvent("TAX_RATE_UPDATED", p, "FinanceTaxRate", id, request, { code: row.code, taxType: row.taxType }); return row;
  }

  private async invoiceLines(p: Principal, lines: InvoiceLineDto[], invoiceDate: Date) {
    if (!lines.length) throw new BadRequestException("At least one invoice line is required");
    return Promise.all(lines.map(async (line) => {
      const gross = decimal(decimal(line.quantity).mul(line.unitPrice)); const discount = decimal(line.discountAmount); if (discount.gt(gross)) throw new BadRequestException("Line discount cannot exceed line amount");
      const taxableValue = decimal(gross.minus(discount)); const tax = line.taxRateId ? await this.tax(p, line.taxRateId, invoiceDate) : null; const taxAmount = decimal(taxableValue.mul(tax?.rate ?? 0).div(100));
      return { description: line.description.trim(), quantity: new Prisma.Decimal(line.quantity), unitPrice: decimal(line.unitPrice), discountAmount: discount, hsnSacCode: line.hsnSacCode, taxRateId: tax?.id, taxableValue, taxAmount, lineTotal: decimal(taxableValue.plus(taxAmount)), taxCodeSnapshot: tax?.code, taxNameSnapshot: tax?.name, taxRateSnapshot: tax?.rate };
    }));
  }
  private invoiceTotals(lines: any[], rounding: number | undefined) {
    const subtotal = lines.reduce((sum, line) => sum.plus(line.quantity.mul(line.unitPrice)), decimal(0)); const discountTotal = lines.reduce((sum, line) => sum.plus(line.discountAmount), decimal(0)); const taxTotal = lines.reduce((sum, line) => sum.plus(line.taxAmount), decimal(0)); const roundingAdjustment = decimal(rounding); const grandTotal = decimal(subtotal.minus(discountTotal).plus(taxTotal).plus(roundingAdjustment));
    if (grandTotal.lt(0)) throw new BadRequestException("Invoice total cannot be negative"); return { subtotal: decimal(subtotal), discountTotal: decimal(discountTotal), taxTotal: decimal(taxTotal), roundingAdjustment, grandTotal };
  }
  async listInvoices(p: Principal, q: InvoiceQueryDto) {
    const where: any = { organizationId: this.org(p), status: q.status as FinanceInvoiceStatus | undefined, partyId: q.partyId, currency: q.currency?.toUpperCase() };
    if (q.from || q.to) where.invoiceDate = { gte: q.from ? new Date(q.from) : undefined, lte: q.to ? new Date(q.to) : undefined }; if (q.dueFrom || q.dueTo) where.dueDate = { gte: q.dueFrom ? new Date(q.dueFrom) : undefined, lte: q.dueTo ? new Date(q.dueTo) : undefined };
    const [data, total] = await this.prisma.$transaction([this.prisma.financeInvoice.findMany({ where, include: { party: { select: { id: true, name: true, displayName: true } } }, orderBy: { invoiceDate: "desc" }, ...this.page(q) }), this.prisma.financeInvoice.count({ where })]); return { data, meta: { page: q.page, limit: q.limit, total } };
  }
  async invoice(p: Principal, id: string) { const row = await this.prisma.financeInvoice.findFirst({ where: { id, organizationId: this.org(p) }, include: { party: true, lines: { include: { taxRate: true } }, payments: true } }); if (!row) throw new NotFoundException("Invoice not found"); return row; }
  async createInvoice(p: Principal, dto: InvoiceDto, request?: RequestMetadata) {
    if (!dto.partyId || !dto.invoiceDate || !dto.invoiceNumber?.trim() || !dto.lines) throw new BadRequestException("invoiceNumber, partyId, invoiceDate and lines are required"); const party = await this.party(p, dto.partyId); if (party.type === FinancePartyType.VENDOR) throw new BadRequestException("Vendor-only party cannot be invoiced"); const date = new Date(dto.invoiceDate); const lines = await this.invoiceLines(p, dto.lines, date); const totals = this.invoiceTotals(lines, dto.roundingAdjustment);
    let row;
    try { row = await this.prisma.financeInvoice.create({ data: { organizationId: this.org(p), invoiceNumber: dto.invoiceNumber.trim(), partyId: party.id, invoiceDate: date, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, currency: currency(dto.currency), notes: dto.notes, terms: dto.terms, placeOfSupply: dto.placeOfSupply, createdByUserId: p.userId, ...totals, balanceDue: totals.grandTotal, lines: { create: lines } }, include: { lines: true } }); }
    catch (error) { this.duplicate(error, "Invoice number already exists in this organization"); }
    await this.auditEvent("INVOICE_CREATED", p, "FinanceInvoice", row.id, request, { invoiceNumber: row.invoiceNumber }); return row;
  }
  async updateInvoice(p: Principal, id: string, dto: InvoiceDto, request?: RequestMetadata) {
    const existing = await this.invoice(p, id); if (existing.status !== "DRAFT") throw new ConflictException("Only draft invoices may be edited"); const party = dto.partyId ? await this.party(p, dto.partyId) : existing.party; const date = dto.invoiceDate ? new Date(dto.invoiceDate) : existing.invoiceDate; const lines = dto.lines ? await this.invoiceLines(p, dto.lines, date) : null; const totals = lines ? this.invoiceTotals(lines, dto.roundingAdjustment) : undefined;
    const row = await this.prisma.$transaction(async (tx) => { if (lines) await tx.financeInvoiceLine.deleteMany({ where: { invoiceId: id } }); return tx.financeInvoice.update({ where: { id }, data: { invoiceNumber: dto.invoiceNumber?.trim(), partyId: party.id, invoiceDate: date, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, currency: dto.currency ? currency(dto.currency) : undefined, notes: dto.notes, terms: dto.terms, placeOfSupply: dto.placeOfSupply, ...(totals ?? {}), balanceDue: totals?.grandTotal, lines: lines ? { create: lines } : undefined }, include: { lines: true } }); });
    await this.auditEvent("INVOICE_UPDATED", p, "FinanceInvoice", id, request, { invoiceNumber: row.invoiceNumber }); return row;
  }
  async issueInvoice(p: Principal, id: string, request?: RequestMetadata) {
    const invoice = await this.invoice(p, id); if (invoice.status !== "DRAFT") throw new ConflictException("Only draft invoices may be issued"); if (!invoice.lines.length) throw new BadRequestException("Invoice requires lines"); const party = await this.party(p, invoice.partyId); const lines = await this.invoiceLines(p, invoice.lines.map((line) => ({ description: line.description, quantity: Number(line.quantity), unitPrice: Number(line.unitPrice), discountAmount: Number(line.discountAmount), hsnSacCode: line.hsnSacCode ?? undefined, taxRateId: line.taxRateId ?? undefined })), invoice.invoiceDate); const totals = this.invoiceTotals(lines, Number(invoice.roundingAdjustment));
    const row = await this.prisma.$transaction(async (tx) => { await tx.financeInvoiceLine.deleteMany({ where: { invoiceId: id } }); return tx.financeInvoice.update({ where: { id }, data: { ...totals, balanceDue: totals.grandTotal, status: "ISSUED", finalizedAt: new Date(), ...this.snapshotParty(party), lines: { create: lines } }, include: { lines: true } }); });
    await this.auditEvent("INVOICE_ISSUED", p, "FinanceInvoice", id, request, { invoiceNumber: row.invoiceNumber }); return row;
  }
  async cancelInvoice(p: Principal, id: string, reason: string, request?: RequestMetadata) {
    const invoice = await this.invoice(p, id); if (invoice.status === "CANCELLED") throw new ConflictException("Invoice is already cancelled"); if (!invoice.status || invoice.status === "PAID" || decimal(invoice.amountPaid).gt(0)) throw new ConflictException("Invoices with payments require a reversal before cancellation"); const row = await this.prisma.financeInvoice.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: reason } }); await this.auditEvent("INVOICE_CANCELLED", p, "FinanceInvoice", id, request, { invoiceNumber: row.invoiceNumber }); return row;
  }

  async listPayments(p: Principal, q: PaymentQueryDto) { const where: any = { organizationId: this.org(p), partyId: q.partyId, invoiceId: q.invoiceId, direction: q.direction, status: q.status, currency: q.currency?.toUpperCase() }; if (q.from || q.to) where.paymentDate = { gte: q.from ? new Date(q.from) : undefined, lte: q.to ? new Date(q.to) : undefined }; const [data, total] = await this.prisma.$transaction([this.prisma.financePayment.findMany({ where, include: { party: { select: { id: true, name: true } }, invoice: { select: { id: true, invoiceNumber: true } }, expense: { select: { id: true, expenseNumber: true } } }, orderBy: { paymentDate: "desc" }, ...this.page(q) }), this.prisma.financePayment.count({ where })]); return { data, meta: { page: q.page, limit: q.limit, total } }; }
  private invoiceStatus(invoice: any, paid: Prisma.Decimal) { if (paid.gte(invoice.grandTotal)) return "PAID"; return paid.gt(0) ? "PARTIALLY_PAID" : "ISSUED"; }
  private expensePaymentStatus(expense: any, paid: Prisma.Decimal) { if (paid.gte(expense.totalAmount)) return "PAID"; return paid.gt(0) ? "PARTIALLY_PAID" : "UNPAID"; }
  async recordPayment(p: Principal, dto: PaymentDto, request?: RequestMetadata) {
    const organizationId = this.org(p); if (dto.invoiceId && dto.expenseId) throw new BadRequestException("Payment may reference an invoice or expense, not both"); if (dto.direction === FinancePaymentDirection.RECEIVED && !dto.invoiceId) throw new BadRequestException("Received payments must reference an invoice"); if (dto.direction === FinancePaymentDirection.PAID && !dto.expenseId) throw new BadRequestException("Paid payments must reference an approved expense"); const amount = decimal(dto.amount); const curr = currency(dto.currency);
    const row = await this.prisma.$transaction(async (tx) => {
      let partyId = dto.partyId;
      if (dto.invoiceId) { const invoice = await tx.financeInvoice.findFirst({ where: { id: dto.invoiceId, organizationId } }); if (!invoice) throw new NotFoundException("Invoice not found"); if (!["ISSUED", "PARTIALLY_PAID"].includes(invoice.status)) throw new ConflictException("Invoice is not payable"); if (invoice.currency !== curr) throw new BadRequestException("Payment currency must match invoice currency"); if (amount.gt(invoice.balanceDue)) throw new ConflictException("Overpayment is not allowed"); partyId = partyId ?? invoice.partyId; const paid = decimal(invoice.amountPaid).plus(amount); await tx.financeInvoice.update({ where: { id: invoice.id }, data: { amountPaid: paid, balanceDue: decimal(invoice.grandTotal).minus(paid), status: this.invoiceStatus(invoice, paid) } }); }
      if (dto.expenseId) { const expense = await tx.financeExpense.findFirst({ where: { id: dto.expenseId, organizationId } }); if (!expense) throw new NotFoundException("Expense not found"); if (expense.status !== "APPROVED") throw new ConflictException("Only approved expenses may be paid"); if (expense.currency !== curr) throw new BadRequestException("Payment currency must match expense currency"); const outstanding = decimal(expense.totalAmount).minus(expense.amountPaid); if (amount.gt(outstanding)) throw new ConflictException("Overpayment is not allowed"); partyId = partyId ?? expense.vendorPartyId ?? undefined; const paid = decimal(expense.amountPaid).plus(amount); await tx.financeExpense.update({ where: { id: expense.id }, data: { amountPaid: paid, paymentStatus: this.expensePaymentStatus(expense, paid) } }); }
      if (partyId) await this.party(p, partyId); return tx.financePayment.create({ data: { organizationId, direction: dto.direction, partyId, invoiceId: dto.invoiceId, expenseId: dto.expenseId, amount, currency: curr, method: dto.method, reference: dto.reference, paymentDate: new Date(dto.paymentDate), notes: dto.notes, createdByUserId: p.userId } });
    }); await this.auditEvent("PAYMENT_RECORDED", p, "FinancePayment", row.id, request, { direction: row.direction, invoiceId: row.invoiceId, expenseId: row.expenseId }); return row;
  }
  async voidPayment(p: Principal, id: string, reason: string, request?: RequestMetadata) {
    const organizationId = this.org(p); const row = await this.prisma.$transaction(async (tx) => { const payment = await tx.financePayment.findFirst({ where: { id, organizationId } }); if (!payment) throw new NotFoundException("Payment not found"); if (payment.status === "VOIDED") throw new ConflictException("Payment is already voided"); if (payment.invoiceId) { const invoice = await tx.financeInvoice.findFirstOrThrow({ where: { id: payment.invoiceId, organizationId } }); const paid = decimal(invoice.amountPaid).minus(payment.amount); await tx.financeInvoice.update({ where: { id: invoice.id }, data: { amountPaid: paid, balanceDue: decimal(invoice.grandTotal).minus(paid), status: this.invoiceStatus(invoice, paid) } }); } if (payment.expenseId) { const expense = await tx.financeExpense.findFirstOrThrow({ where: { id: payment.expenseId, organizationId } }); const paid = decimal(expense.amountPaid).minus(payment.amount); await tx.financeExpense.update({ where: { id: expense.id }, data: { amountPaid: paid, paymentStatus: this.expensePaymentStatus(expense, paid) } }); } return tx.financePayment.update({ where: { id }, data: { status: "VOIDED", voidReason: reason, voidedAt: new Date() } }); }); await this.auditEvent("PAYMENT_VOIDED", p, "FinancePayment", id, request, { direction: row.direction }); return row;
  }

  private async expenseLines(p: Principal, lines: any[], date: Date) { if (!lines.length) throw new BadRequestException("At least one expense line is required"); return Promise.all(lines.map(async (line) => { const tax = line.taxRateId ? await this.tax(p, line.taxRateId, date) : null; const amount = decimal(line.amount); return { description: line.description.trim(), amount, taxRateId: tax?.id, taxAmount: decimal(amount.mul(tax?.rate ?? 0).div(100)), hsnSacCode: line.hsnSacCode }; })); }
  private expenseTotals(lines: any[]) { const subtotal = lines.reduce((sum, line) => sum.plus(line.amount), decimal(0)); const taxAmount = lines.reduce((sum, line) => sum.plus(line.taxAmount), decimal(0)); return { subtotal: decimal(subtotal), taxAmount: decimal(taxAmount), totalAmount: decimal(subtotal.plus(taxAmount)) }; }
  async listExpenses(p: Principal, q: ExpenseQueryDto) { const where: any = { organizationId: this.org(p), status: q.status as FinanceExpenseStatus | undefined, vendorPartyId: q.vendorPartyId }; if (q.from || q.to) where.expenseDate = { gte: q.from ? new Date(q.from) : undefined, lte: q.to ? new Date(q.to) : undefined }; const [data, total] = await this.prisma.$transaction([this.prisma.financeExpense.findMany({ where, include: { vendor: { select: { id: true, name: true } } }, orderBy: { expenseDate: "desc" }, ...this.page(q) }), this.prisma.financeExpense.count({ where })]); return { data, meta: { page: q.page, limit: q.limit, total } }; }
  async expense(p: Principal, id: string) { const row = await this.prisma.financeExpense.findFirst({ where: { id, organizationId: this.org(p) }, include: { vendor: true, lines: { include: { taxRate: true } }, payments: true } }); if (!row) throw new NotFoundException("Expense not found"); return row; }
  async createExpense(p: Principal, dto: ExpenseDto, request?: RequestMetadata) { if (!dto.expenseNumber?.trim() || !dto.category?.trim() || !dto.description?.trim() || !dto.expenseDate || !dto.lines) throw new BadRequestException("expenseNumber, category, description, expenseDate and lines are required"); if (dto.vendorPartyId) { const vendor = await this.party(p, dto.vendorPartyId); if (vendor.type === "CUSTOMER") throw new BadRequestException("Customer-only party cannot be an expense vendor"); } const date = new Date(dto.expenseDate); const lines = await this.expenseLines(p, dto.lines, date); const totals = this.expenseTotals(lines); let row; try { row = await this.prisma.financeExpense.create({ data: { organizationId: this.org(p), expenseNumber: dto.expenseNumber.trim(), vendorPartyId: dto.vendorPartyId, category: dto.category.trim(), description: dto.description.trim(), expenseDate: date, currency: currency(dto.currency), reference: dto.reference, createdByUserId: p.userId, ...totals, lines: { create: lines } }, include: { lines: true } }); } catch (error) { this.duplicate(error, "Expense number already exists in this organization"); } await this.auditEvent("EXPENSE_CREATED", p, "FinanceExpense", row.id, request, { expenseNumber: row.expenseNumber }); return row; }
  async updateExpense(p: Principal, id: string, dto: ExpenseDto, request?: RequestMetadata) { const existing = await this.expense(p, id); if (existing.status !== "DRAFT") throw new ConflictException("Only draft expenses may be edited"); if (dto.vendorPartyId) await this.party(p, dto.vendorPartyId); const date = dto.expenseDate ? new Date(dto.expenseDate) : existing.expenseDate; const lines = dto.lines ? await this.expenseLines(p, dto.lines, date) : null; const totals = lines ? this.expenseTotals(lines) : undefined; const row = await this.prisma.$transaction(async (tx) => { if (lines) await tx.financeExpenseLine.deleteMany({ where: { expenseId: id } }); return tx.financeExpense.update({ where: { id }, data: { expenseNumber: dto.expenseNumber?.trim(), vendorPartyId: dto.vendorPartyId, category: dto.category?.trim(), description: dto.description?.trim(), expenseDate: date, currency: dto.currency ? currency(dto.currency) : undefined, reference: dto.reference, ...(totals ?? {}), lines: lines ? { create: lines } : undefined }, include: { lines: true } }); }); await this.auditEvent("EXPENSE_UPDATED", p, "FinanceExpense", id, request, { expenseNumber: row.expenseNumber }); return row; }
  async transitionExpense(p: Principal, id: string, action: "submit" | "approve" | "reject" | "cancel", reason?: string, request?: RequestMetadata) { const expense = await this.expense(p, id); let data: any; let audit = ""; if (action === "submit") { if (expense.status !== "DRAFT") throw new ConflictException("Only draft expenses may be submitted"); data = { status: "SUBMITTED" }; audit = "EXPENSE_SUBMITTED"; } else if (action === "approve") { if (expense.status !== "SUBMITTED") throw new ConflictException("Only submitted expenses may be approved"); data = { status: "APPROVED", approvedByUserId: p.userId, approvedAt: new Date() }; audit = "EXPENSE_APPROVED"; } else if (action === "reject") { if (expense.status !== "SUBMITTED") throw new ConflictException("Only submitted expenses may be rejected"); if (!reason) throw new BadRequestException("A rejection reason is required"); data = { status: "REJECTED" }; audit = "EXPENSE_REJECTED"; } else { if (["CANCELLED", "APPROVED"].includes(expense.status) || decimal(expense.amountPaid).gt(0)) throw new ConflictException("This expense cannot be cancelled"); if (!reason) throw new BadRequestException("A cancellation reason is required"); data = { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: reason }; audit = "EXPENSE_CANCELLED"; } const row = await this.prisma.financeExpense.update({ where: { id }, data }); await this.auditEvent(audit, p, "FinanceExpense", id, request, { expenseNumber: row.expenseNumber }); return row; }

  async receivables(p: Principal) {
    const today = new Date();
    const rows = await this.prisma.financeInvoice.findMany({ where: { organizationId: this.org(p), status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] }, balanceDue: { gt: 0 } }, include: { party: { select: { id: true, name: true, displayName: true } } }, orderBy: { dueDate: "asc" } });
    return rows.map((row) => ({ ...row, agingStatus: row.dueDate && row.dueDate < today ? "OVERDUE" : row.status }));
  }
  async payables(p: Principal) { return this.prisma.financeExpense.findMany({ where: { organizationId: this.org(p), status: "APPROVED", paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] } }, include: { vendor: { select: { id: true, name: true } } }, orderBy: { expenseDate: "asc" } }); }
  async dashboard(p: Principal, range: DateRangeDto) { const organizationId = this.org(p); const dates = range.from || range.to ? { gte: range.from ? new Date(range.from) : undefined, lte: range.to ? new Date(range.to) : undefined } : undefined; const [invoices, expenses, received, gst] = await Promise.all([this.prisma.financeInvoice.findMany({ where: { organizationId }, include: { lines: { include: { taxRate: true } } } }), this.prisma.financeExpense.findMany({ where: { organizationId, status: "APPROVED" } }), this.prisma.financePayment.findMany({ where: { organizationId, direction: "RECEIVED", status: "RECORDED", paymentDate: dates } }), this.gstSummary(p, range)]); const sum = (rows: any[], key: string) => rows.reduce((total, row) => total.plus(row[key]), decimal(0)); const receivable = invoices.filter((row) => ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(row.status) && decimal(row.balanceDue).gt(0)); const today = new Date(); const overdue = receivable.filter((row) => row.dueDate && row.dueDate < today); return { receivables: sum(receivable, "balanceDue"), overdueReceivables: sum(overdue, "balanceDue"), paymentsReceived: sum(received, "amount"), approvedExpenses: sum(expenses, "totalAmount"), outstandingPayables: sum(expenses.map((row) => ({ amount: decimal(row.totalAmount).minus(row.amountPaid) })), "amount"), invoiceStatusCounts: invoices.reduce((out: Record<string, number>, row) => ({ ...out, [row.status]: (out[row.status] ?? 0) + 1 }), {}), expenseStatusCounts: expenses.reduce((out: Record<string, number>, row) => ({ ...out, [row.status]: (out[row.status] ?? 0) + 1 }), {}), gst }; }
  async gstSummary(p: Principal, range: DateRangeDto) { const where: any = { organizationId: this.org(p), status: { in: ["ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE"] } }; if (range.from || range.to) where.invoiceDate = { gte: range.from ? new Date(range.from) : undefined, lte: range.to ? new Date(range.to) : undefined }; const invoices = await this.prisma.financeInvoice.findMany({ where, include: { lines: { include: { taxRate: true } } } }); const summary: Record<string, Prisma.Decimal> = { taxableValue: decimal(0), GST: decimal(0), CGST: decimal(0), SGST: decimal(0), IGST: decimal(0), CESS: decimal(0), OTHER: decimal(0) }; for (const invoice of invoices) for (const line of invoice.lines) { summary.taxableValue = summary.taxableValue.plus(line.taxableValue); const kind = line.taxRate?.taxType ?? "OTHER"; summary[kind] = (summary[kind] ?? decimal(0)).plus(line.taxAmount); } return summary; }
  async gstRegister(p: Principal, range: DateRangeDto) { const where: any = { organizationId: this.org(p), status: { in: ["ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE"] } }; if (range.from || range.to) where.invoiceDate = { gte: range.from ? new Date(range.from) : undefined, lte: range.to ? new Date(range.to) : undefined }; return this.prisma.financeInvoice.findMany({ where, include: { party: { select: { name: true, gstin: true } }, lines: { include: { taxRate: true } } }, orderBy: { invoiceDate: "asc" } }); }

  async accounts(p: Principal) { return this.prisma.ledgerAccount.findMany({ where: { organizationId: this.org(p) }, orderBy: { code: "asc" } }); }
  async createAccount(p: Principal, dto: LedgerAccountDto, request?: RequestMetadata) { if (!dto.code?.trim() || !dto.name?.trim() || !dto.type) throw new BadRequestException("code, name and type are required"); let row; try { row = await this.prisma.ledgerAccount.create({ data: { organizationId: this.org(p), code: dto.code.trim().toUpperCase(), name: dto.name.trim(), type: dto.type, isActive: dto.isActive ?? true } }); } catch (error) { this.duplicate(error, "Ledger account code already exists in this organization"); } await this.auditEvent("LEDGER_ACCOUNT_CREATED", p, "LedgerAccount", row.id, request, { code: row.code, type: row.type }); return row; }
  async updateAccount(p: Principal, id: string, dto: LedgerAccountDto, request?: RequestMetadata) { const current = await this.prisma.ledgerAccount.findFirst({ where: { id, organizationId: this.org(p) } }); if (!current) throw new NotFoundException("Ledger account not found"); const row = await this.prisma.ledgerAccount.update({ where: { id }, data: { code: dto.code?.trim().toUpperCase(), name: dto.name?.trim(), type: dto.type, isActive: dto.isActive } }); await this.auditEvent("LEDGER_ACCOUNT_UPDATED", p, "LedgerAccount", id, request, { code: row.code }); return row; }
  async journals(p: Principal) { return this.prisma.journalEntry.findMany({ where: { organizationId: this.org(p) }, include: { lines: { include: { ledgerAccount: true } } }, orderBy: { entryDate: "desc" } }); }
  async journal(p: Principal, id: string) { const row = await this.prisma.journalEntry.findFirst({ where: { id, organizationId: this.org(p) }, include: { lines: { include: { ledgerAccount: true } } } }); if (!row) throw new NotFoundException("Journal entry not found"); return row; }
  private async journalLines(p: Principal, lines: any[]) { if (lines.length < 2) throw new BadRequestException("A journal requires at least two lines"); const accounts = await this.prisma.ledgerAccount.findMany({ where: { organizationId: this.org(p), id: { in: lines.map((line) => line.ledgerAccountId) }, isActive: true } }); if (accounts.length !== lines.length) throw new BadRequestException("Journal accounts must be active and organization-scoped"); const values = lines.map((line) => ({ ledgerAccountId: line.ledgerAccountId, debit: decimal(line.debit), credit: decimal(line.credit) })); if (values.some((line) => (line.debit.gt(0) && line.credit.gt(0)) || (line.debit.eq(0) && line.credit.eq(0)))) throw new BadRequestException("Each journal line requires either debit or credit"); const debit = values.reduce((sum, line) => sum.plus(line.debit), decimal(0)); const credit = values.reduce((sum, line) => sum.plus(line.credit), decimal(0)); if (!debit.equals(credit)) throw new BadRequestException("Journal debit and credit totals must balance"); return values; }
  async createJournal(p: Principal, dto: JournalDto, request?: RequestMetadata) { const lines = await this.journalLines(p, dto.lines); const row = await this.prisma.journalEntry.create({ data: { organizationId: this.org(p), entryDate: new Date(dto.entryDate), referenceType: dto.referenceType, referenceId: dto.referenceId, description: dto.description.trim(), createdByUserId: p.userId, lines: { create: lines } }, include: { lines: true } }); await this.auditEvent("JOURNAL_CREATED", p, "JournalEntry", row.id, request); return row; }
  async postJournal(p: Principal, id: string, request?: RequestMetadata) { const journal = await this.journal(p, id); if (journal.status !== "DRAFT") throw new ConflictException("Only draft journals may be posted"); await this.journalLines(p, journal.lines); const row = await this.prisma.journalEntry.update({ where: { id }, data: { status: "POSTED", postedAt: new Date() } }); await this.auditEvent("JOURNAL_POSTED", p, "JournalEntry", id, request); return row; }
}
