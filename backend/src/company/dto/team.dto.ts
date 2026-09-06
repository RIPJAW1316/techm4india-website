import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { TeamMemberRole } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class TeamQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() divisionId?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === undefined ? undefined : value === true || value === "true") @IsBoolean() isActive?: boolean;
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class CreateTeamDto {
  @ApiProperty() @IsString() @MaxLength(40) code!: string;
  @ApiProperty() @IsString() @MaxLength(160) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() divisionId?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID() leadEmployeeId?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}

export class AddTeamMemberDto {
  @ApiProperty({ format: "uuid" }) @IsUUID() employeeId!: string;
  @ApiPropertyOptional({ enum: TeamMemberRole, default: TeamMemberRole.MEMBER }) @IsOptional() @IsEnum(TeamMemberRole) role?: TeamMemberRole;
}
