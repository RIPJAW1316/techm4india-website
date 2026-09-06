import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";
import {
  InstitutionEngagementStatus,
  InstitutionEngagementType,
  InstitutionStatus,
  InstitutionType,
} from "@prisma/client";

export class InstitutionPagingDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @IsOptional() @IsString() search?: string;
}
export class InstitutionQueryDto extends InstitutionPagingDto {
  @IsOptional() @IsEnum(InstitutionType) type?: InstitutionType;
  @IsOptional() @IsEnum(InstitutionStatus) status?: InstitutionStatus;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsUUID() relationshipOwnerEmployeeId?: string;
  @IsOptional() @IsUUID() crmAccountId?: string;
  @IsOptional()
  @IsEnum(["name", "createdAt", "updatedAt", "studentStrength"] as const)
  sortBy?: "name" | "createdAt" | "updatedAt" | "studentStrength";
  @IsOptional() @IsEnum(["asc", "desc"] as const) sortOrder?: "asc" | "desc";
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeArchived?: boolean;
}
export class InstitutionDto {
  @IsOptional() @IsString() @Length(1, 80) code?: string;
  @IsOptional() @IsString() @Length(1, 240) name?: string;
  @IsOptional() @IsString() @Length(1, 120) shortName?: string;
  @IsOptional() @IsEnum(InstitutionType) type?: InstitutionType;
  @IsOptional() @IsEnum(InstitutionStatus) status?: InstitutionStatus;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsEmail() officialEmail?: string;
  @IsOptional() @IsString() @Length(5, 32) officialPhone?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsUUID() primaryContactId?: string;
  @IsOptional() @IsUUID() relationshipOwnerEmployeeId?: string;
  @IsOptional() @IsUUID() crmAccountId?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(3000)
  establishedYear?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  studentStrength?: number;
  @IsOptional() @IsString() @Length(1, 5000) notes?: string;
}
export class InstitutionContactDto {
  @IsOptional() @IsString() @Length(1, 100) firstName?: string;
  @IsOptional() @IsString() @Length(1, 100) lastName?: string;
  @IsOptional() @IsString() roleTitle?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(5, 32) phone?: string;
  @IsOptional() @IsString() @Length(5, 32) alternatePhone?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isPrimary?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isDecisionMaker?: boolean;
  @IsOptional() @IsString() @Length(1, 5000) notes?: string;
}
export class EngagementQueryDto extends InstitutionPagingDto {
  @IsOptional()
  @IsEnum(InstitutionEngagementStatus)
  status?: InstitutionEngagementStatus;
  @IsOptional()
  @IsEnum(InstitutionEngagementType)
  type?: InstitutionEngagementType;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeArchived?: boolean;
}
export class InstitutionEngagementDto {
  @IsOptional() @IsString() @Length(1, 240) title?: string;
  @IsOptional() @IsString() @Length(1, 5000) description?: string;
  @IsOptional()
  @IsEnum(InstitutionEngagementType)
  type?: InstitutionEngagementType;
  @IsOptional()
  @IsEnum(InstitutionEngagementStatus)
  status?: InstitutionEngagementStatus;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsUUID() crmOpportunityId?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  estimatedParticipants?: number;
  @IsOptional() @IsString() @Length(1, 5000) notes?: string;
}
