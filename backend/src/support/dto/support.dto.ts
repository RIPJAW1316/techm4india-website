import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, Length, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Priority, SupportTicketCategory, SupportTicketStatus } from "@prisma/client";

export class SupportTicketQueryDto {
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

  @ApiPropertyOptional({ enum: SupportTicketStatus })
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @ApiPropertyOptional({ enum: SupportTicketCategory })
  @IsOptional()
  @IsEnum(SupportTicketCategory)
  category?: SupportTicketCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assigneeEmployeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateSupportTicketDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  subject!: string;

  @ApiProperty()
  @IsString()
  @Length(5, 5000)
  description!: string;

  @ApiProperty({ enum: SupportTicketCategory })
  @IsEnum(SupportTicketCategory)
  category!: SupportTicketCategory;

  @ApiPropertyOptional({ enum: Priority, default: "MEDIUM" })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}

export class AssignSupportTicketDto {
  @ApiProperty()
  @IsUUID()
  assigneeEmployeeId!: string;
}

export class AddSupportCommentDto {
  @ApiProperty()
  @IsString()
  @Length(1, 5000)
  body!: string;

  @ApiPropertyOptional({ description: "Internal notes are hidden from the requester" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isInternal?: boolean;
}
