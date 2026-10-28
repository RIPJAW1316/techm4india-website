import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GrievanceCategory } from '@prisma/client';

export class CreateGrievanceDto {
  @ApiProperty({
    enum: GrievanceCategory,
    example: GrievanceCategory.LAB_EQUIPMENT,
    description: 'Category: ACADEMIC, LAB_EQUIPMENT, FACULTY, PORTAL_ACCESS, FEES_BILLING',
  })
  @IsEnum(GrievanceCategory)
  @IsNotEmpty()
  category: GrievanceCategory;

  @ApiProperty({ example: 'LiDAR Sensor Calibration Error in Robotics Lab 3' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'Unit 4 LiDAR module fails to publish /scan pointcloud on ROS2 Humble rig during afternoon lab session.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
