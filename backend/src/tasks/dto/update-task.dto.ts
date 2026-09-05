import { Priority, TaskStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class UpdateTaskDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsOptional() @IsUUID() assigneeEmployeeId?: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsDateString() dueDate?: string;
}
