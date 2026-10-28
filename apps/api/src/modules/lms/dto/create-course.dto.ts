import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { DifficultyLevel } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'CRS-AI-01', description: 'Unique course code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'ROS2 & Edge AI Fundamentals' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Robotics & Autonomous Systems' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'Parent Academic Program ID' })
  @IsUUID()
  @IsOptional()
  programId?: string;

  @ApiPropertyOptional({ description: 'Assigned Instructor Employee ID' })
  @IsUUID()
  @IsOptional()
  instructorEmployeeId?: string;

  @ApiPropertyOptional({ example: 'https://cdn.techm4india.com/thumbnails/ros2.png' })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ enum: DifficultyLevel, default: DifficultyLevel.BEGINNER })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
