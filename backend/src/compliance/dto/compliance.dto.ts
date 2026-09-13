import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ComplianceCategory,
  ComplianceFrequency,
  ComplianceStatus,
} from "@prisma/client";

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{1,39}$/;

export class ComplianceQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ enum: ComplianceStatus })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @ApiPropertyOptional({ enum: ComplianceCategory })
  @IsOptional()
  @IsEnum(ComplianceCategory)
  category?: ComplianceCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateComplianceObligationDto {
  @ApiProperty({ example: "GST-2026-Q1" })
  @IsString()
  @Matches(CODE_PATTERN)
  code!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  description?: string;

  @ApiProperty({ enum: ComplianceCategory })
  @IsEnum(ComplianceCategory)
  category!: ComplianceCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  authority?: string;

  @ApiPropertyOptional({ enum: ComplianceFrequency, default: "ONE_TIME" })
  @IsOptional()
  @IsEnum(ComplianceFrequency)
  frequency?: ComplianceFrequency;

  @ApiProperty({ example: "2026-04-20" })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerEmployeeId?: string;
}

export class AddComplianceEvidenceDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;

  @ApiPropertyOptional({ description: "Approved HTTPS document URL; storage upload handled separately" })
  @IsOptional()
  @IsString()
  @Matches(/^https:\/\//i)
  @Length(8, 2048)
  documentUrl?: string;
}
