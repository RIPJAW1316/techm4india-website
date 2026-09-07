import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EmploymentStatus, UserStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class AdminUserQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) role?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() division?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() department?: string;
  @ApiPropertyOptional({ enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;
  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  accountStatus?: UserStatus;
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class AssignUserRoleDto {
  @ApiProperty({ format: "uuid" }) @IsUUID() roleId!: string;
}
