import { Priority, TaskStatus } from "@prisma/client";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class UpdateExecutiveTaskDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional() @IsString() @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional() @IsUUID()
  assigneeEmployeeId?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional() @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional() @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional() @IsDateString()
  dueDate?: string;
}
