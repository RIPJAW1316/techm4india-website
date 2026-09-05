import { Priority, TaskStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

export enum DueFilter {
  TODAY = "today",
  OVERDUE = "overdue",
  UPCOMING = "upcoming",
}

export class TaskQueryDto {
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsEnum(DueFilter) due?: DueFilter;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
