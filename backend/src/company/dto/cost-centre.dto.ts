import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CostCentreQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() divisionId?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === undefined ? undefined : value === true || value === "true") @IsBoolean() isActive?: boolean;
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class CreateCostCentreDto {
  @ApiProperty() @IsString() @MaxLength(40) code!: string;
  @ApiProperty() @IsString() @MaxLength(160) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() divisionId?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateCostCentreDto extends PartialType(CreateCostCentreDto) {}
