import { Type } from "class-transformer";
import {
  IsDateString,
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
  ProgramBatchStatus,
  ProgramContentType,
  ProgramDeliveryMode,
  ProgramStatus,
  StudentStatus,
} from "@prisma/client";

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{1,39}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_PATTERN = /^[0-9]+(?:\.[0-9]+)*$/;

export class ProgramsPagingDto {
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

export class ProgramQueryDto extends ProgramsPagingDto {
  @ApiPropertyOptional({ enum: ProgramStatus })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;

  @ApiPropertyOptional({ description: "Case-insensitive code or name search" })
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateProgramDto {
  @ApiProperty({ example: "PRG-2026-001" })
  @IsString()
  @Matches(CODE_PATTERN)
  code!: string;

  @ApiProperty({ example: "Robotics Lab Foundations" })
  @IsString()
  @Length(2, 160)
  name!: string;

  @ApiProperty({ example: "robotics-lab-foundations" })
  @IsString()
  @Matches(SLUG_PATTERN)
  @Length(2, 160)
  slug!: string;

  @ApiPropertyOptional({ default: "1.0" })
  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN)
  @Length(1, 20)
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  divisionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ example: "Coding & Robotics" })
  @IsString()
  @Length(2, 120)
  category!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  subCategory?: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2000)
  shortDescription!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 20000)
  longDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  outcomes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 5000)
  eligibility?: string;

  @ApiProperty({ minimum: 0.5, maximum: 100000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.5)
  @Max(100000)
  durationHours!: number;

  @ApiProperty({ enum: ProgramDeliveryMode })
  @IsEnum(ProgramDeliveryMode)
  deliveryMode!: ProgramDeliveryMode;

  @ApiProperty({ example: "PROJECT" })
  @IsString()
  @Length(2, 120)
  assessmentMethod!: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  certificateType?: string;
}

export class CreateProgramModuleDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string;

  @ApiProperty({ minimum: 1, maximum: 1000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  position!: number;
}

export class CreateProgramLessonDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string;

  @ApiProperty({ enum: ProgramContentType })
  @IsEnum(ProgramContentType)
  contentType!: ProgramContentType;

  @ApiPropertyOptional({ description: "Inline lesson body; required for TEXT lessons" })
  @IsOptional()
  @IsString()
  @Length(1, 20000)
  contentBody?: string;

  @ApiPropertyOptional({
    description: "Approved HTTPS content URL; required for VIDEO, PDF and LIVE lessons",
  })
  @IsOptional()
  @IsString()
  @Matches(/^https:\/\//i)
  @Length(8, 2048)
  contentUrl?: string;

  @ApiPropertyOptional({ default: 0, minimum: 0, maximum: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  durationMinutes?: number;

  @ApiProperty({ minimum: 1, maximum: 1000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  position!: number;
}

export class StudentQueryDto extends ProgramsPagingDto {
  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateStudentDto {
  @ApiProperty({ example: "STU-2026-001" })
  @IsString()
  @Matches(CODE_PATTERN)
  studentCode!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 80)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 80)
  lastName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @Length(3, 254)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(7, 30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  guardianName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(7, 30)
  guardianPhone?: string;

  @ApiProperty({ description: "Timestamp at which consent for data processing was captured" })
  @IsDateString()
  consentAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institutionId?: string;
}

export class CreateProgramBatchDto {
  @ApiProperty({ example: "BAT-2026-001" })
  @IsString()
  @Matches(CODE_PATTERN)
  code!: string;

  @ApiProperty({ example: "October Cohort" })
  @IsString()
  @Length(2, 160)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  trainerEmployeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ example: "2026-10-01" })
  @IsDateString()
  startsOn!: string;

  @ApiProperty({ example: "2026-10-15" })
  @IsDateString()
  endsOn!: string;

  @ApiProperty({ minimum: 1, maximum: 100000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  capacity!: number;
}

export class ProgramBatchQueryDto extends ProgramsPagingDto {
  @ApiPropertyOptional({ enum: ProgramBatchStatus })
  @IsOptional()
  @IsEnum(ProgramBatchStatus)
  status?: ProgramBatchStatus;
}

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;
}

export class UpdateLessonProgressDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  progressPercent!: number;
}

export class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 20000)
  instructions?: string;

  @ApiPropertyOptional({ default: 100, minimum: 1, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(1000)
  maxScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class CreateSubmissionDto {
  @ApiProperty()
  @IsUUID()
  assignmentId!: string;

  @ApiPropertyOptional({ description: "Approved HTTPS submission URL" })
  @IsOptional()
  @IsString()
  @Matches(/^https:\/\//i)
  @Length(8, 2048)
  submissionUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}

export class GradeSubmissionDto {
  @ApiProperty({ minimum: 0, maximum: 1000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000)
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  feedback?: string;
}

export class IssueCertificateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  title?: string;
}
