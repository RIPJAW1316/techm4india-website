import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { DivisionCode, InvoiceStatus } from '@prisma/client';

@ApiTags('Finance & Accounting')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ===========================================================================
  // Chart of Accounts
  // ===========================================================================

  @Get('accounts')
  @ApiOperation({ summary: 'List Chart of Accounts grouped by 5 root classes' })
  @ApiResponse({ status: 200, description: 'Hierarchical Chart of Accounts' })
  async getAccounts() {
    return this.financeService.getAccounts();
  }

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new Ledger Account in Chart of Accounts' })
  async createAccount(@Body() dto: CreateAccountDto) {
    return this.financeService.createAccount(dto);
  }

  @Get('accounts/:id/ledger')
  @ApiOperation({ summary: 'Get account ledger with running balance & audit trail' })
  async getAccountLedger(@Param('id') id: string) {
    return this.financeService.getAccountLedger(id);
  }

  // ===========================================================================
  // Double-Entry Journal Engine
  // ===========================================================================

  @Get('journal-entries')
  @ApiOperation({ summary: 'List journal entries with division filter' })
  @ApiQuery({ name: 'division', enum: DivisionCode, required: false })
  async getJournalEntries(@Query('division') division?: DivisionCode) {
    return this.financeService.getJournalEntries(division);
  }

  @Post('journal-entries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create double-entry journal voucher (Enforces balancing invariant)' })
  async createJournalEntry(@Body() dto: CreateJournalEntryDto) {
    return this.financeService.createJournalEntry(dto);
  }

  @Post('journal-entries/:id/post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Post journal entry to General Ledger & update balances' })
  async postJournalEntry(@Param('id') id: string) {
    return this.financeService.postJournalEntry(id);
  }

  @Post('journal-entries/:id/reverse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create immutable offsetting reversal journal entry' })
  async reverseJournalEntry(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.financeService.reverseJournalEntry(id, reason || 'User requested reversal');
  }

  // ===========================================================================
  // Invoicing & Receivables (AR)
  // ===========================================================================

  @Get('invoices')
  @ApiOperation({ summary: 'List all customer invoices' })
  @ApiQuery({ name: 'division', enum: DivisionCode, required: false })
  @ApiQuery({ name: 'status', enum: InvoiceStatus, required: false })
  async getInvoices(
    @Query('division') division?: DivisionCode,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.financeService.getInvoices(division, status);
  }

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate GST-compliant B2B/B2C/B2G invoice' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice details with items & payments' })
  async getInvoiceById(@Param('id') id: string) {
    return this.financeService.getInvoiceById(id);
  }

  @Post('invoices/:id/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record customer receipt against invoice' })
  async recordInvoicePayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.financeService.recordInvoicePayment(id, dto);
  }

  @Get('reports/ar-aging')
  @ApiOperation({ summary: 'Accounts Receivable (AR) 0-30, 31-60, 61-90, 90+ aging report' })
  async getARAgingReport() {
    return this.financeService.getARAgingReport();
  }

  // ===========================================================================
  // Expenses & Payables (AP)
  // ===========================================================================

  @Get('expenses')
  @ApiOperation({ summary: 'List vendor bills and employee expense claims' })
  @ApiQuery({ name: 'division', enum: DivisionCode, required: false })
  async getExpenses(@Query('division') division?: DivisionCode) {
    return this.financeService.getExpenses(division);
  }

  @Post('expenses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create vendor expense with automated TDS deduction' })
  async createExpense(@Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(dto);
  }

  @Post('expenses/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve expense based on multi-level threshold' })
  async approveExpense(
    @Param('id') id: string,
    @Body('approvedById') approvedById?: string,
  ) {
    return this.financeService.approveExpense(id, approvedById || 'SYSTEM_ADMIN');
  }

  @Post('expenses/:id/pay')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Disburse payment for approved vendor bill' })
  async payExpense(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.financeService.payExpense(id, dto);
  }

  @Get('reports/ap-aging')
  @ApiOperation({ summary: 'Accounts Payable (AP) aging report' })
  async getAPAgingReport() {
    return this.financeService.getAPAgingReport();
  }

  // ===========================================================================
  // Vendors & Customers
  // ===========================================================================

  @Get('vendors')
  @ApiOperation({ summary: 'List approved vendors' })
  async getVendors() {
    return this.financeService.getVendors();
  }

  @Post('vendors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new vendor with GSTIN and PAN' })
  async createVendor(@Body() dto: CreateVendorDto) {
    return this.financeService.createVendor(dto);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List registered institutional clients and customers' })
  async getCustomers() {
    return this.financeService.getCustomers();
  }

  // ===========================================================================
  // GST Compliance & Rule 88A
  // ===========================================================================

  @Get('gst/gstr-1')
  @ApiOperation({ summary: 'Outward supplies GSTR-1 summary report' })
  async getGstr1Report() {
    return this.financeService.getGstr1Report();
  }

  @Get('gst/gstr-3b')
  @ApiOperation({ summary: 'GSTR-3B tax summary with Rule 88A ITC offset order' })
  async getGstr3bSummary() {
    return this.financeService.getGstr3bSummary();
  }

  // ===========================================================================
  // MIS & Financial Statements
  // ===========================================================================

  @Get('reports/profit-loss')
  @ApiOperation({ summary: 'Real-time Profit & Loss statement by Division cost-centres' })
  @ApiQuery({ name: 'division', enum: DivisionCode, required: false })
  async getProfitAndLoss(@Query('division') division?: DivisionCode) {
    return this.financeService.getProfitAndLoss(division);
  }

  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Trial Balance verifying debit-credit balance invariant' })
  async getTrialBalance() {
    return this.financeService.getTrialBalance();
  }

  @Get('export/tally-xml')
  @Header('Content-Type', 'application/xml')
  @Header('Content-Disposition', 'attachment; filename="TechM4India_Tally_Export.xml"')
  @ApiOperation({ summary: 'Generate CA-ready Tally XML export for external audit' })
  async exportTallyXml() {
    return this.financeService.exportTallyXml();
  }
}
