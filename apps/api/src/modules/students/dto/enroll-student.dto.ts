import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class EnrollStudentDto {
  @ApiProperty({ description: 'Academic Batch ID to enroll into' })
  @IsUUID()
  @IsNotEmpty()
  batchId: string;
}
