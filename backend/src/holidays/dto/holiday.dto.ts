import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { HolidayType } from "@prisma/client";
export class HolidayDto {
  @IsString() name!: string;
  @IsDateString() date!: string;
  @IsOptional() @IsEnum(HolidayType) type?: HolidayType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isOptional?: boolean;
  @IsOptional() @IsUUID() divisionId?: string;
  @IsOptional() @IsUUID() branchId?: string;
}
export class HolidayQueryDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 100;
}
