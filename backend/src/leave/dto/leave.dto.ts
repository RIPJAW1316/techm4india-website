import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { LeaveStatus, LeaveUnit } from "@prisma/client";

export class LeaveApplicationDto {
  @IsUUID() leaveTypeId!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsString() reason!: string;
}
export class LeaveQueryDto {
  @IsOptional() @IsEnum(LeaveStatus) status?: LeaveStatus;
  @IsOptional() @IsUUID() employeeId?: string;
  @IsOptional() @IsUUID() divisionId?: string;
  @IsOptional() @IsUUID() leaveTypeId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25;
}
export class LeaveReviewDto {
  @IsOptional() @IsString() comment?: string;
}
export class LeaveTypeDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(LeaveUnit) unit?: LeaveUnit;
  @IsOptional() @IsNumber() annualAllowance?: number;
  @IsOptional() @IsBoolean() balanceTracked?: boolean;
  @IsOptional() @IsBoolean() carryForwardAllowed?: boolean;
  @IsOptional() @IsNumber() maxCarryForward?: number;
  @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class BalanceAdjustmentDto {
  @IsNumber() amount!: number;
  @IsString() reason!: string;
}
