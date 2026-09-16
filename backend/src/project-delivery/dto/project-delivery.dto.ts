import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProjectRiskLikelihood, ProjectRiskSeverity, ProjectRiskStatus } from "@prisma/client";

export class PagingDto {
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
}

export class CreateMilestoneDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @ApiProperty({ example: "2026-05-01" })
  @IsDateString()
  dueDate!: string;
}

export class CreateRiskDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @ApiPropertyOptional({ enum: ProjectRiskSeverity, default: "MEDIUM" })
  @IsOptional()
  @IsEnum(ProjectRiskSeverity)
  severity?: ProjectRiskSeverity;

  @ApiPropertyOptional({ enum: ProjectRiskLikelihood, default: "MEDIUM" })
  @IsOptional()
  @IsEnum(ProjectRiskLikelihood)
  likelihood?: ProjectRiskLikelihood;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  mitigation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerEmployeeId?: string;
}

export class UpdateRiskDto {
  @ApiPropertyOptional({ enum: ProjectRiskStatus })
  @IsOptional()
  @IsEnum(ProjectRiskStatus)
  status?: ProjectRiskStatus;

  @ApiPropertyOptional({ enum: ProjectRiskSeverity })
  @IsOptional()
  @IsEnum(ProjectRiskSeverity)
  severity?: ProjectRiskSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  mitigation?: string;
}

export class CreateSprintDto {
  @ApiProperty()
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  goal?: string;

  @ApiProperty({ example: "2026-05-01" })
  @IsDateString()
  startsOn!: string;

  @ApiProperty({ example: "2026-05-14" })
  @IsDateString()
  endsOn!: string;
}

export class CreateTimeLogDto {
  @ApiPropertyOptional({
    description: "Defaults to the caller; other employees require manage rights",
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiProperty({ example: "2026-05-03" })
  @IsDateString()
  workDate!: string;

  @ApiProperty({ minimum: 0.25, maximum: 24 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.25)
  @Max(24)
  hours!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}
