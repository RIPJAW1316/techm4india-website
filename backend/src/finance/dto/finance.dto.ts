import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {
  FinancePartyType,
  FinancePaymentDirection,
  FinancePaymentMethod,
  FinancePaymentStatus,
  FinanceTaxType,
  LedgerAccountType,
} from "@prisma/client";

export class FinancePagingDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20;
}

export class PartyQueryDto extends FinancePagingDto {
  @IsOptional() @IsEnum(FinancePartyType) type?: FinancePartyType;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() active?: boolean;
}
export class PartyDto {
  @IsOptional() @IsEnum(FinancePartyType) type?: FinancePartyType;
  @IsOptional() @IsString() @Length(1, 200) name?: string;
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() billingAddressLine1?: string;
  @IsOptional() @IsString() billingAddressLine2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() gstin?: string;
  @IsOptional() @IsString() pan?: string;
  @IsOptional() @IsUUID() crmAccountId?: string;
  @IsOptional() @IsUUID() institutionId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class TaxRateDto {
  @IsOptional() @IsString() @Length(1, 60) code?: string;
  @IsOptional() @IsString() @Length(1, 160) name?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(100) rate?: number;
  @IsOptional() @IsEnum(FinanceTaxType) taxType?: FinanceTaxType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString() effectiveFrom?: string;
  @IsOptional() @IsDateString() effectiveTo?: string;
}

export class InvoiceLineDto {
  @IsString() @Length(1, 1000) description!: string;
  @Type(() => Number) @IsNumber() @Min(0.0001) quantity!: number;
  @Type(() => Number) @IsNumber() @Min(0) unitPrice!: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) discountAmount?: number;
  @IsOptional() @IsString() hsnSacCode?: string;
  @IsOptional() @IsUUID() taxRateId?: string;
}
export class InvoiceDto {
  @IsOptional() @IsString() @Length(1, 100) invoiceNumber?: string;
  @IsOptional() @IsUUID() partyId?: string;
  @IsOptional() @IsDateString() invoiceDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @Type(() => Number) @IsNumber() roundingAdjustment?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() terms?: string;
  @IsOptional() @IsString() placeOfSupply?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines?: InvoiceLineDto[];
}
export class InvoiceQueryDto extends FinancePagingDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsUUID() partyId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsDateString() dueFrom?: string;
  @IsOptional() @IsDateString() dueTo?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
}

export class PaymentDto {
  @IsEnum(FinancePaymentDirection) direction!: FinancePaymentDirection;
  @IsOptional() @IsUUID() partyId?: string;
  @IsOptional() @IsUUID() invoiceId?: string;
  @IsOptional() @IsUUID() expenseId?: string;
  @Type(() => Number) @IsNumber() @Min(0.01) amount!: number;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsEnum(FinancePaymentMethod) method?: FinancePaymentMethod;
  @IsOptional() @IsString() reference?: string;
  @IsDateString() paymentDate!: string;
  @IsOptional() @IsString() notes?: string;
}
export class PaymentQueryDto extends FinancePagingDto {
  @IsOptional() @IsUUID() partyId?: string;
  @IsOptional() @IsUUID() invoiceId?: string;
  @IsOptional() @IsEnum(FinancePaymentDirection) direction?: FinancePaymentDirection;
  @IsOptional() @IsEnum(FinancePaymentStatus) status?: FinancePaymentStatus;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
}
export class ReasonDto {
  @IsString() @Length(2, 1000) reason!: string;
}

export class ExpenseLineDto {
  @IsString() @Length(1, 1000) description!: string;
  @Type(() => Number) @IsNumber() @Min(0) amount!: number;
  @IsOptional() @IsUUID() taxRateId?: string;
  @IsOptional() @IsString() hsnSacCode?: string;
}
export class ExpenseDto {
  @IsOptional() @IsString() @Length(1, 100) expenseNumber?: string;
  @IsOptional() @IsUUID() vendorPartyId?: string;
  @IsOptional() @IsString() @Length(1, 160) category?: string;
  @IsOptional() @IsString() @Length(1, 2000) description?: string;
  @IsOptional() @IsDateString() expenseDate?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseLineDto)
  lines?: ExpenseLineDto[];
}
export class ExpenseQueryDto extends FinancePagingDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsUUID() vendorPartyId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

export class LedgerAccountDto {
  @IsOptional() @IsString() @Length(1, 60) code?: string;
  @IsOptional() @IsString() @Length(1, 160) name?: string;
  @IsOptional() @IsEnum(LedgerAccountType) type?: LedgerAccountType;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class JournalLineDto {
  @IsUUID() ledgerAccountId!: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) debit?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) credit?: number;
}
export class JournalDto {
  @IsDateString() entryDate!: string;
  @IsOptional() @IsString() referenceType?: string;
  @IsOptional() @IsUUID() referenceId?: string;
  @IsString() @Length(1, 2000) description!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => JournalLineDto) lines!: JournalLineDto[];
}
export class DateRangeDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}
