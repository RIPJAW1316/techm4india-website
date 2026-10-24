import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GeneratePresignedUploadDto, SettleClaimDto } from './dto/hrms.dto';
import { DocumentStorageService } from './document-storage.service';

@Injectable()
export class FinanceIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: DocumentStorageService,
  ) {}

  /**
   * 1. Get Approved Expense Claims Ready for Finance Settlement
   */
  async getApprovedClaimsForFinance(filter?: { employeeId?: string; limit?: number }) {
    const where: any = { status: 'APPROVED' };
    if (filter?.employeeId) {
      where.employeeId = filter.employeeId;
    }

    return this.prisma.expenseClaim.findMany({
      where,
      take: filter?.limit || 100,
      orderBy: { reviewedAt: 'asc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            bankAccountNumber: true,
            bankIfsc: true,
            bankName: true,
            panNumber: true,
          },
        },
        items: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * 2. Idempotent Settlement of an Expense Claim by Finance ERP
   */
  async settleExpenseClaim(
    claimId: string,
    financeUserId: string,
    dto: SettleClaimDto,
  ) {
    const claim = await this.prisma.expenseClaim.findUnique({
      where: { id: claimId },
      include: { employee: true },
    });

    if (!claim) {
      throw new NotFoundException(`Expense claim with ID ${claimId} not found.`);
    }

    // Idempotency: If already settled with the same batch reference, return existing record
    if (claim.status === 'SETTLED' || claim.status === 'PAID') {
      if (claim.settlementBatchRef === dto.batchReference) {
        return {
          id: claim.id,
          claimNumber: claim.claimNumber,
          status: claim.status,
          totalAmount: claim.totalAmount,
          settlementBatchRef: claim.settlementBatchRef,
          reimbursementDate: claim.reimbursementDate,
          alreadySettled: true,
        };
      }
      throw new ConflictException(
        `Claim ${claim.claimNumber} has already been settled in batch ${claim.settlementBatchRef || 'UNKNOWN'}. Duplicate disbursement prohibited.`
      );
    }

    if (claim.status !== 'APPROVED') {
      throw new BadRequestException(
        `Only APPROVED expense claims can be settled by Finance. Current status: ${claim.status}.`
      );
    }

    const reimbursementDate = dto.settlementDate ? new Date(dto.settlementDate) : new Date();

    const updatedClaim = await this.prisma.expenseClaim.update({
      where: { id: claimId },
      data: {
        status: 'SETTLED',
        settledById: financeUserId,
        settlementBatchRef: dto.batchReference,
        reimbursementDate,
        notes: dto.notes ? `${claim.notes || ''} | Settled: ${dto.notes}` : claim.notes,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
    });

    // Write audit trail entry
    await this.prisma.auditLog.create({
      data: {
        userId: financeUserId,
        action: 'FINANCE_CLAIM_SETTLED',
        entity: 'ExpenseClaim',
        entityId: claimId,
        details: {
          claimNumber: claim.claimNumber,
          amount: claim.totalAmount,
          batchReference: dto.batchReference,
          reimbursementDate,
        },
      },
    });

    return {
      ...updatedClaim,
      alreadySettled: false,
    };
  }

  /**
   * 3. Get Finalized Payroll Period Summary for Finance Ledger Accrual
   */
  async getFinalizedPayrollSummary(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        payslips: {
          select: {
            id: true,
            payslipNumber: true,
            grossEarnings: true,
            basicSalary: true,
            hra: true,
            allowancesTotal: true,
            pfDeduction: true,
            ptDeduction: true,
            esiDeduction: true,
            taxDeduction: true,
            totalDeductions: true,
            netPay: true,
            employee: {
              select: {
                id: true,
                employeeNumber: true,
                firstName: true,
                lastName: true,
                branch: { select: { name: true, state: true } },
                department: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    });

    if (!period) {
      throw new NotFoundException(`Payroll period with ID ${periodId} not found.`);
    }

    if (period.status !== 'FINALIZED') {
      throw new BadRequestException(
        `Payroll period must be FINALIZED before Finance ledger posting. Current status: ${period.status}.`
      );
    }

    // Compute employer liabilities and aggregate sub-totals
    const pfTotal = period.payslips.reduce((acc, p) => acc + p.pfDeduction, 0);
    const ptTotal = period.payslips.reduce((acc, p) => acc + p.ptDeduction, 0);
    const esiTotal = period.payslips.reduce((acc, p) => acc + p.esiDeduction, 0);
    const tdsTotal = period.payslips.reduce((acc, p) => acc + p.taxDeduction, 0);

    // Standard Indian employer match: EPF 12% (matches employee deduction), ESI 3.25% (4.33x employee 0.75%)
    const employerPfLiability = pfTotal;
    const employerEsiLiability = Math.round(esiTotal * 4.33);

    return {
      period: {
        id: period.id,
        month: period.month,
        year: period.year,
        status: period.status,
        finalizedAt: period.finalizedAt,
      },
      headcount: period.payslips.length,
      totals: {
        grossSalary: period.totalGross,
        netPayable: period.totalNet,
        totalEmployeeDeductions: period.totalDeductions,
      },
      statutoryLiabilities: {
        employeePf: pfTotal,
        employerPf: employerPfLiability,
        totalPfRemittance: pfTotal + employerPfLiability,
        professionalTaxPayable: ptTotal,
        employeeEsi: esiTotal,
        employerEsi: employerEsiLiability,
        totalEsiRemittance: esiTotal + employerEsiLiability,
        tdsWithholdingPayable: tdsTotal,
      },
      suggestedJournalVouchers: [
        {
          account: 'SALARY_EXPENSE_GROSS',
          type: 'DEBIT',
          amount: period.totalGross,
        },
        {
          account: 'EMPLOYER_PF_EXPENSE',
          type: 'DEBIT',
          amount: employerPfLiability,
        },
        {
          account: 'SALARY_NET_PAYABLE',
          type: 'CREDIT',
          amount: period.totalNet,
        },
        {
          account: 'EPF_STATUTORY_PAYABLE',
          type: 'CREDIT',
          amount: pfTotal + employerPfLiability,
        },
        {
          account: 'PROFESSIONAL_TAX_PAYABLE',
          type: 'CREDIT',
          amount: ptTotal,
        },
        {
          account: 'TDS_PAYABLE',
          type: 'CREDIT',
          amount: tdsTotal,
        },
      ],
    };
  }

  /**
   * 4. Secure Presigned Document Upload
   */
  async requestPresignedDocumentUpload(
    userId: string,
    orgId: string,
    dto: GeneratePresignedUploadDto,
  ) {
    return this.storageService.generatePresignedUpload(
      orgId || 'TECHM4INDIA',
      dto.documentType,
      dto.fileName,
      dto.mimeType,
      dto.fileSize,
    );
  }

  /**
   * 5. Secure Presigned Document Download
   */
  async requestPresignedDocumentDownload(storageKey: string, orgId?: string) {
    return this.storageService.generatePresignedDownload(storageKey, orgId);
  }
}
