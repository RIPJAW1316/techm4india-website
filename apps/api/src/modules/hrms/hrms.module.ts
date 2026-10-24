import { Module } from '@nestjs/common';
import { HrmsController } from './hrms.controller';
import { HrmsService } from './hrms.service';
import { FinanceIntegrationService } from './finance-integration.service';
import { DocumentStorageService } from './document-storage.service';

/**
 * HrmsModule — TechM4India HRMS Business Domain
 * Full functional parity with Hr.my with Indian enterprise compliance:
 * - Employee Directory & ESS Profile
 * - e-Leave Management & Team Calendars
 * - Time Clock & Attendance Timesheets
 * - Indian Statutory Payroll & Payslips
 * - e-Claim Expense Reimbursements
 * - Finance ERP Integration (Idempotent Settlement & Payroll Accruals)
 * - Secure Presigned Object Storage Service
 * - Workplace Incidents, Announcements, Discussions & Documents
 */
@Module({
  controllers: [HrmsController],
  providers: [HrmsService, FinanceIntegrationService, DocumentStorageService],
  exports: [HrmsService, FinanceIntegrationService, DocumentStorageService],
})
export class HrmsModule {}
