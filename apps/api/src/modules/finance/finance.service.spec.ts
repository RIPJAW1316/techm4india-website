import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { DivisionCode, VoucherType, AccountType } from '@prisma/client';
import { FinanceIntegrationService } from '../hrms/finance-integration.service';

describe('FinanceService', () => {
  let service: FinanceService;


  const mockFinanceIntegration = {
    getApprovedClaimsForFinance: jest.fn(),
    settleExpenseClaim: jest.fn(),
    getFinalizedPayrollSummary: jest.fn(),
  };
  const mockPrismaService = {
    account: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    journalEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(10),
      create: jest.fn(),
      update: jest.fn(),
    },
    journalLineItem: {
      findMany: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(5),
      create: jest.fn(),
      update: jest.fn(),
    },
    vendor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(3),
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      count: jest.fn().mockResolvedValue(2),
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FinanceIntegrationService, useValue: mockFinanceIntegration },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    jest.clearAllMocks();
  });

  describe('Double-Entry Balancing Invariant', () => {
    it('should throw BadRequestException when debits and credits do not balance', async () => {
      const unbalancedEntry = {
        date: '2026-10-23',
        voucherType: VoucherType.JOURNAL,
        narration: 'Unbalanced entry test',
        division: DivisionCode.TECHM4_SOLUTIONS,
        lineItems: [
          { accountId: 'acc-1', debitAmount: 50000, creditAmount: 0 },
          { accountId: 'acc-2', debitAmount: 0, creditAmount: 45000 }, // Deficit of 5000
        ],
      };

      await expect(service.createJournalEntry(unbalancedEntry)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept and create journal entry when debits and credits balance', async () => {
      const balancedEntry = {
        date: '2026-10-23',
        voucherType: VoucherType.JOURNAL,
        narration: 'Balanced operational entry',
        division: DivisionCode.TECHM4_SOLUTIONS,
        lineItems: [
          { accountId: 'acc-1', debitAmount: 50000, creditAmount: 0 },
          { accountId: 'acc-2', debitAmount: 0, creditAmount: 50000 },
        ],
      };

      mockPrismaService.journalEntry.create.mockResolvedValue({
        id: 'jv-1',
        entryNumber: 'JV-2026-00011',
        totalDebit: 50000,
        totalCredit: 50000,
      });

      const result = await service.createJournalEntry(balancedEntry);
      expect(result).toBeDefined();
      expect(mockPrismaService.journalEntry.create).toHaveBeenCalled();
    });
  });

  describe('Indian GST Intra-State vs Inter-State Calculation', () => {
    it('should apply CGST + SGST (9% + 9%) for Intra-State (Telangana: 36) customer', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({
        id: 'cust-ts',
        name: 'Hyderabad STEM Academy',
        stateCode: '36', // Telangana
      });

      mockPrismaService.invoice.create.mockImplementation((args) => args.data);

      const invoiceDto = {
        customerId: 'cust-ts',
        type: 'B2B' as any,
        issueDate: '2026-10-23',
        dueDate: '2026-11-23',
        division: DivisionCode.TECHM4_SCHOOLS,
        items: [
          {
            description: 'STEM Tinkering Lab Kit',
            hsnSacCode: '9992',
            quantity: 1,
            unitPrice: 100000,
            gstRate: 18,
          },
        ],
      };

      const result = await service.createInvoice(invoiceDto);
      expect(result.cgst).toBe(9000);
      expect(result.sgst).toBe(9000);
      expect(result.igst).toBe(0);
      expect(result.totalAmount).toBe(118000);
    });

    it('should apply full IGST (18%) for Inter-State (e.g. Karnataka: 29) customer', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({
        id: 'cust-ka',
        name: 'Bengaluru Tech Institute',
        stateCode: '29', // Karnataka
      });

      mockPrismaService.invoice.create.mockImplementation((args) => args.data);

      const invoiceDto = {
        customerId: 'cust-ka',
        type: 'B2B' as any,
        issueDate: '2026-10-23',
        dueDate: '2026-11-23',
        division: DivisionCode.TECHM4_ENGINEERING,
        items: [
          {
            description: 'COE Lab Setup & Faculty Enablement',
            hsnSacCode: '9983',
            quantity: 1,
            unitPrice: 100000,
            gstRate: 18,
          },
        ],
      };

      const result = await service.createInvoice(invoiceDto);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.igst).toBe(18000);
      expect(result.totalAmount).toBe(118000);
    });
  });

  describe('TDS Statutory Deduction & Approval Tiering', () => {
    it('should calculate 2% TDS under Section 194C for contractor bill and set Tier 2 approval', async () => {
      mockPrismaService.expense.create.mockImplementation((args) => args.data);

      const expenseDto = {
        category: 'TRAINING_MATERIAL',
        division: DivisionCode.TECHM4_SCHOOLS,
        description: 'Robotics kits components manufacturing vendor',
        grossAmount: 50000,
        tdsSection: 'SEC_194C' as any,
        tdsRate: 2.0,
      };

      const result = await service.createExpense(expenseDto);
      expect(result.grossAmount).toBe(50000);
      expect(result.tdsAmount).toBe(1000); // 2% of 50,000
      expect(result.netPayable).toBe(49000);
      expect(result.approvalLevel).toBe(2); // 25,000 - 100,000 is Tier 2
    });

    it('should set Tier 3 approval for bills above ₹1,00,000', async () => {
      mockPrismaService.expense.create.mockImplementation((args) => args.data);

      const highExpenseDto = {
        category: 'HARDWARE',
        division: DivisionCode.TECHM4_SPACE,
        description: 'Satellite ground station tracking dish and transceivers',
        grossAmount: 350000,
      };

      const result = await service.createExpense(highExpenseDto);
      expect(result.approvalLevel).toBe(3); // > 100,000 is Tier 3
    });
  });

  describe('Cross-Domain HRMS Integration (Payroll Accrual & Claims)', () => {
    it('should settle an approved employee claim and post cash disbursement in GL', async () => {
      mockFinanceIntegration.settleExpenseClaim.mockResolvedValue({
        id: 'clm-1',
        claimNumber: 'CLM-2026-004',
        status: 'SETTLED',
        totalAmount: 3200,
        alreadySettled: false,
      });

      mockPrismaService.account.findUnique.mockResolvedValue({
        id: 'acc-reimb',
        code: '5050',
        name: 'Employee Expense Reimbursements',
        type: AccountType.EXPENSE,
      });

      mockPrismaService.journalEntry.create.mockResolvedValue({
        id: 'jv-reimb-1',
        entryNumber: 'JV-2026-00012',
      });

      const res = await service.settleHrmsExpenseClaim('clm-1', 'fin-officer-1', {
        paymentMethod: 'NEFT',
        notes: 'Monthly corporate conveyance payout',
      });

      expect(res.status).toBe('SETTLED');
      expect(res.journalEntryNumber).toBe('JV-2026-00012');
      expect(mockFinanceIntegration.settleExpenseClaim).toHaveBeenCalled();
      expect(mockPrismaService.account.update).toHaveBeenCalledTimes(2);
    });

    it('should accrue finalized payroll run into balanced GL journal voucher', async () => {
      mockFinanceIntegration.getFinalizedPayrollSummary.mockResolvedValue({
        period: { id: 'p-1', month: 10, year: 2026 },
        headcount: 5,
        totals: {
          grossSalary: 500000,
          netPayable: 450000,
          totalEmployeeDeductions: 50000,
        },
        statutoryLiabilities: {
          employerPf: 25000,
          totalPfRemittance: 50000,
          professionalTaxPayable: 1000,
          tdsWithholdingPayable: 24000,
        },
      });

      mockPrismaService.account.findUnique.mockResolvedValue({
        id: 'acc-gen',
        type: AccountType.EXPENSE,
      });

      mockPrismaService.journalEntry.create.mockResolvedValue({
        id: 'jv-payroll-1',
        entryNumber: 'JV-PAYROLL-2026-10',
        totalDebit: 525000,
        totalCredit: 525000,
      });

      const res = await service.accruePayrollToLedger('p-1', 'fin-officer-1');

      expect(res.success).toBe(true);
      expect(res.journalEntry.entryNumber).toBe('JV-PAYROLL-2026-10');
      expect(res.journalEntry.totalDebit).toBe(525000);
      expect(res.journalEntry.totalCredit).toBe(525000);
    });
  });
});
