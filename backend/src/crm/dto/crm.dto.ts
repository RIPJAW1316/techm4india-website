import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";
import {
  CrmAccountStatus,
  CrmAccountType,
  CrmActivityType,
  CrmLeadSource,
  CrmLeadStatus,
  CrmOpportunityStage,
} from "@prisma/client";

export class PagingDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20;
  @IsOptional() @IsString() search?: string;
}

export class LeadQueryDto extends PagingDto {
  @IsOptional() @IsEnum(CrmLeadStatus) status?: CrmLeadStatus;
  @IsOptional() @IsEnum(CrmLeadSource) source?: CrmLeadSource;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsDateString() followUpFrom?: string;
  @IsOptional() @IsDateString() followUpTo?: string;
  @IsOptional()
  @IsEnum(["createdAt", "updatedAt", "nextFollowUpAt", "estimatedValue", "name"] as const)
  sortBy?: "createdAt" | "updatedAt" | "nextFollowUpAt" | "estimatedValue" | "name";
  @IsOptional() @IsEnum(["asc", "desc"] as const) sortOrder?: "asc" | "desc";
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeArchived?: boolean;
}

export class LeadDto {
  @IsOptional() @IsString() @Length(1, 100) firstName?: string;
  @IsOptional() @IsString() @Length(1, 100) lastName?: string;
  @IsOptional() @IsString() @Length(1, 200) companyName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(5, 32) phone?: string;
  @IsOptional() @IsString() @Length(1, 150) designation?: string;
  @IsOptional() @IsEnum(CrmLeadSource) source?: CrmLeadSource;
  @IsOptional() @IsEnum(CrmLeadStatus) status?: CrmLeadStatus;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) estimatedValue?: number;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsDateString() nextFollowUpAt?: string;
  @IsOptional() @IsDateString() lastContactedAt?: string;
  @IsOptional() @IsString() @Length(1, 5000) notes?: string;
}

export class LeadConversionDto {
  @IsOptional() @IsUUID() existingAccountId?: string;
  @IsOptional() @IsUUID() existingContactId?: string;
  @IsOptional() @IsString() @Length(1, 200) accountName?: string;
  @IsOptional() @IsString() @Length(1, 200) accountIndustry?: string;
  @IsOptional() @IsString() @Length(1, 120) contactFirstName?: string;
  @IsOptional() @IsString() @Length(1, 120) contactLastName?: string;
  @IsOptional() @IsString() @Length(1, 150) contactJobTitle?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsString() @Length(5, 32) contactPhone?: string;
  @IsOptional() @IsString() @Length(1, 220) opportunityName?: string;
  @IsOptional() @IsString() @Length(1, 5000) opportunityDescription?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) estimatedValue?: number;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsDateString() expectedCloseDate?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
}

export class AccountQueryDto extends PagingDto {
  @IsOptional() @IsEnum(CrmAccountType) accountType?: CrmAccountType;
  @IsOptional() @IsEnum(CrmAccountStatus) status?: CrmAccountStatus;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeArchived?: boolean;
}
export class AccountDto {
  @IsOptional() @IsString() @Length(1, 200) name?: string;
  @IsOptional() @IsString() @Length(1, 200) displayName?: string;
  @IsOptional() @IsEnum(CrmAccountType) accountType?: CrmAccountType;
  @IsOptional() @IsEnum(CrmAccountStatus) status?: CrmAccountStatus;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(5, 32) phone?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsString() @Length(1, 5000) notes?: string;
}

export class ContactQueryDto extends PagingDto {
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeArchived?: boolean;
}
export class ContactDto {
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsString() @Length(1, 100) firstName?: string;
  @IsOptional() @IsString() @Length(1, 100) lastName?: string;
  @IsOptional() @IsString() jobTitle?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(5, 32) phone?: string;
  @IsOptional() @IsString() @Length(5, 32) alternatePhone?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isPrimary?: boolean;
  @IsOptional() @IsString() @Length(1, 5000) notes?: string;
}

export class OpportunityQueryDto extends PagingDto {
  @IsOptional() @IsEnum(CrmOpportunityStage) stage?: CrmOpportunityStage;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsDateString() expectedCloseFrom?: string;
  @IsOptional() @IsDateString() expectedCloseTo?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() includeArchived?: boolean;
}
export class OpportunityDto {
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() primaryContactId?: string;
  @IsOptional() @IsUUID() sourceLeadId?: string;
  @IsOptional() @IsString() @Length(1, 220) name?: string;
  @IsOptional() @IsString() @Length(1, 5000) description?: string;
  @IsOptional() @IsEnum(CrmOpportunityStage) stage?: CrmOpportunityStage;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) estimatedValue?: number;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsDateString() expectedCloseDate?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsString() @Length(1, 2000) lostReason?: string;
}

export class ActivityQueryDto extends PagingDto {
  @IsOptional() @IsUUID() leadId?: string;
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() contactId?: string;
  @IsOptional() @IsUUID() opportunityId?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsEnum(CrmActivityType) type?: CrmActivityType;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() completed?: boolean;
}
export class ActivityDto {
  @IsOptional() @IsEnum(CrmActivityType) type?: CrmActivityType;
  @IsOptional() @IsUUID() leadId?: string;
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() contactId?: string;
  @IsOptional() @IsUUID() opportunityId?: string;
  @IsOptional() @IsUUID() ownerEmployeeId?: string;
  @IsOptional() @IsString() @Length(1, 220) subject?: string;
  @IsOptional() @IsString() @Length(1, 5000) description?: string;
  @IsOptional() @IsDateString() occurredAt?: string;
  @IsOptional() @IsDateString() dueAt?: string;
}
