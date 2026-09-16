import { Type } from "class-transformer";
import {
  IsDateString,
  IsBoolean,
  IsEmail,
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
  EmploymentType,
  InterviewRecommendation,
  JobRequisitionStatus,
  OnboardingTaskStatus,
  Priority,
  RecruitmentApplicantStatus,
  RecruitmentInterviewMode,
  RecruitmentSource,
} from "@prisma/client";

export class RecruitmentPagingDto {
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

export class RequisitionQueryDto extends RecruitmentPagingDto {
  @ApiPropertyOptional({ enum: JobRequisitionStatus })
  @IsOptional()
  @IsEnum(JobRequisitionStatus)
  status?: JobRequisitionStatus;

  @ApiPropertyOptional({ description: "Case-insensitive code or title search" })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}

export class CreateRequisitionDto {
  @ApiProperty({ example: "REQ-2026-001" })
  @IsString()
  @Matches(/^[A-Za-z0-9][A-Za-z0-9-]{1,39}$/)
  code!: string;

  @ApiProperty({ example: "Senior Robotics Engineer" })
  @IsString()
  @Length(2, 160)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  divisionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  hiringManagerEmployeeId?: string;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  openings!: number;

  @ApiProperty({ enum: Priority })
  @IsEnum(Priority)
  priority!: Priority;

  @ApiProperty()
  @IsString()
  @Length(10, 5000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  requirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 160)
  location?: string;
}

export class ApplicantQueryDto extends RecruitmentPagingDto {
  @ApiPropertyOptional({ enum: RecruitmentApplicantStatus })
  @IsOptional()
  @IsEnum(RecruitmentApplicantStatus)
  status?: RecruitmentApplicantStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  requisitionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateApplicantDto {
  @ApiProperty()
  @IsUUID()
  requisitionId!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 80)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 80)
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  @Length(3, 254)
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(7, 30)
  phone?: string;

  @ApiProperty({ enum: RecruitmentSource })
  @IsEnum(RecruitmentSource)
  source!: RecruitmentSource;

  @ApiProperty({ description: "Timestamp at which the applicant consented to data processing" })
  @IsDateString()
  consentAt!: string;

  @ApiPropertyOptional({
    description: "Approved HTTPS document URL; storage upload is handled separately",
  })
  @IsOptional()
  @IsString()
  @Matches(/^https:\/\//i)
  @Length(8, 2048)
  resumeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}

export class ScheduleInterviewDto {
  @ApiProperty()
  @IsString()
  @Length(2, 120)
  roundName!: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt!: string;

  @ApiProperty({ minimum: 15, maximum: 480 })
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;

  @ApiProperty({ enum: RecruitmentInterviewMode })
  @IsEnum(RecruitmentInterviewMode)
  mode!: RecruitmentInterviewMode;

  @ApiProperty()
  @IsUUID()
  interviewerEmployeeId!: string;
}

export class CompleteInterviewDto {
  @ApiProperty({ minimum: 0, maximum: 5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  score!: number;

  @ApiProperty({ enum: InterviewRecommendation })
  @IsEnum(InterviewRecommendation)
  recommendation!: InterviewRecommendation;

  @ApiProperty()
  @IsString()
  @Length(2, 3000)
  feedback!: string;
}

export class CreateOfferDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  annualCtc!: number;

  @ApiProperty({ default: "INR" })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty()
  @IsDateString()
  joiningDate!: string;
}

export class OfferResponseDto {
  @ApiProperty()
  @Type(() => Boolean)
  @IsBoolean()
  accepted!: boolean;
}

export class CreateOnboardingTaskDto {
  @ApiProperty()
  @IsString()
  @Length(2, 240)
  title!: string;

  @ApiProperty()
  @IsUUID()
  ownerEmployeeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateOnboardingTaskDto {
  @ApiProperty({ enum: OnboardingTaskStatus })
  @IsEnum(OnboardingTaskStatus)
  status!: OnboardingTaskStatus;
}
