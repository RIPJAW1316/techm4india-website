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
  ValidateNested,
} from "class-validator";
import { PayrollCalculationType, PayrollComponentType, PayrollPeriodStatus } from "@prisma/client";

export class CreateComponentDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsEnum(PayrollComponentType) type!: PayrollComponentType;
  @IsOptional() @IsString() description?: string;
  @IsEnum(PayrollCalculationType) calculationType!: PayrollCalculationType;
  @IsOptional() @IsNumber() defaultValue?: number;
  @IsOptional() @IsNumber() percentageValue?: number;
  @IsOptional() @IsUUID() percentageBaseComponentId?: string;
  @IsOptional() @IsBoolean() isTaxable?: boolean;
  @IsOptional() @IsBoolean() isStatutory?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() displayOrder?: number;
}
export class UpdateComponentDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(PayrollComponentType) type?: PayrollComponentType;
  @IsOptional() @IsString() description?: string;
  @IsOptional()
  @IsEnum(PayrollCalculationType)
  calculationType?: PayrollCalculationType;
  @IsOptional() @IsNumber() defaultValue?: number;
  @IsOptional() @IsNumber() percentageValue?: number;
  @IsOptional() @IsUUID() percentageBaseComponentId?: string;
  @IsOptional() @IsBoolean() isTaxable?: boolean;
  @IsOptional() @IsBoolean() isStatutory?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() displayOrder?: number;
}

export class StructureComponentDto {
  @IsUUID() payrollComponentId!: string;
  @IsOptional() @IsNumber() value?: number;
  @IsOptional() @IsNumber() percentage?: number;
  @IsOptional() @IsInt() displayOrder?: number;
}
export class CreateStructureDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StructureComponentDto)
  components?: StructureComponentDto[];
}
export class UpdateStructureDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StructureComponentDto)
  components?: StructureComponentDto[];
}

export class CreateCompensationDto {
  @IsUUID() salaryStructureId!: string;
  @IsDateString() effectiveFrom!: string;
  @IsOptional() @IsDateString() effectiveTo?: string;
  @IsOptional() @IsNumber() annualCtc?: number;
  @IsOptional() @IsNumber() monthlyGrossTarget?: number;
  @IsOptional() @IsString() status?: "DRAFT" | "ACTIVE" | "ENDED";
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompensationOverrideDto)
  overrides?: CompensationOverrideDto[];
}
export class CompensationOverrideDto {
  @IsUUID() payrollComponentId!: string;
  @IsOptional() @IsNumber() value?: number;
  @IsOptional() @IsNumber() percentage?: number;
}
export class UpdateCompensationDto {
  @IsOptional() @IsUUID() salaryStructureId?: string;
  @IsOptional() @IsDateString() effectiveFrom?: string;
  @IsOptional() @IsDateString() effectiveTo?: string;
  @IsOptional() @IsNumber() annualCtc?: number;
  @IsOptional() @IsNumber() monthlyGrossTarget?: number;
  @IsOptional() @IsString() status?: "DRAFT" | "ACTIVE" | "ENDED";
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompensationOverrideDto)
  overrides?: CompensationOverrideDto[];
}

export class CreatePeriodDto {
  @IsInt() @Min(2000) @Max(2200) year!: number;
  @IsInt() @Min(1) @Max(12) month!: number;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsOptional() @IsEnum(PayrollPeriodStatus) status?: PayrollPeriodStatus;
}
export class UpdatePeriodDto {
  @IsOptional() @IsEnum(PayrollPeriodStatus) status?: PayrollPeriodStatus;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
}
export class CreateRunDto {
  @IsUUID() payrollPeriodId!: string;
  @IsOptional() @IsString() notes?: string;
}
export class OverrideResultDto {
  @IsOptional() @IsNumber() payableDays?: number;
  @IsOptional() @IsNumber() leaveWithoutPayDays?: number;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompensationOverrideDto)
  componentAdjustments?: CompensationOverrideDto[];
  @IsString() reason!: string;
}
