import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateBatchSessionDto {
  @ApiProperty({ example: 1, description: 'Sequential session number' })
  @IsInt()
  @Min(1)
  sessionNumber: number;

  @ApiProperty({ example: 'ROS2 Node Lifecycle & Publisher/Subscriber Mechanics' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ example: '2026-08-05T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiPropertyOptional({ example: 90, default: 90 })
  @IsInt()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'https://meet.google.com/xyz-abcd-efg' })
  @IsUrl()
  @IsOptional()
  meetingUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
