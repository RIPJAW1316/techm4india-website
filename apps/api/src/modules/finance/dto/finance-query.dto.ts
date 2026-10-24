import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DivisionCode, InvoiceStatus } from '@prisma/client';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

export class InvoiceFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({ enum: DivisionCode })
  @IsEnum(DivisionCode)
  @IsOptional()
  division?: DivisionCode;

  @ApiPropertyOptional({ example: 'TechM4' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class JournalFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DivisionCode })
  @IsEnum(DivisionCode)
  @IsOptional()
  division?: DivisionCode;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsString()
  @IsOptional()
  endDate?: string;
}
