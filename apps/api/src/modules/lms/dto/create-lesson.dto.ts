import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { LessonContentType } from '@prisma/client';

export class CreateLessonDto {
  @ApiProperty({ example: 1, description: 'Sequential lesson number within course' })
  @IsInt()
  @Min(1)
  lessonNumber: number;

  @ApiProperty({ example: 'Setting up ROS2 Humble inside Docker' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: LessonContentType, default: LessonContentType.VIDEO })
  @IsEnum(LessonContentType)
  @IsNotEmpty()
  contentType: LessonContentType;

  @ApiPropertyOptional({ example: 'https://cdn.techm4india.com/lms/videos/ros2-setup.mp4' })
  @IsUrl()
  @IsOptional()
  contentUrl?: string;

  @ApiPropertyOptional({ example: 45, default: 30 })
  @IsInt()
  @Min(5)
  @IsOptional()
  durationMinutes?: number;
}
