import { Priority } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateExecutiveTaskDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  projectId!: string;

  @ApiProperty({ maxLength: 200 })
  @IsString() @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional() @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional() @IsDateString()
  dueDate?: string;
}
