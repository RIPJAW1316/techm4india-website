import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'BLR-01', description: 'Unique branch code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Bengaluru Innovation Center' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Bengaluru' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Karnataka' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ example: 'India', default: 'India' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isHeadquarters?: boolean;
}
