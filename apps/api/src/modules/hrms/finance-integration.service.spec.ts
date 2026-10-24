import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { FinanceIntegrationService } from './finance-integration.service';
import { DocumentStorageService } from './document-storage.service';
import { PrismaService } from '../../database/prisma.service';

describe('FinanceIntegrationService & DocumentStorageService (Phase 6 Cross-Domain Engine)', () => {
  let financeService: FinanceIntegrationService;
  let storageService: DocumentStorageService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      expenseClaim: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payrollPeriod: {
        findUnique: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceIntegrationService,
        {
          provide: DocumentStorageService,
          useValue: {
            generatePresignedUpload: jest.fn(),
            generatePresignedDownload: jest.fn(),
            validateUploadRequest: jest.fn(),
          },
        },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    financeService = module.get<FinanceIntegrationService>(FinanceIntegrationService);
    storageService = module.get<DocumentStorageService>(DocumentStorageService);
  });

  describe('Idempotent Expense Claim Settlement', () => {
    it('should settle an APPROVED claim with batch reference and write audit log', async () => {
      const mockClaim = {
        id: 'claim-123',
        claimNumber: 'CLM-2026-001',
        status: 'APPROVED',
        totalAmount: 4500,
        settlementBatchRef: null,
      };

      prisma.expenseClaim.findUnique.mockResolvedValue(mockClaim);
      prisma.expenseClaim.update.mockResolvedValue({
        ...mockClaim,
        status: 'SETTLED',
        settlementBatchRef: 'BATCH-2026-10-A',
        reimbursementDate: new Date('2026-10-31'),
      });

      const res = await financeService.settleExpenseClaim('claim-123', 'finance-user-1', {
        batchReference: 'BATCH-2026-10-A',
        settlementDate: '2026-10-31',
        notes: 'Disbursed via corporate payment gateway',
      });

      expect(res.status).toBe('SETTLED');
      expect(res.alreadySettled).toBe(false);
      expect(prisma.expenseClaim.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'claim-123' },
          data: expect.objectContaining({ status: 'SETTLED', settlementBatchRef: 'BATCH-2026-10-A' }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should be idempotent: return existing record when retried with same batch reference', async () => {
      const alreadySettledClaim = {
        id: 'claim-123',
        claimNumber: 'CLM-2026-001',
        status: 'SETTLED',
        totalAmount: 4500,
        settlementBatchRef: 'BATCH-2026-10-A',
        reimbursementDate: new Date('2026-10-31'),
      };

      prisma.expenseClaim.findUnique.mockResolvedValue(alreadySettledClaim);

      const res = await financeService.settleExpenseClaim('claim-123', 'finance-user-1', {
        batchReference: 'BATCH-2026-10-A',
      });

      expect(res.alreadySettled).toBe(true);
      expect(res.claimNumber).toBe('CLM-2026-001');
      expect(prisma.expenseClaim.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate settlement attempt with different batch reference', async () => {
      const alreadySettledClaim = {
        id: 'claim-123',
        claimNumber: 'CLM-2026-001',
        status: 'SETTLED',
        totalAmount: 4500,
        settlementBatchRef: 'BATCH-FIRST-RUN',
      };

      prisma.expenseClaim.findUnique.mockResolvedValue(alreadySettledClaim);

      await expect(
        financeService.settleExpenseClaim('claim-123', 'finance-user-1', {
          batchReference: 'BATCH-SECOND-RUN-DUPLICATE',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject settling unapproved claims', async () => {
      const draftClaim = {
        id: 'claim-draft',
        status: 'SUBMITTED', // Not yet approved by HR
      };

      prisma.expenseClaim.findUnique.mockResolvedValue(draftClaim);

      await expect(
        financeService.settleExpenseClaim('claim-draft', 'finance-user-1', {
          batchReference: 'BATCH-TEST',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Payroll Period Summary for Ledger Accrual', () => {
    it('should generate balanced suggested journal entries and employer liabilities', async () => {
      const mockPeriod = {
        id: 'period-2026-10',
        month: 10,
        year: 2026,
        status: 'FINALIZED',
        totalGross: 200000,
        totalNet: 178800,
        totalDeductions: 21200,
        finalizedAt: new Date('2026-10-28'),
        payslips: [
          {
            grossEarnings: 100000,
            pfDeduction: 1800,
            ptDeduction: 200,
            esiDeduction: 0,
            taxDeduction: 8600,
            totalDeductions: 10600,
            netPay: 89400,
          },
          {
            grossEarnings: 100000,
            pfDeduction: 1800,
            ptDeduction: 200,
            esiDeduction: 0,
            taxDeduction: 8600,
            totalDeductions: 10600,
            netPay: 89400,
          },
        ],
      };

      prisma.payrollPeriod.findUnique.mockResolvedValue(mockPeriod);

      const summary = await financeService.getFinalizedPayrollSummary('period-2026-10');

      expect(summary.headcount).toBe(2);
      expect(summary.totals.grossSalary).toBe(200000);
      expect(summary.statutoryLiabilities.employeePf).toBe(3600);
      expect(summary.statutoryLiabilities.employerPf).toBe(3600);
      expect(summary.statutoryLiabilities.professionalTaxPayable).toBe(400);

      // Verify suggested journal voucher debits equal credits
      const debits = summary.suggestedJournalVouchers
        .filter((v: any) => v.type === 'DEBIT')
        .reduce((sum: number, v: any) => sum + v.amount, 0);
      const credits = summary.suggestedJournalVouchers
        .filter((v: any) => v.type === 'CREDIT')
        .reduce((sum: number, v: any) => sum + v.amount, 0);

      expect(debits).toBe(credits);
    });
  });
});
