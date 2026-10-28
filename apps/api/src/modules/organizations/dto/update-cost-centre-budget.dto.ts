import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateCostCentreBudgetDto {
  @ApiPropertyOptional({ example: 3000000, description: 'Revised annual budget in INR' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetAnnual?: number;

  @ApiPropertyOptional({ example: 450000, description: 'Utilized budget spend in INR' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetUtilized?: number;
}
