import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { DatabaseModule } from '../../database/database.module';
import { HrmsModule } from '../hrms/hrms.module';

/**
 * FinanceModule — Complete Finance, Accounting, GST & Compliance Engine
 * Covers Section 09 of TechM4India ERP Specification V2.0
 * Integrates with HrmsModule for Cross-Domain Payroll & Expense Claim Settlement
 */
@Module({
  imports: [DatabaseModule, HrmsModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
