import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { AttendanceStatus } from "@prisma/client";

export class AttendanceRangeQueryDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsUUID() employeeId?: string;
  @IsOptional() @IsUUID() divisionId?: string;
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsEnum(AttendanceStatus) status?: AttendanceStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25;
}

export class AttendanceSummaryQueryDto {
  @IsDateString() date!: string;
  @IsOptional() @IsUUID() divisionId?: string;
}

export class AttendanceCorrectionDto {
  @IsEnum(AttendanceStatus) status!: AttendanceStatus;
  @IsOptional() @IsDateString() checkInAt?: string;
  @IsOptional() @IsDateString() checkOutAt?: string;
  @IsOptional() @IsString() notes?: string;
  @IsString() reason!: string;
}
