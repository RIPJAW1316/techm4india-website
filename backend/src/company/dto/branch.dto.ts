import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { BranchType } from "@prisma/client";
import { IsBoolean, IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class BranchQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional({ enum: BranchType }) @IsOptional() @IsEnum(BranchType) type?: BranchType;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === undefined ? undefined : value === true || value === "true") @IsBoolean() isActive?: boolean;
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class CreateBranchDto {
  @ApiProperty() @IsString() @MaxLength(40) code!: string;
  @ApiProperty() @IsString() @MaxLength(160) name!: string;
  @ApiPropertyOptional({ enum: BranchType }) @IsOptional() @IsEnum(BranchType) type?: BranchType;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(250) addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(250) addressLine2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) postalCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
