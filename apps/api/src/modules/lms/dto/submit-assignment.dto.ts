import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiPropertyOptional({ description: 'Assignment ID (if not provided in route path)' })
  @IsUUID()
  @IsOptional()
  assignmentId?: string;

  @ApiProperty({ description: 'Submitting Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 'https://github.com/student/ros2-lidar-slam' })
  @IsUrl()
  @IsOptional()
  repoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.techm4india.com/submissions/report.pdf' })
  @IsUrl()
  @IsOptional()
  attachmentUrl?: string;
}
