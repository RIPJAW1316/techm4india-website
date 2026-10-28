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
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateCurriculumModuleDto } from './dto/create-curriculum-module.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchStatusDto } from './dto/update-batch-status.dto';
import { CreateBatchSessionDto } from './dto/create-batch-session.dto';
import { BatchStatus, DivisionCode } from '@prisma/client';

@ApiTags('Academic Programs & Batches')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'List academic programs with division and status filters' })
  @ApiQuery({ name: 'division', required: false, enum: DivisionCode })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getPrograms(
    @Query('division') division?: DivisionCode,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.programsService.findAllPrograms({
      division,
      isActive: activeBool,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complete program details with modules, batches, and courses' })
  async getProgramById(@Param('id') id: string) {
    return this.programsService.findProgramById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new academic program with curriculum modules' })
  @ApiResponse({ status: 201, description: 'Academic program created successfully' })
  async createProgram(@Body() dto: CreateProgramDto) {
    return this.programsService.createProgram(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update academic program specifications' })
  async updateProgram(
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.updateProgram(id, dto);
  }

  @Post(':id/modules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add curriculum module to program' })
  async addModule(
    @Param('id') id: string,
    @Body() dto: CreateCurriculumModuleDto,
  ) {
    return this.programsService.addCurriculumModule(id, dto);
  }

  @Get(':id/batches')
  @ApiOperation({ summary: 'List all batches scheduled for this program' })
  async getProgramBatches(@Param('id') id: string) {
    return this.programsService.findBatchesByProgram(id);
  }

  @Post(':id/batches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule new student cohort / batch for this program' })
  async createBatch(
    @Param('id') id: string,
    @Body() dto: CreateBatchDto,
  ) {
    return this.programsService.createBatch({ ...dto, programId: id });
  }

  @Patch('batches/:batchId/status')
  @ApiOperation({ summary: 'Transition batch lifecycle status (UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED)' })
  async updateBatchStatus(
    @Param('batchId') batchId: string,
    @Body() dto: UpdateBatchStatusDto,
  ) {
    return this.programsService.updateBatchStatus(batchId, dto.status);
  }

  @Post('batches/:batchId/sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule lecture or lab session for a batch' })
  async createBatchSession(
    @Param('batchId') batchId: string,
    @Body() dto: CreateBatchSessionDto,
  ) {
    return this.programsService.createBatchSession(batchId, dto);
  }
}
