import { Priority, ProjectStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateProjectDto {
  @IsString() @MaxLength(40) code!: string;
  @IsString() @MaxLength(160) name!: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsUUID() divisionId!: string;
  @IsOptional() @IsUUID() projectManagerId?: string;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) progress?: number;
}
