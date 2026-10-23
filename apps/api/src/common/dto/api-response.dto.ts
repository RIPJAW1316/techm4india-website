import { ApiProperty } from '@nestjs/swagger';

export class StandardSuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2026-10-23T18:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'f3a9e108-9b81-4286-9dc9-4a905a8bbf43' })
  correlationId: string;
}

export class StandardErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string | string[];

  @ApiProperty({ example: '2026-10-23T18:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/health' })
  path: string;

  @ApiProperty({ example: 'f3a9e108-9b81-4286-9dc9-4a905a8bbf43' })
  correlationId: string;
}
