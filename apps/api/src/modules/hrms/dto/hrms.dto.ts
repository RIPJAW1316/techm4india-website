import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateEmployeeDto {
  @ApiProperty({ example: 'TM-010' })
  @IsString()
  employeeNumber: string;

  @ApiProperty({ example: 'Vikram' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'vikram.sharma@techm4india.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+91 98765 12345' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  dateOfJoining: string;

  @ApiPropertyOptional({ example: 'FULL_TIME' })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankIfsc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

export class ApplyLeaveDto {
  @ApiProperty()
  @IsString()
  leaveTypeCode: string;

  @ApiProperty({ example: '2026-04-10' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-04-12' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @ApiPropertyOptional({ example: 'FIRST_HALF' })
  @IsOptional()
  @IsString()
  halfDayType?: string;

  @ApiProperty({ example: 'Family function in hometown' })
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class ReviewLeaveDto {
  @ApiProperty({ example: 'APPROVED', enum: ['APPROVED', 'REJECTED'] })
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Approved, enjoy your time off!' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClockInOutDto {
  @ApiPropertyOptional({ example: 'Working from Hyderabad office' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RegularizeAttendanceDto {
  @ApiProperty()
  @IsString()
  attendanceId: string;

  @ApiProperty({ example: '2026-04-05T09:15:00.000Z' })
  @IsDateString()
  requestedClockIn: string;

  @ApiProperty({ example: '2026-04-05T18:30:00.000Z' })
  @IsDateString()
  requestedClockOut: string;

  @ApiProperty({ example: 'Forgot to clock in due to morning customer presentation' })
  @IsString()
  reason: string;
}

export class ExpenseClaimItemDto {
  @ApiProperty({ example: 'TRAVEL' })
  @IsString()
  categoryCode: string;

  @ApiProperty({ example: '2026-04-02' })
  @IsDateString()
  expenseDate: string;

  @ApiProperty({ example: 1250.0 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'Uber Technologies' })
  @IsOptional()
  @IsString()
  merchantName?: string;

  @ApiProperty({ example: 'Client site visit travel' })
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

export class SubmitExpenseClaimDto {
  @ApiProperty({ example: 'Client Meeting Travel - April 2026' })
  @IsString()
  title: string;

  @ApiProperty({ type: [ExpenseClaimItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseClaimItemDto)
  items: ExpenseClaimItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReviewClaimDto {
  @ApiProperty({ example: 'APPROVED', enum: ['APPROVED', 'REJECTED'] })
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Verified receipts, approved for payroll payout.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SalaryStructureDto {
  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  monthlyCtc: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  hra: number;

  @ApiProperty({ example: 18000 })
  @IsNumber()
  @Min(0)
  specialAllowance: number;

  @ApiPropertyOptional({ default: 3200 })
  @IsOptional()
  @IsNumber()
  conveyanceAllowance?: number = 3200;

  @ApiPropertyOptional({ default: 3800 })
  @IsOptional()
  @IsNumber()
  medicalAllowance?: number = 3800;

  @ApiPropertyOptional({ default: 1800 })
  @IsOptional()
  @IsNumber()
  providentFundEmployee?: number = 1800;

  @ApiPropertyOptional({ default: 200 })
  @IsOptional()
  @IsNumber()
  professionalTax?: number = 200;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  esiEmployee?: number = 0;

  @ApiPropertyOptional({ default: 5000 })
  @IsOptional()
  @IsNumber()
  tdsEstimate?: number = 5000;
}

export class ProcessPayrollDto {
  @ApiProperty({ example: 4 })
  @IsInt()
  month: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  year: number;
}

export class CreateIncidentReportDto {
  @ApiProperty({ example: 'Workplace Ergonomics Issue' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'SAFETY' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'MEDIUM' })
  @IsOptional()
  @IsString()
  severity?: string = 'MEDIUM';

  @ApiProperty({ example: 'Detailed description of the observation or hazard' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-04-08' })
  @IsDateString()
  incidentDate: string;

  @ApiPropertyOptional({ example: 'Hyderabad 4th Floor Lab' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;
}

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Annual TechM4India Innovation Summit 2026' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'All staff are invited to attend the showcase...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ default: 'GENERAL' })
  @IsOptional()
  @IsString()
  category?: string = 'GENERAL';

  @ApiPropertyOptional({ default: 'ALL' })
  @IsOptional()
  @IsString()
  targetScope?: string = 'ALL';

  @ApiPropertyOptional({ default: 'NORMAL' })
  @IsOptional()
  @IsString()
  priority?: string = 'NORMAL';

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;
}

export class CreateDiscussionTopicDto {
  @ApiProperty({ example: 'Best practices for edge computing telemetry' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Sharing reference architecture notes...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ default: 'ENGINEERING' })
  @IsOptional()
  @IsString()
  category?: string = 'ENGINEERING';
}

export class AddDiscussionReplyDto {
  @ApiProperty({ example: 'Great insight, let us benchmark latency.' })
  @IsString()
  content: string;
}


export class SettleClaimDto {
  @ApiProperty({ example: 'BATCH-2026-10-01', description: 'Finance payment disbursement batch reference' })
  @IsString()
  batchReference: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Actual settlement execution date' })
  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @ApiPropertyOptional({ example: 'Disbursed via HDFC Corporate NetBanking NEFT' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GeneratePresignedUploadDto {
  @ApiProperty({ example: 'employee_handbook_signed.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 1048576, description: 'File size in bytes' })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ enum: ['RESUME', 'ID_PROOF', 'CONTRACT', 'CERTIFICATE', 'TAX_FORM', 'POLICY', 'RECEIPT'] })
  @IsString()
  documentType: string;

  @ApiPropertyOptional({ description: 'Optional target employee ID if uploaded by HR manager' })
  @IsOptional()
  @IsString()
  employeeId?: string;
}
