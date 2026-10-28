import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ example: 95, description: 'Score awarded to submission' })
  @IsInt()
  @Min(0)
  scoreAwarded: number;

  @ApiPropertyOptional({
    example: 'Excellent node design and clear README documentation with RViz screenshot.',
  })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiPropertyOptional({ description: 'Grading Instructor or Admin Employee ID' })
  @IsUUID()
  @IsOptional()
  gradedById?: string;
}
