import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { AddressType, EmploymentHistoryEventType, EmploymentStatus, EmploymentType } from "@prisma/client";
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

const EmptyToUndefined = () => Transform(({ value }) => value === "" ? undefined : value);

export class HrEmployeeQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() divisionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() branchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() managerId?: string;
  @ApiPropertyOptional({ enum: EmploymentType }) @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @ApiPropertyOptional({ enum: EmploymentStatus }) @IsOptional() @IsEnum(EmploymentStatus) status?: EmploymentStatus;
  @ApiPropertyOptional({ enum: ["name", "employeeCode", "joiningDate"] }) @IsOptional() @IsEnum(["name", "employeeCode", "joiningDate"]) sortBy: "name" | "employeeCode" | "joiningDate" = "name";
  @ApiPropertyOptional({ enum: ["asc", "desc"] }) @IsOptional() @IsEnum(["asc", "desc"]) sortOrder: "asc" | "desc" = "asc";
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class CreateHrEmployeeDto {
  @ApiPropertyOptional({ description: "Existing invited account can be linked; otherwise an inactive invited account is created without a password being returned." }) @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional({ format: "email" }) @EmptyToUndefined() @IsOptional() @IsEmail() officialEmail?: string;
  @ApiProperty() @IsString() @MaxLength(100) firstName!: string;
  @ApiProperty() @IsString() @MaxLength(100) lastName!: string;
  @ApiProperty() @IsString() @MaxLength(60) employeeCode!: string;
  @ApiProperty() @IsUUID() divisionId!: string;
  @ApiProperty() @IsUUID() departmentId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() branchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() managerEmployeeId?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(160) designation?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(40) gradeText?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() joiningDate?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() confirmationDate?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() probationEndDate?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsEmail() personalEmail?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(40) alternatePhone?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(40) gender?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(80) nationality?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(40) bloodGroup?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(500) profilePhotoUrl?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(80) biometricId?: string;
}

export class UpdateHrEmployeeDto extends PartialType(OmitType(CreateHrEmployeeDto, ["userId"] as const)) {
  @ApiPropertyOptional({ enum: EmploymentStatus }) @IsOptional() @IsEnum(EmploymentStatus) employmentStatus?: EmploymentStatus;
}

export class ExitEmployeeDto {
  @ApiProperty() @IsDateString() effectiveDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

export class CreateEmployeeAddressDto {
  @ApiPropertyOptional({ enum: AddressType }) @IsOptional() @IsEnum(AddressType) type?: AddressType;
  @ApiProperty() @IsString() @MaxLength(250) addressLine1!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(250) addressLine2?: string;
  @ApiProperty() @IsString() @MaxLength(100) city!: string;
  @ApiProperty() @IsString() @MaxLength(100) state!: string;
  @ApiProperty() @IsString() @MaxLength(30) postalCode!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class UpdateEmployeeAddressDto extends PartialType(CreateEmployeeAddressDto) {}

export class CreateEmergencyContactDto {
  @ApiProperty() @IsString() @MaxLength(160) name!: string;
  @ApiProperty() @IsString() @MaxLength(80) relationship!: string;
  @ApiProperty() @IsString() @MaxLength(40) phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) alternatePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class UpdateEmergencyContactDto extends PartialType(CreateEmergencyContactDto) {}

export class CreateEmployeeSkillDto {
  @ApiProperty() @IsString() @MaxLength(120) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) level?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(80) yearsExperience?: number;
}
export class UpdateEmployeeSkillDto extends PartialType(CreateEmployeeSkillDto) {}

export class CreateEmployeeCertificationDto {
  @ApiProperty() @IsString() @MaxLength(160) name!: string;
  @ApiProperty() @IsString() @MaxLength(160) issuer!: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() issuedAt?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() expiresAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) credentialId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) credentialUrl?: string;
}
export class UpdateEmployeeCertificationDto extends PartialType(CreateEmployeeCertificationDto) {}

export class CreateEmployeeEducationDto {
  @ApiProperty() @IsString() @MaxLength(200) institution!: string;
  @ApiProperty() @IsString() @MaxLength(160) qualification!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) fieldOfStudy?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @EmptyToUndefined() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) gradeOrScore?: string;
}
export class UpdateEmployeeEducationDto extends PartialType(CreateEmployeeEducationDto) {}

export type HrHistoryEvent = EmploymentHistoryEventType;
