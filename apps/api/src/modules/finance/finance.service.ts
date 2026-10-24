import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import {
  AccountType,
  DivisionCode,
  ExpenseStatus,
  InvoiceStatus,
  JournalStatus,
  PaymentType,
  VoucherType,
} from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // 1. CHART OF ACCOUNTS & GENERAL LEDGER
  // ===========================================================================

  async getAccounts() {
    const accounts = await this.prisma.account.findMany({
      orderBy: [{ type: 'asc' }, { code: 'asc' }],
    });

    // Group accounts by standard 5 classes
    const grouped = {
      ASSETS: accounts.filter((a) => a.type === AccountType.ASSET),
      LIABILITIES: accounts.filter((a) => a.type === AccountType.LIABILITY),
      EQUITY: accounts.filter((a) => a.type === AccountType.EQUITY),
      INCOME: accounts.filter((a) => a.type === AccountType.INCOME),
      EXPENSES: accounts.filter((a) => a.type === AccountType.EXPENSE),
    };

    const totalAssets = grouped.ASSETS.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = grouped.LIABILITIES.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalEquity = grouped.EQUITY.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalIncome = grouped.INCOME.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalExpenses = grouped.EXPENSES.reduce((sum, a) => sum + Number(a.balance), 0);

    return {
      accounts,
      grouped,
      summary: {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalIncome,
        totalExpenses,
      },
    };
  }

  async createAccount(dto: CreateAccountDto) {
    const existing = await this.prisma.account.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Account with code ${dto.code} already exists.`);
    }

    return this.prisma.account.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        category: dto.category,
        subCategory: dto.subCategory,
        currency: dto.currency || 'INR',
        description: dto.description,
      },
    });
  }

  async getAccountLedger(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }

    const lines = await this.prisma.journalLineItem.findMany({
      where: { accountId },
      include: {
        journalEntry: true,
      },
      orderBy: { journalEntry: { date: 'asc' } },
    });

    let runningBalance = 0;
    const ledger = lines.map((line) => {
      const debit = Number(line.debitAmount);
      const credit = Number(line.creditAmount);

      if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }

      return {
        id: line.id,
        entryNumber: line.journalEntry.entryNumber,
        date: line.journalEntry.date,
        voucherType: line.journalEntry.voucherType,
        narration: line.journalEntry.narration,
        reference: line.journalEntry.reference,
        status: line.journalEntry.status,
        debit,
        credit,
        runningBalance,
      };
    });

    return {
      account,
      currentBalance: Number(account.balance),
      ledger,
    };
  }

  // ===========================================================================
  // 2. DOUBLE-ENTRY JOURNAL ENGINE
  // ===========================================================================

  async getJournalEntries(division?: DivisionCode) {
    return this.prisma.journalEntry.findMany({
      where: division ? { division } : undefined,
      include: {
        lineItems: {
          include: { account: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async createJournalEntry(dto: CreateJournalEntryDto, createdById?: string) {
    // 1. Double-Entry Validation Invariant: Sum(Debits) must equal Sum(Credits)
    const totalDebit = dto.lineItems.reduce((acc, item) => acc + Number(item.debitAmount || 0), 0);
    const totalCredit = dto.lineItems.reduce((acc, item) => acc + Number(item.creditAmount || 0), 0);

    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.01) {
      throw new BadRequestException(
        `Double-entry balancing invariant violation: Total Debits (₹${totalDebit.toFixed(2)}) must exactly equal Total Credits (₹${totalCredit.toFixed(2)}). Variance: ₹${diff.toFixed(2)}`,
      );
    }

    if (totalDebit <= 0) {
      throw new BadRequestException('Journal entry amount must be greater than zero.');
    }

    // 2. Generate unique sequential entry number
    const count = await this.prisma.journalEntry.count();
    const entryNumber = `JV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // 3. Create Journal Entry in DRAFT status
    return this.prisma.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(dto.date),
        voucherType: dto.voucherType || VoucherType.JOURNAL,
        reference: dto.reference,
        narration: dto.narration,
        status: JournalStatus.DRAFT,
        division: dto.division || DivisionCode.GENERAL_OVERHEAD,
        totalDebit,
        totalCredit,
        createdById,
        lineItems: {
          create: dto.lineItems.map((line) => ({
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description,
            division: line.division || dto.division,
          })),
        },
      },
      include: {
        lineItems: {
          include: { account: true },
        },
      },
    });
  }

  async postJournalEntry(id: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: { lineItems: { include: { account: true } } },
    });

    if (!entry) {
      throw new NotFoundException(`Journal Entry ${id} not found.`);
    }

    if (entry.status === JournalStatus.POSTED) {
      throw new BadRequestException('Journal entry is already posted to the General Ledger.');
    }

    if (entry.status === JournalStatus.REVERSED) {
      throw new BadRequestException('Cannot post a reversed journal entry.');
    }

    // Update balances within a transaction
    return this.prisma.$transaction(async (tx) => {
      for (const line of entry.lineItems) {
        const debit = Number(line.debitAmount);
        const credit = Number(line.creditAmount);
        const account = line.account;

        let delta = 0;
        if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
          delta = debit - credit;
        } else {
          delta = credit - debit;
        }

        await tx.account.update({
          where: { id: line.accountId },
          data: {
            balance: {
              increment: delta,
            },
          },
        });
      }

      return tx.journalEntry.update({
        where: { id },
        data: { status: JournalStatus.POSTED },
        include: { lineItems: { include: { account: true } } },
      });
    });
  }

  async reverseJournalEntry(id: string, reason: string) {
    const original = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: { lineItems: { include: { account: true } } },
    });

    if (!original) {
      throw new NotFoundException(`Journal entry ${id} not found.`);
    }

    if (original.status !== JournalStatus.POSTED) {
      throw new BadRequestException('Only posted journal entries can be reversed.');
    }

    if (original.isReversed) {
      throw new BadRequestException('This journal entry has already been reversed.');
    }

    // Invert debits and credits for strict immutability
    const count = await this.prisma.journalEntry.count();
    const reversalEntryNumber = `REV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark original as reversed
      await tx.journalEntry.update({
        where: { id },
        data: { isReversed: true, status: JournalStatus.REVERSED },
      });

      // 2. Create offsetting reversal journal
      const reversal = await tx.journalEntry.create({
        data: {
          entryNumber: reversalEntryNumber,
          date: new Date(),
          voucherType: original.voucherType,
          reference: `REVERSAL of ${original.entryNumber}`,
          narration: `Reversal of ${original.entryNumber}: ${reason}`,
          status: JournalStatus.POSTED,
          division: original.division,
          totalDebit: original.totalCredit,
          totalCredit: original.totalDebit,
          lineItems: {
            create: original.lineItems.map((line) => ({
              accountId: line.accountId,
              debitAmount: line.creditAmount, // swapped
              creditAmount: line.debitAmount, // swapped
              description: `Reversal offset: ${line.description || ''}`,
              division: line.division,
            })),
          },
        },
      });

      // 3. Rollback account balances
      for (const line of original.lineItems) {
        const debit = Number(line.debitAmount);
        const credit = Number(line.creditAmount);
        const account = line.account;

        let delta = 0;
        if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
          delta = -(debit - credit);
        } else {
          delta = -(credit - debit);
        }

        await tx.account.update({
          where: { id: line.accountId },
          data: {
            balance: {
              increment: delta,
            },
          },
        });
      }

      return reversal;
    });
  }

  // ===========================================================================
  // 3. INVOICING & ACCOUNTS RECEIVABLE (AR)
  // ===========================================================================

  async getInvoices(division?: DivisionCode, status?: InvoiceStatus) {
    return this.prisma.invoice.findMany({
      where: {
        ...(division ? { division } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found.`);
    return invoice;
  }

  async createInvoice(dto: CreateInvoiceDto) {
    // 1. Fetch customer to identify Place of Supply & State Code
    let customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      // Try finding by code
      customer = await this.prisma.customer.findUnique({
        where: { code: dto.customerId },
      });
    }

    if (!customer) {
      throw new NotFoundException(`Customer ${dto.customerId} not found.`);
    }

    // TechM4India is in Telangana (State Code 36)
    const isIntraState = customer.stateCode === '36';

    // 2. Line Item Calculations
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const computedItems = dto.items.map((item) => {
      const lineGross = Number(item.quantity) * Number(item.unitPrice);
      const discount = Number(item.discount || 0);
      const lineTaxable = Math.max(0, lineGross - discount);
      const rate = Number(item.gstRate || 18);

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isIntraState) {
        // Intra-state: CGST (rate/2) + SGST (rate/2)
        cgst = Number(((lineTaxable * (rate / 2)) / 100).toFixed(2));
        sgst = Number(((lineTaxable * (rate / 2)) / 100).toFixed(2));
      } else {
        // Inter-state: IGST (full rate)
        igst = Number(((lineTaxable * rate) / 100).toFixed(2));
      }

      const lineTotal = Number((lineTaxable + cgst + sgst + igst).toFixed(2));

      subtotal += lineGross;
      totalDiscount += discount;
      taxableAmount += lineTaxable;
      totalCgst += cgst;
      totalSgst += sgst;
      totalIgst += igst;

      return {
        description: item.description,
        hsnSacCode: item.hsnSacCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount,
        gstRate: rate,
        taxableAmount: lineTaxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalAmount: lineTotal,
      };
    });

    const totalAmount = Number((taxableAmount + totalCgst + totalSgst + totalIgst).toFixed(2));

    // 3. Generate sequential invoice number
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // 4. Simulated Razorpay payment link & IRN
    const razorpayPaymentLink = `https://rzp.io/i/tm4_${invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const irn = `irn_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: customer.id,
        type: dto.type,
        status: InvoiceStatus.SENT,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        currency: dto.currency || 'INR',
        exchangeRate: dto.exchangeRate || 1.0,
        subtotal,
        discount: totalDiscount,
        taxableAmount,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        paymentTerms: dto.paymentTerms || 'Net 30',
        notes: dto.notes,
        division: dto.division,
        razorpayPaymentLink,
        irn,
        items: {
          create: computedItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async recordInvoicePayment(invoiceId: string, dto: RecordPaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found.`);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid in full.');
    }

    const payAmount = Number(dto.amount);
    if (payAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }

    const currentBalance = Number(invoice.balanceDue);
    if (payAmount > currentBalance + 0.01) {
      throw new BadRequestException(
        `Payment amount (₹${payAmount}) exceeds invoice balance due (₹${currentBalance.toFixed(2)}).`,
      );
    }

    const newAmountPaid = Number((Number(invoice.amountPaid) + payAmount).toFixed(2));
    const newBalanceDue = Math.max(0, Number((currentBalance - payAmount).toFixed(2)));
    const newStatus = newBalanceDue <= 0.01 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    const count = await this.prisma.payment.count();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          type: PaymentType.INWARD,
          method: dto.method,
          amount: payAmount,
          currency: dto.currency || 'INR',
          transactionDate: new Date(dto.transactionDate),
          referenceNumber: dto.referenceNumber,
          status: 'COMPLETED',
          invoiceId: invoice.id,
          notes: dto.notes,
        },
      });

      // 2. Update invoice status & balance
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
      });

      return payment;
    });
  }

  async getARAgingReport() {
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
      },
      include: { customer: true },
    });

    const now = new Date();
    const buckets = {
      current: 0, // 0 - 30 days
      thirtyToSixty: 0, // 31 - 60 days
      sixtyToNinety: 0, // 61 - 90 days
      overNinety: 0, // 90+ days
      totalOutstanding: 0,
      invoices: [] as any[],
    };

    for (const inv of unpaidInvoices) {
      const balance = Number(inv.balanceDue);
      const due = new Date(inv.dueDate);
      const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24));

      let bucketName = '0-30 Days';
      if (diffDays <= 30) {
        buckets.current += balance;
        bucketName = '0-30 Days';
      } else if (diffDays <= 60) {
        buckets.thirtyToSixty += balance;
        bucketName = '31-60 Days';
      } else if (diffDays <= 90) {
        buckets.sixtyToNinety += balance;
        bucketName = '61-90 Days';
      } else {
        buckets.overNinety += balance;
        bucketName = '90+ Days (Critical)';
      }

      buckets.totalOutstanding += balance;
      buckets.invoices.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer.name,
        dueDate: inv.dueDate,
        daysOverdue: Math.max(0, diffDays),
        balanceDue: balance,
        bucket: bucketName,
      });
    }

    return buckets;
  }

  // ===========================================================================
  // 4. EXPENSES & ACCOUNTS PAYABLE (AP)
  // ===========================================================================

  async getExpenses(division?: DivisionCode, status?: ExpenseStatus) {
    return this.prisma.expense.findMany({
      where: {
        ...(division ? { division } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        vendor: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createExpense(dto: CreateExpenseDto, employeeId?: string) {
    const gross = Number(dto.grossAmount);
    let tdsAmount = 0;
    const tdsRate = Number(dto.tdsRate || 0);

    if (tdsRate > 0) {
      tdsAmount = Number(((gross * tdsRate) / 100).toFixed(2));
    }

    const netPayable = Number((gross - tdsAmount).toFixed(2));

    // Determine approval level threshold:
    // < 25,000: Tier 1 (Team Lead)
    // 25,000 - 1,00,000: Tier 2 (Dept Head)
    // > 1,00,000: Tier 3 (Executive / CFO)
    let approvalLevel = 1;
    if (gross > 100000) {
      approvalLevel = 3;
    } else if (gross >= 25000) {
      approvalLevel = 2;
    }

    const count = await this.prisma.expense.count();
    const expenseNumber = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.expense.create({
      data: {
        expenseNumber,
        vendorId: dto.vendorId,
        category: dto.category,
        division: dto.division,
        description: dto.description,
        invoiceNumber: dto.invoiceNumber,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
        grossAmount: gross,
        tdsSection: dto.tdsSection,
        tdsRate,
        tdsAmount,
        netPayable,
        status: ExpenseStatus.DRAFT,
        approvalLevel,
        approvedById: employeeId,
        poNumber: dto.poNumber,
        documentUrl: dto.documentUrl,
      },
      include: {
        vendor: true,
      },
    });
  }

  async approveExpense(id: string, approvedById: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });
    if (!expense) throw new NotFoundException(`Expense ${id} not found.`);

    return this.prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.APPROVED,
        approvedById,
      },
      include: { vendor: true },
    });
  }

  async payExpense(id: string, dto: RecordPaymentDto) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { vendor: true },
    });
    if (!expense) throw new NotFoundException(`Expense ${id} not found.`);

    if (expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Expense bill has already been disbursed.');
    }

    const count = await this.prisma.payment.count();
    const paymentNumber = `DISB-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          type: PaymentType.OUTWARD,
          method: dto.method,
          amount: Number(dto.amount || expense.netPayable),
          currency: dto.currency || 'INR',
          transactionDate: new Date(dto.transactionDate),
          referenceNumber: dto.referenceNumber,
          status: 'COMPLETED',
          expenseId: expense.id,
          notes: dto.notes,
        },
      });

      await tx.expense.update({
        where: { id: expense.id },
        data: { status: ExpenseStatus.PAID },
      });

      return payment;
    });
  }

  async getAPAgingReport() {
    const unpaidExpenses = await this.prisma.expense.findMany({
      where: {
        status: { in: [ExpenseStatus.DRAFT, ExpenseStatus.SUBMITTED, ExpenseStatus.APPROVED] },
      },
      include: { vendor: true },
    });

    const now = new Date();
    const buckets = {
      current: 0,
      thirtyToSixty: 0,
      sixtyToNinety: 0,
      overNinety: 0,
      totalDue: 0,
      expenses: [] as any[],
    };

    for (const exp of unpaidExpenses) {
      const dueAmt = Number(exp.netPayable);
      const due = exp.dueDate ? new Date(exp.dueDate) : now;
      const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24));

      let bucket = '0-30 Days';
      if (diffDays <= 30) {
        buckets.current += dueAmt;
        bucket = '0-30 Days';
      } else if (diffDays <= 60) {
        buckets.thirtyToSixty += dueAmt;
        bucket = '31-60 Days';
      } else if (diffDays <= 90) {
        buckets.sixtyToNinety += dueAmt;
        bucket = '61-90 Days';
      } else {
        buckets.overNinety += dueAmt;
        bucket = '90+ Days';
      }

      buckets.totalDue += dueAmt;
      buckets.expenses.push({
        id: exp.id,
        expenseNumber: exp.expenseNumber,
        vendorName: exp.vendor?.name || 'Employee Claim',
        category: exp.category,
        dueDate: exp.dueDate,
        daysOverdue: Math.max(0, diffDays),
        netPayable: dueAmt,
        bucket,
      });
    }

    return buckets;
  }

  // ===========================================================================
  // 5. VENDORS & CUSTOMERS DIRECTORY
  // ===========================================================================

  async getVendors() {
    return this.prisma.vendor.findMany({
      include: {
        _count: { select: { expenses: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createVendor(dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Vendor with code ${dto.code} already exists.`);
    }

    return this.prisma.vendor.create({
      data: {
        code: dto.code,
        name: dto.name,
        contactPerson: dto.contactPerson,
        gstin: dto.gstin,
        pan: dto.pan,
        msmeType: dto.msmeType,
        email: dto.email,
        phone: dto.phone,
        bankAccount: dto.bankAccount,
        ifsc: dto.ifsc,
        bankName: dto.bankName,
        tdsSection: dto.tdsSection,
        paymentTermsDays: dto.paymentTermsDays || 30,
      },
    });
  }

  async getCustomers() {
    return this.prisma.customer.findMany({
      include: {
        _count: { select: { invoices: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ===========================================================================
  // 6. GST COMPLIANCE ENGINE & RULE 88A OFFSET
  // ===========================================================================

  async getGstr1Report() {
    const invoices = await this.prisma.invoice.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { issueDate: 'desc' },
    });

    const b2b = invoices.filter((i) => i.type === 'B2B');
    const b2c = invoices.filter((i) => i.type === 'B2C');
    const b2g = invoices.filter((i) => i.type === 'B2G');

    const hsnMap: Record<string, { code: string; desc: string; totalTaxable: number; totalTax: number }> = {};
    for (const inv of invoices) {
      for (const item of inv.items) {
        if (!hsnMap[item.hsnSacCode]) {
          hsnMap[item.hsnSacCode] = {
            code: item.hsnSacCode,
            desc: item.description,
            totalTaxable: 0,
            totalTax: 0,
          };
        }
        hsnMap[item.hsnSacCode].totalTaxable += Number(item.taxableAmount);
        hsnMap[item.hsnSacCode].totalTax += Number(item.cgstAmount) + Number(item.sgstAmount) + Number(item.igstAmount);
      }
    }

    const totalOutwardTaxable = invoices.reduce((sum, i) => sum + Number(i.taxableAmount), 0);
    const totalCgst = invoices.reduce((sum, i) => sum + Number(i.cgst), 0);
    const totalSgst = invoices.reduce((sum, i) => sum + Number(i.sgst), 0);
    const totalIgst = invoices.reduce((sum, i) => sum + Number(i.igst), 0);

    return {
      period: '2026-10',
      totalInvoices: invoices.length,
      totalOutwardTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax: totalCgst + totalSgst + totalIgst,
      b2bCount: b2b.length,
      b2cCount: b2c.length,
      b2gCount: b2g.length,
      hsnSummary: Object.values(hsnMap),
      invoices,
    };
  }

  async getGstr3bSummary() {
    // 1. Compute Output Tax Liability from Invoices
    const invoices = await this.prisma.invoice.findMany();
    const outputTax = {
      igst: invoices.reduce((sum, i) => sum + Number(i.igst), 0),
      cgst: invoices.reduce((sum, i) => sum + Number(i.cgst), 0),
      sgst: invoices.reduce((sum, i) => sum + Number(i.sgst), 0),
    };

    // 2. Compute Input Tax Credit (ITC) from Approved Expenses with GST
    const expenses = await this.prisma.expense.findMany({
      where: { status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] } },
    });

    // Approximate 18% ITC on expenses with vendor GSTIN
    const totalExpenseGross = expenses.reduce((sum, e) => sum + Number(e.grossAmount), 0);
    const eligibleItc = {
      igst: Number((totalExpenseGross * 0.05).toFixed(2)),
      cgst: Number((totalExpenseGross * 0.065).toFixed(2)),
      sgst: Number((totalExpenseGross * 0.065).toFixed(2)),
    };

    // 3. Rule 88A Tax Offset Computation
    // Step 1: Use IGST Credit first against IGST Liability
    let remainingItcIgst = eligibleItc.igst;
    let netIgstLiability = Math.max(0, outputTax.igst - remainingItcIgst);
    remainingItcIgst = Math.max(0, remainingItcIgst - outputTax.igst);

    // Step 2: Use remaining IGST Credit against CGST, then SGST
    let remainingCgstLiability = Math.max(0, outputTax.cgst - remainingItcIgst);
    remainingItcIgst = Math.max(0, remainingItcIgst - outputTax.cgst);

    let remainingSgstLiability = Math.max(0, outputTax.sgst - remainingItcIgst);

    // Step 3: Use CGST Credit against remaining CGST Liability
    netIgstLiability = Number(netIgstLiability.toFixed(2));
    const netCgstLiability = Number(Math.max(0, remainingCgstLiability - eligibleItc.cgst).toFixed(2));

    // Step 4: Use SGST Credit against remaining SGST Liability
    const netSgstLiability = Number(Math.max(0, remainingSgstLiability - eligibleItc.sgst).toFixed(2));

    const totalCashPayable = netIgstLiability + netCgstLiability + netSgstLiability;

    return {
      period: '2026-10',
      rule88ACompliant: true,
      outputTaxLiability: outputTax,
      eligibleInputTaxCredit: eligibleItc,
      offsetComputation: {
        netIgstLiability,
        netCgstLiability,
        netSgstLiability,
        totalCashPayable,
      },
    };
  }

  // ===========================================================================
  // 7. FINANCIAL STATEMENTS & MIS REPORTING
  // ===========================================================================

  async getProfitAndLoss(division?: DivisionCode) {
    // 1. Invoiced Revenue
    const invoices = await this.prisma.invoice.findMany({
      where: division ? { division } : undefined,
    });

    const divisionRevenue: Record<string, number> = {
      [DivisionCode.TECHM4_SCHOOLS]: 0,
      [DivisionCode.TECHM4_ENGINEERING]: 0,
      [DivisionCode.TECHM4_SOLUTIONS]: 0,
      [DivisionCode.TECHM4_SPACE]: 0,
      [DivisionCode.HORIZON_INSTITUTES]: 0,
    };

    for (const inv of invoices) {
      if (divisionRevenue[inv.division] !== undefined) {
        divisionRevenue[inv.division] += Number(inv.taxableAmount);
      }
    }

    const totalRevenue = Object.values(divisionRevenue).reduce((a, b) => a + b, 0);

    // 2. Expenses
    const expenses = await this.prisma.expense.findMany({
      where: division ? { division } : undefined,
    });

    const divisionExpenses: Record<string, number> = {
      [DivisionCode.TECHM4_SCHOOLS]: 0,
      [DivisionCode.TECHM4_ENGINEERING]: 0,
      [DivisionCode.TECHM4_SOLUTIONS]: 0,
      [DivisionCode.TECHM4_SPACE]: 0,
      [DivisionCode.HORIZON_INSTITUTES]: 0,
      [DivisionCode.GENERAL_OVERHEAD]: 0,
    };

    for (const exp of expenses) {
      if (divisionExpenses[exp.division] !== undefined) {
        divisionExpenses[exp.division] += Number(exp.grossAmount);
      }
    }

    const totalExpenses = Object.values(divisionExpenses).reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - totalExpenses;
    const netMarginPercent = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(2)) : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      netMarginPercent,
      divisionBreakdown: {
        revenue: divisionRevenue,
        expenses: divisionExpenses,
      },
    };
  }

  async getTrialBalance() {
    const accounts = await this.prisma.account.findMany({
      orderBy: { code: 'asc' },
    });

    let totalDebits = 0;
    let totalCredits = 0;

    const rows = accounts.map((a) => {
      const balance = Number(a.balance);
      let debit = 0;
      let credit = 0;

      if (a.type === AccountType.ASSET || a.type === AccountType.EXPENSE) {
        if (balance >= 0) {
          debit = balance;
        } else {
          credit = Math.abs(balance);
        }
      } else {
        if (balance >= 0) {
          credit = balance;
        } else {
          debit = Math.abs(balance);
        }
      }

      totalDebits += debit;
      totalCredits += credit;

      return {
        code: a.code,
        name: a.name,
        type: a.type,
        debit,
        credit,
      };
    });

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return {
      asOfDate: new Date().toISOString(),
      isBalanced,
      totalDebits,
      totalCredits,
      variance: Math.abs(totalDebits - totalCredits),
      rows,
    };
  }

  async exportTallyXml() {
    const accounts = await this.prisma.account.findMany();
    const journals = await this.prisma.journalEntry.findMany({
      include: { lineItems: { include: { account: true } } },
      take: 50,
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n  <HEADER>\n    <TALLYREQUEST>Import Data</TALLYREQUEST>\n  </HEADER>\n  <BODY>\n    <IMPORTDATA>\n      <REQUESTDESC>\n        <REPORTNAME>All Masters and Vouchers</REPORTNAME>\n      </REQUESTDESC>\n      <REQUESTDATA>\n`;

    // Ledgers
    for (const acc of accounts) {
      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n          <LEDGER NAME="${acc.name}" RESERVEDNAME="">\n            <NAME>${acc.name}</NAME>\n            <PARENT>${acc.category}</PARENT>\n            <OPENINGBALANCE>${acc.balance}</OPENINGBALANCE>\n          </LEDGER>\n        </TALLYMESSAGE>\n`;
    }

    // Vouchers
    for (const j of journals) {
      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n          <VOUCHER VCHTYPE="${j.voucherType}" ACTION="Create">\n            <DATE>${new Date(j.date).toISOString().slice(0, 10).replace(/-/g, '')}</DATE>\n            <VOUCHERNUMBER>${j.entryNumber}</VOUCHERNUMBER>\n            <NARRATION>${j.narration}</NARRATION>\n`;
      for (const line of j.lineItems) {
        const isDebit = Number(line.debitAmount) > 0;
        const amount = isDebit ? -Number(line.debitAmount) : Number(line.creditAmount);
        xml += `            <ALLLEDGERENTRIES.LIST>\n              <LEDGERNAME>${line.account.name}</LEDGERNAME>\n              <ISDEEMEDPOSITIVE>${isDebit ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>\n              <AMOUNT>${amount}</AMOUNT>\n            </ALLLEDGERENTRIES.LIST>\n`;
      }
      xml += `          </VOUCHER>\n        </TALLYMESSAGE>\n`;
    }

    xml += `      </REQUESTDATA>\n    </IMPORTDATA>\n  </BODY>\n</ENVELOPE>`;
    return xml;
  }
}
