import { Module } from '@nestjs/common';
import { HrmsController } from './hrms.controller';
import { HrmsService } from './hrms.service';

/**
 * HrmsModule — TechM4India HRMS Business Domain
 * Full functional parity with Hr.my with Indian enterprise compliance:
 * - Employee Directory & ESS Profile
 * - e-Leave Management & Team Calendars
 * - Time Clock & Attendance Timesheets
 * - Indian Statutory Payroll & Payslips
 * - e-Claim Expense Reimbursements
 * - Workplace Incidents, Announcements, Discussions & Documents
 */
@Module({
  controllers: [HrmsController],
  providers: [HrmsService],
  exports: [HrmsService],
})
export class HrmsModule {}
