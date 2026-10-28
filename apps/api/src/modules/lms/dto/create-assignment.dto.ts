import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'LiDAR SLAM Mapping Mini-Project' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'Write a ROS2 node that subscribes to /scan LaserScan and publishes an OccupancyGrid map in RViz.',
  })
  @IsString()
  @IsNotEmpty()
  problemStatement: string;

  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsInt()
  @Min(10)
  @Max(500)
  @IsOptional()
  maxScore?: number;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
