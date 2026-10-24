import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { DatabaseModule } from '../../database/database.module';

/**
 * FinanceModule — Complete Finance, Accounting, GST & Compliance Engine
 * Covers Section 09 of TechM4India ERP Specification V2.0
 */
@Module({
  imports: [DatabaseModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
