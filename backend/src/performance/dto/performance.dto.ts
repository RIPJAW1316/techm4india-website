import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
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
  PerformanceCycleStatus,
  PerformanceCycleType,
  PerformanceGoalCategory,
  PerformanceGoalStatus,
  PerformanceReviewStatus,
} from "@prisma/client";

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{1,39}$/;

export class PerformancePagingDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class CycleQueryDto extends PerformancePagingDto {
  @ApiPropertyOptional({ enum: PerformanceCycleStatus })
  @IsOptional()
  @IsEnum(PerformanceCycleStatus)
  status?: PerformanceCycleStatus;

  @ApiPropertyOptional({ enum: PerformanceCycleType })
  @IsOptional()
  @IsEnum(PerformanceCycleType)
  type?: PerformanceCycleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}

export class CreateCycleDto {
  @ApiProperty({ example: "CYC-FY26" })
  @IsString()
  @Matches(CODE_PATTERN)
  code!: string;

  @ApiProperty({ example: "FY26 Annual Review" })
  @IsString()
  @Length(2, 160)
  name!: string;

  @ApiProperty({ enum: PerformanceCycleType })
  @IsEnum(PerformanceCycleType)
  type!: PerformanceCycleType;

  @ApiProperty({ example: "2026-04-01" })
  @IsDateString()
  startsOn!: string;

  @ApiProperty({ example: "2027-03-31" })
  @IsDateString()
  endsOn!: string;

  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  ratingScaleMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;
}

export class GoalQueryDto extends PerformancePagingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cycleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ enum: PerformanceGoalStatus })
  @IsOptional()
  @IsEnum(PerformanceGoalStatus)
  status?: PerformanceGoalStatus;
}

export class CreateGoalDto {
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string;

  @ApiPropertyOptional({ enum: PerformanceGoalCategory, default: "BUSINESS" })
  @IsOptional()
  @IsEnum(PerformanceGoalCategory)
  category?: PerformanceGoalCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  metric?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  targetValue?: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  weight!: number;
}

export class UpdateGoalDto {
  @ApiPropertyOptional({ enum: PerformanceGoalStatus })
  @IsOptional()
  @IsEnum(PerformanceGoalStatus)
  status?: PerformanceGoalStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  progressPercent?: number;
}

export class ReviewQueryDto extends PerformancePagingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cycleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ enum: PerformanceReviewStatus })
  @IsOptional()
  @IsEnum(PerformanceReviewStatus)
  status?: PerformanceReviewStatus;
}

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @ApiProperty()
  @IsUUID()
  reviewerEmployeeId!: string;
}

export class SelfAssessmentDto {
  @ApiProperty({ minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  selfRating!: number;

  @ApiProperty()
  @IsString()
  @Length(2, 5000)
  selfComments!: string;
}

export class ManagerReviewDto {
  @ApiProperty({ minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  managerRating!: number;

  @ApiProperty()
  @IsString()
  @Length(2, 5000)
  managerComments!: string;
}

export class FinalizeReviewDto {
  @ApiProperty({ minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  finalRating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 3000)
  calibrationNotes?: string;
}

export class AcknowledgeReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 3000)
  acknowledgement?: string;
}
