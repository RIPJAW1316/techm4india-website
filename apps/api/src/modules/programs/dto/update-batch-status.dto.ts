import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BatchStatus } from '@prisma/client';

export class UpdateBatchStatusDto {
  @ApiProperty({ enum: BatchStatus, example: BatchStatus.IN_PROGRESS })
  @IsEnum(BatchStatus)
  @IsNotEmpty()
  status: BatchStatus;
}
