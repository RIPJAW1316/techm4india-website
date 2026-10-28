import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateCostCentreDto } from './dto/create-cost-centre.dto';
import { UpdateCostCentreBudgetDto } from './dto/update-cost-centre-budget.dto';
import { DivisionCode } from '@prisma/client';

@ApiTags('Company & Organization Master')
@Controller('company')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  // =========================================================================
  // Corporate Profile
  // =========================================================================

  @Get('profile')
  @ApiOperation({ summary: 'Get complete corporate legal master profile' })
  async getProfile() {
    return this.orgService.getCompanyProfile();
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update corporate legal details (CIN, GSTIN, PAN, HQ Address)' })
  async updateProfile(@Body() dto: UpdateOrganizationDto) {
    return this.orgService.updateCompanyProfile(dto);
  }

  // =========================================================================
  // 5-Division Business Matrix
  // =========================================================================

  @Get('divisions')
  @ApiOperation({ summary: 'List the 5 TechM4 business divisions with live program & cost centre counts' })
  async getDivisions() {
    return this.orgService.getDivisions();
  }

  // =========================================================================
  // Multi-Branch Directory
  // =========================================================================

  @Get('branches')
  @ApiOperation({ summary: 'List company branch offices and regional centers' })
  @ApiQuery({ name: 'isHeadquarters', required: false, type: Boolean })
  async getBranches(@Query('isHeadquarters') isHq?: string) {
    const isHqBool = isHq !== undefined ? isHq === 'true' : undefined;
    return this.orgService.getBranches(isHqBool);
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new company branch office' })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  async createBranch(@Body() dto: CreateBranchDto) {
    return this.orgService.createBranch(dto);
  }

  // =========================================================================
  // Departments
  // =========================================================================

  @Get('departments')
  @ApiOperation({ summary: 'List corporate departments with employee & designation counts' })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getDepartments(@Query('search') search?: string) {
    return this.orgService.getDepartments(search);
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new corporate department' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.orgService.createDepartment(dto);
  }

  // =========================================================================
  // Cost Centres & Budget Allocations
  // =========================================================================

  @Get('cost-centres')
  @ApiOperation({ summary: 'List cost centres with annual budget and utilization tracking' })
  @ApiQuery({ name: 'division', required: false, enum: DivisionCode })
  async getCostCentres(@Query('division') division?: DivisionCode) {
    return this.orgService.getCostCentres(division);
  }

  @Post('cost-centres')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new cost centre with budget allocation' })
  async createCostCentre(@Body() dto: CreateCostCentreDto) {
    return this.orgService.createCostCentre(dto);
  }

  @Patch('cost-centres/:id/budget')
  @ApiOperation({ summary: 'Update annual allocated budget and utilized spend for cost centre' })
  async updateCostCentreBudget(
    @Param('id') id: string,
    @Body() dto: UpdateCostCentreBudgetDto,
  ) {
    return this.orgService.updateCostCentreBudget(id, dto);
  }
}
