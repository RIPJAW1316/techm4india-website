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
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateMouDto } from './dto/create-mou.dto';
import { InstitutionType, MouStatus, NaacRating } from '@prisma/client';

@ApiTags('Institutions & MoUs')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all partner institutions & colleges with NAAC/AISHE metadata' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: InstitutionType })
  @ApiQuery({ name: 'naacRating', required: false, enum: NaacRating })
  async getInstitutions(
    @Query('search') search?: string,
    @Query('type') type?: InstitutionType,
    @Query('naacRating') naacRating?: NaacRating,
  ) {
    return this.institutionsService.getInstitutions({ search, type, naacRating });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new partner college, university, or school' })
  @ApiResponse({ status: 201, description: 'Institution successfully registered' })
  async createInstitution(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.createInstitution(dto);
  }

  @Get('health-leaderboard')
  @ApiOperation({ summary: 'Get top 10 institutions ranked by relationship health score' })
  async getHealthLeaderboard() {
    return this.institutionsService.getHealthLeaderboard();
  }

  @Get('mous')
  @ApiOperation({ summary: 'List all partnership MoUs with status filter' })
  @ApiQuery({ name: 'institutionId', required: false, type: String })
  async getMous(@Query('institutionId') institutionId?: string) {
    return this.institutionsService.getMous(institutionId);
  }

  @Post('mous')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a signed Institutional Partnership MoU' })
  async createMou(@Body() dto: CreateMouDto) {
    return this.institutionsService.createMou(dto);
  }

  @Patch('mous/:mouId/status')
  @ApiOperation({ summary: 'Update MoU status (ACTIVE, RENEWAL_DUE, EXPIRED, TERMINATED)' })
  async updateMouStatus(
    @Param('mouId') mouId: string,
    @Body('status') status: MouStatus,
  ) {
    return this.institutionsService.updateMouStatus(mouId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comprehensive 360° institution dossier with MoUs and batches' })
  async getInstitutionById(@Param('id') id: string) {
    return this.institutionsService.getInstitutionById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update institutional profile attributes' })
  async updateInstitution(
    @Param('id') id: string,
    @Body() dto: UpdateInstitutionDto,
  ) {
    return this.institutionsService.updateInstitution(id, dto);
  }
}
