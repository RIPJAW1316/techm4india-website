import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";

export enum HsnSacKindDto {
  HSN = "HSN",
  SAC = "SAC",
}

/** Period selector shared by every return working. */
export class GstPeriodDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

export class GstRegisterQueryDto extends GstPeriodDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}

export class CreateHsnSacCodeDto {
  /** HSN codes are 4–8 digits; SAC codes are 6. */
  @IsString()
  @Matches(/^\d{4,8}$/, { message: "code must be 4 to 8 digits" })
  code!: string;

  @IsEnum(HsnSacKindDto) kind!: HsnSacKindDto;

  @IsString() @Length(2, 200) description!: string;

  @Type(() => Number) @IsNumber() @Min(0) @Max(100) defaultRatePercent!: number;

  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateHsnSacCodeDto {
  @IsOptional() @IsString() @Length(2, 200) description?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) defaultRatePercent?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class HsnSacQueryDto {
  @IsOptional() @IsEnum(HsnSacKindDto) kind?: HsnSacKindDto;
  @IsOptional() @IsString() search?: string;
}
