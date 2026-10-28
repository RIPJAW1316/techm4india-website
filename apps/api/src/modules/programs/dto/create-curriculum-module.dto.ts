import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCurriculumModuleDto {
  @ApiProperty({ example: 1, description: 'Sequential module number' })
  @IsInt()
  @Min(1)
  moduleNumber: number;

  @ApiProperty({ example: 'ROS2 Architecture & Nodes', description: 'Module title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Fundamentals of publishers, subscribers, and ROS2 daemon architecture' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  totalHours?: number;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsInt()
  @Min(0)
  @IsOptional()
  labHours?: number;

  @ApiPropertyOptional({ example: 8, default: 8 })
  @IsInt()
  @Min(0)
  @IsOptional()
  theoryHours?: number;
}
