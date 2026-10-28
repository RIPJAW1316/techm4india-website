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
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealStageDto } from './dto/update-deal-stage.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { DealStage, LeadStatus, LeadVertical } from '@prisma/client';

@ApiTags('CRM & Institutional Partnerships')
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // =========================================================================
  // Leads
  // =========================================================================

  @Get('leads')
  @ApiOperation({ summary: 'List CRM leads across 8 TechM4 sector verticals' })
  @ApiQuery({ name: 'vertical', required: false, enum: LeadVertical })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getLeads(
    @Query('vertical') vertical?: LeadVertical,
    @Query('status') status?: LeadStatus,
    @Query('search') search?: string,
  ) {
    return this.crmService.getLeads({ vertical, status, search });
  }

  @Post('leads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Capture new institutional prospect / lead' })
  @ApiResponse({ status: 201, description: 'Lead successfully created with automated scoring' })
  async createLead(@Body() dto: CreateLeadDto) {
    return this.crmService.createLead(dto);
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get full lead dossier by ID' })
  async getLeadById(@Param('id') id: string) {
    return this.crmService.getLeadById(id);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update lead attributes, score, or stage' })
  async updateLead(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLeadDto>,
  ) {
    return this.crmService.updateLead(id, dto);
  }

  @Post('leads/:id/convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '1-Click Atomic Conversion: Converts lead to Institution + Contact + Deal' })
  @ApiResponse({ status: 200, description: 'Lead successfully promoted into Account, Contact, and Deal' })
  async convertLead(
    @Param('id') id: string,
    @Body() dto: ConvertLeadDto,
  ) {
    return this.crmService.convertLead(id, dto);
  }

  // =========================================================================
  // Deals & Kanban
  // =========================================================================

  @Get('deals')
  @ApiOperation({ summary: 'List deals with stage and vertical filters' })
  @ApiQuery({ name: 'vertical', required: false, enum: LeadVertical })
  @ApiQuery({ name: 'stage', required: false, enum: DealStage })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getDeals(
    @Query('vertical') vertical?: LeadVertical,
    @Query('stage') stage?: DealStage,
    @Query('search') search?: string,
  ) {
    return this.crmService.getDeals({ vertical, stage, search });
  }

  @Get('deals/kanban')
  @ApiOperation({ summary: 'Get deals aggregated by 6 Kanban pipeline stages with totals' })
  async getKanbanDeals() {
    return this.crmService.getKanbanDeals();
  }

  @Post('deals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new commercial deal in pipeline' })
  async createDeal(@Body() dto: CreateDealDto) {
    return this.crmService.createDeal(dto);
  }

  @Patch('deals/:id/stage')
  @ApiOperation({ summary: 'Advance deal stage with probability update and history log' })
  async updateDealStage(
    @Param('id') id: string,
    @Body() dto: UpdateDealStageDto,
  ) {
    return this.crmService.updateDealStage(id, dto);
  }

  // =========================================================================
  // Quotes & Finance Bridge
  // =========================================================================

  @Get('quotes')
  @ApiOperation({ summary: 'List sales quotations with line items and GST' })
  @ApiQuery({ name: 'dealId', required: false, type: String })
  async getQuotes(@Query('dealId') dealId?: string) {
    return this.crmService.getQuotes(dealId);
  }

  @Post('quotes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate commercial quotation with 18% GST calculation' })
  async createQuote(@Body() dto: CreateQuoteDto) {
    return this.crmService.createQuote(dto);
  }

  @Post('quotes/:id/push-to-finance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '1-Click Bridge: Converts accepted Quote into Accounts Receivable Invoice in Finance ERP' })
  async pushQuoteToFinance(@Param('id') id: string) {
    return this.crmService.pushQuoteToFinance(id);
  }

  // =========================================================================
  // Reports
  // =========================================================================

  @Get('reports/summary')
  @ApiOperation({ summary: 'Executive summary of sales pipeline value, win rate, and metrics' })
  async getReportsSummary() {
    return this.crmService.getReportsSummary();
  }
}
