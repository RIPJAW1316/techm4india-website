import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
import { FinanceService } from "./finance.service";
import {
  DateRangeDto,
  ExpenseDto,
  ExpenseQueryDto,
  InvoiceDto,
  InvoiceQueryDto,
  JournalDto,
  LedgerAccountDto,
  PartyDto,
  PartyQueryDto,
  PaymentDto,
  PaymentQueryDto,
  ReasonDto,
  TaxRateDto,
} from "./dto/finance.dto";

@ApiTags("finance-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "finance", version: "2" })
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}
  private ok<T>(value: Promise<T> | T) {
    return Promise.resolve(value).then((data) => ({ success: true, data }));
  }
  private list<T extends { data: unknown; meta: unknown }>(value: Promise<T>) {
    return value.then((result) => ({ success: true, ...result }));
  }
  private meta(r: Request) {
    return { ipAddress: r.ip, userAgent: r.get("user-agent") ?? undefined };
  }

  @Get("dashboard") @RequirePermissions("finance.dashboard.read") dashboard(
    @CurrentPrincipal() p: Principal,
    @Query() q: DateRangeDto,
  ) {
    return this.ok(this.finance.dashboard(p, q));
  }
  @Get("parties") @RequirePermissions("finance.parties.read") parties(
    @CurrentPrincipal() p: Principal,
    @Query() q: PartyQueryDto,
  ) {
    return this.list(this.finance.listParties(p, q));
  }
  @Get("parties/:id") @RequirePermissions("finance.parties.read") party(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.finance.getParty(p, id));
  }
  @Post("parties") @RequirePermissions("finance.parties.manage") createParty(
    @CurrentPrincipal() p: Principal,
    @Body() dto: PartyDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.createParty(p, dto, this.meta(r)));
  }
  @Patch("parties/:id") @RequirePermissions("finance.parties.manage") updateParty(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PartyDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.updateParty(p, id, dto, this.meta(r)));
  }

  @Get("tax-rates") @RequirePermissions("finance.tax.read") taxes(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.finance.listTaxRates(p));
  }
  @Post("tax-rates") @RequirePermissions("finance.tax.manage") createTax(
    @CurrentPrincipal() p: Principal,
    @Body() dto: TaxRateDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.createTaxRate(p, dto, this.meta(r)));
  }
  @Patch("tax-rates/:id") @RequirePermissions("finance.tax.manage") updateTax(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: TaxRateDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.updateTaxRate(p, id, dto, this.meta(r)));
  }

  @Get("invoices") @RequirePermissions("finance.invoices.read") invoices(
    @CurrentPrincipal() p: Principal,
    @Query() q: InvoiceQueryDto,
  ) {
    return this.list(this.finance.listInvoices(p, q));
  }
  @Get("invoices/:id") @RequirePermissions("finance.invoices.read") invoice(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.finance.invoice(p, id));
  }
  @Post("invoices") @RequirePermissions("finance.invoices.manage") createInvoice(
    @CurrentPrincipal() p: Principal,
    @Body() dto: InvoiceDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.createInvoice(p, dto, this.meta(r)));
  }
  @Patch("invoices/:id") @RequirePermissions("finance.invoices.manage") updateInvoice(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: InvoiceDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.updateInvoice(p, id, dto, this.meta(r)));
  }
  @Post("invoices/:id/issue") @RequirePermissions("finance.invoices.issue") issueInvoice(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.issueInvoice(p, id, this.meta(r)));
  }
  @Post("invoices/:id/cancel") @RequirePermissions("finance.invoices.cancel") cancelInvoice(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReasonDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.cancelInvoice(p, id, dto.reason, this.meta(r)));
  }

  @Get("payments") @RequirePermissions("finance.payments.read") payments(
    @CurrentPrincipal() p: Principal,
    @Query() q: PaymentQueryDto,
  ) {
    return this.list(this.finance.listPayments(p, q));
  }
  @Post("payments") @RequirePermissions("finance.payments.manage") payment(
    @CurrentPrincipal() p: Principal,
    @Body() dto: PaymentDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.recordPayment(p, dto, this.meta(r)));
  }
  @Post("payments/:id/void") @RequirePermissions("finance.payments.void") voidPayment(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReasonDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.voidPayment(p, id, dto.reason, this.meta(r)));
  }

  @Get("expenses") @RequirePermissions("finance.expenses.read") expenses(
    @CurrentPrincipal() p: Principal,
    @Query() q: ExpenseQueryDto,
  ) {
    return this.list(this.finance.listExpenses(p, q));
  }
  @Get("expenses/:id") @RequirePermissions("finance.expenses.read") expense(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.finance.expense(p, id));
  }
  @Post("expenses") @RequirePermissions("finance.expenses.manage") createExpense(
    @CurrentPrincipal() p: Principal,
    @Body() dto: ExpenseDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.createExpense(p, dto, this.meta(r)));
  }
  @Patch("expenses/:id") @RequirePermissions("finance.expenses.manage") updateExpense(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ExpenseDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.updateExpense(p, id, dto, this.meta(r)));
  }
  @Post("expenses/:id/submit") @RequirePermissions("finance.expenses.manage") submitExpense(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.transitionExpense(p, id, "submit", undefined, this.meta(r)));
  }
  @Post("expenses/:id/approve") @RequirePermissions("finance.expenses.approve") approveExpense(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.transitionExpense(p, id, "approve", undefined, this.meta(r)));
  }
  @Post("expenses/:id/reject") @RequirePermissions("finance.expenses.approve") rejectExpense(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReasonDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.transitionExpense(p, id, "reject", dto.reason, this.meta(r)));
  }
  @Post("expenses/:id/cancel") @RequirePermissions("finance.expenses.manage") cancelExpense(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReasonDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.transitionExpense(p, id, "cancel", dto.reason, this.meta(r)));
  }

  @Get("receivables") @RequirePermissions("finance.invoices.read") receivables(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.finance.receivables(p));
  }
  @Get("payables") @RequirePermissions("finance.expenses.read") payables(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.finance.payables(p));
  }
  @Get("gst/summary") @RequirePermissions("finance.gst.read") gstSummary(
    @CurrentPrincipal() p: Principal,
    @Query() q: DateRangeDto,
  ) {
    return this.ok(this.finance.gstSummary(p, q));
  }
  @Get("gst/register") @RequirePermissions("finance.gst.read") gstRegister(
    @CurrentPrincipal() p: Principal,
    @Query() q: DateRangeDto,
  ) {
    return this.ok(this.finance.gstRegister(p, q));
  }

  @Get("ledger/accounts") @RequirePermissions("finance.ledger.read") accounts(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.finance.accounts(p));
  }
  @Post("ledger/accounts") @RequirePermissions("finance.ledger.manage") createAccount(
    @CurrentPrincipal() p: Principal,
    @Body() dto: LedgerAccountDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.createAccount(p, dto, this.meta(r)));
  }
  @Patch("ledger/accounts/:id") @RequirePermissions("finance.ledger.manage") updateAccount(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LedgerAccountDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.updateAccount(p, id, dto, this.meta(r)));
  }
  @Get("journals") @RequirePermissions("finance.ledger.read") journals(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.finance.journals(p));
  }
  @Get("journals/:id") @RequirePermissions("finance.ledger.read") journal(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.finance.journal(p, id));
  }
  @Post("journals") @RequirePermissions("finance.ledger.manage") createJournal(
    @CurrentPrincipal() p: Principal,
    @Body() dto: JournalDto,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.createJournal(p, dto, this.meta(r)));
  }
  @Post("journals/:id/post") @RequirePermissions("finance.ledger.post") postJournal(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() r: Request,
  ) {
    return this.ok(this.finance.postJournal(p, id, this.meta(r)));
  }
}
