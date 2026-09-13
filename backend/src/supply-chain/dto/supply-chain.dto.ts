import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  AssetCategory,
  AssetStatus,
  InventoryItemStatus,
  PurchaseOrderStatus,
  VendorCategory,
  VendorStatus,
} from "@prisma/client";

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{1,39}$/;

class PagingDto {
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

// ----- Vendors -------------------------------------------------------------

export class VendorQueryDto extends PagingDto {
  @ApiPropertyOptional({ enum: VendorStatus })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @ApiPropertyOptional({ enum: VendorCategory })
  @IsOptional()
  @IsEnum(VendorCategory)
  category?: VendorCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateVendorDto {
  @ApiProperty({ example: "VEN-2026-001" })
  @IsString()
  @Matches(CODE_PATTERN)
  code!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  legalName?: string;

  @ApiProperty({ enum: VendorCategory })
  @IsEnum(VendorCategory)
  category!: VendorCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @Length(3, 254)
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(7, 30)
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 20)
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 20)
  pan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  country?: string;

  @ApiPropertyOptional({ default: 30, minimum: 0, maximum: 365 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(365)
  paymentTermsDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}

// ----- Inventory -----------------------------------------------------------

export class InventoryItemQueryDto extends PagingDto {
  @ApiPropertyOptional({ enum: InventoryItemStatus })
  @IsOptional()
  @IsEnum(InventoryItemStatus)
  status?: InventoryItemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}

export class CreateInventoryItemDto {
  @ApiProperty({ example: "SKU-ROBO-KIT" })
  @IsString()
  @Matches(CODE_PATTERN)
  sku!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @ApiProperty()
  @IsString()
  @Length(2, 120)
  category!: string;

  @ApiPropertyOptional({ default: "EACH" })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  unitOfMeasure?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  reorderLevel?: number;
}

export class StockAdjustmentDto {
  @ApiProperty({ description: "Signed quantity delta; negative reduces stock" })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 500)
  note?: string;
}

// ----- Procurement ---------------------------------------------------------

export class PurchaseOrderQueryDto extends PagingDto {
  @ApiPropertyOptional({ enum: PurchaseOrderStatus })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreatePurchaseOrderItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiProperty({ minimum: 0.001 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity!: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost!: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: "PO-2026-001" })
  @IsString()
  @Matches(CODE_PATTERN)
  code!: string;

  @ApiProperty()
  @IsUUID()
  vendorId!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional({ default: "INR" })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiProperty({ example: "2026-04-01" })
  @IsDateString()
  orderDate!: string;

  @ApiPropertyOptional({ example: "2026-04-20" })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;

  @ApiProperty({ type: [CreatePurchaseOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items!: CreatePurchaseOrderItemDto[];
}

// ----- Assets --------------------------------------------------------------

export class AssetQueryDto extends PagingDto {
  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({ enum: AssetCategory })
  @IsOptional()
  @IsEnum(AssetCategory)
  category?: AssetCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateAssetDto {
  @ApiProperty({ example: "AST-2026-001" })
  @IsString()
  @Matches(CODE_PATTERN)
  assetTag!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ enum: AssetCategory })
  @IsEnum(AssetCategory)
  category!: AssetCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  serialNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchaseCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  acquiredOn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warrantyEndsOn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}

export class AssignAssetDto {
  @ApiProperty()
  @IsUUID()
  assignedEmployeeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  location?: string;
}
