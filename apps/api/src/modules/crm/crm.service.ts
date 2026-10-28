import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealStageDto } from './dto/update-deal-stage.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { DealStage, InvoiceType, LeadStatus, LeadVertical, QuoteStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // 1. Leads Management
  // =========================================================================

  async getLeads(params?: {
    vertical?: LeadVertical;
    status?: LeadStatus;
    search?: string;
  }) {
    const where: any = {};

    if (params?.vertical) {
      where.vertical = params.vertical;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.search) {
      where.OR = [
        { institutionName: { contains: params.search, mode: 'insensitive' } },
        { contactPerson: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
        { leadNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getLeadById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found.`);
    }
    return lead;
  }

  async createLead(dto: CreateLeadDto) {
    const count = await this.prisma.lead.count();
    const currentYear = new Date().getFullYear();
    const leadNumber = `TM4I-LD-${currentYear}-${String(count + 1).padStart(3, '0')}`;

    // Dynamic Lead Scoring
    let computedScore = dto.score ?? 50;
    if (dto.phone && dto.email) computedScore += 15;
    if (dto.estimatedBudget && dto.estimatedBudget >= 1000000) computedScore += 15;
    if (dto.vertical === LeadVertical.UNIVERSITIES_AUTONOMOUS || dto.vertical === LeadVertical.ENGINEERING_COLLEGES) {
      computedScore += 10;
    }
    computedScore = Math.min(100, Math.max(10, computedScore));

    return this.prisma.lead.create({
      data: {
        leadNumber,
        institutionName: dto.institutionName,
        vertical: dto.vertical || LeadVertical.ENGINEERING_COLLEGES,
        contactPerson: dto.contactPerson,
        designation: dto.designation,
        email: dto.email,
        phone: dto.phone,
        city: dto.city,
        state: dto.state || 'Telangana',
        source: dto.source || 'CAMPUS_OUTREACH',
        score: computedScore,
        status: dto.status || LeadStatus.NEW,
        estimatedBudget: dto.estimatedBudget ? new Decimal(dto.estimatedBudget) : null,
        notes: dto.notes,
      },
    });
  }

  async updateLead(id: string, data: Partial<CreateLeadDto>) {
    await this.getLeadById(id);
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...data,
        estimatedBudget: data.estimatedBudget ? new Decimal(data.estimatedBudget) : undefined,
      },
    });
  }

  // =========================================================================
  // 2. 1-Click Atomic Lead Conversion Engine
  // Promotes raw lead into: Institution (Account) + Contact + Kanban Deal
  // =========================================================================

  async convertLead(id: string, dto: ConvertLeadDto) {
    const lead = await this.getLeadById(id);

    if (lead.isConverted) {
      throw new BadRequestException(`Lead ${lead.leadNumber} is already converted.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Account / Institution: Find existing or create new
      let institution = await tx.institution.findFirst({
        where: { name: { equals: dto.customAccountName || lead.institutionName, mode: 'insensitive' } },
      });

      if (!institution) {
        const instCount = await tx.institution.count();
        const instCode = `INST-${String(instCount + 1).padStart(3, '0')}`;
        institution = await tx.institution.create({
          data: {
            code: instCode,
            name: dto.customAccountName || lead.institutionName,
            city: lead.city,
            state: lead.state,
            primaryContactName: lead.contactPerson,
            primaryContactEmail: lead.email,
            primaryContactPhone: lead.phone,
            healthScore: Math.max(75, lead.score),
          },
        });
      }

      // 2. Contact: Create or update primary contact
      const nameParts = lead.contactPerson.trim().split(' ');
      const firstName = nameParts[0] || 'Lead';
      const lastName = nameParts.slice(1).join(' ') || 'Stakeholder';

      const contact = await tx.contact.create({
        data: {
          institutionId: institution.id,
          firstName,
          lastName,
          email: lead.email,
          phone: lead.phone,
          designation: lead.designation,
          isPrimaryDecisionMaker: true,
        },
      });

      // 3. Deal: Create active commercial deal
      const dealCount = await tx.deal.count();
      const currentYear = new Date().getFullYear();
      const dealNumber = `TM4I-DL-${currentYear}-${String(dealCount + 1).padStart(3, '0')}`;

      const rawAmount = dto.dealAmount || (lead.estimatedBudget ? Number(lead.estimatedBudget) : 1500000);
      const stage = dto.stage || DealStage.QUALIFICATION;
      const probabilityPct = this.mapStageToProbability(stage);

      const closeDate = dto.closingDate
        ? new Date(dto.closingDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const deal = await tx.deal.create({
        data: {
          dealNumber,
          title: `${institution.name} — Institutional Engagement`,
          institutionId: institution.id,
          vertical: lead.vertical,
          amount: new Decimal(rawAmount),
          stage,
          probabilityPct,
          expectedCloseDate: closeDate,
          notes: `Converted from lead ${lead.leadNumber}. ${lead.notes || ''}`,
        },
      });

      // 4. Record Initial Stage History
      await tx.dealStageHistory.create({
        data: {
          dealId: deal.id,
          fromStage: DealStage.QUALIFICATION,
          toStage: stage,
          notes: `Lead converted to active deal. Initial probability ${probabilityPct}%.`,
        },
      });

      // 5. Update Lead State
      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          isConverted: true,
          status: LeadStatus.WON,
          convertedAccountId: institution.id,
          convertedDealId: deal.id,
          convertedAt: new Date(),
        },
      });

      return {
        success: true,
        lead: updatedLead,
        account: institution,
        contact,
        deal,
      };
    });
  }

  // =========================================================================
  // 3. Deals & 6-Stage Kanban Pipeline
  // =========================================================================

  async getDeals(params?: {
    vertical?: LeadVertical;
    stage?: DealStage;
    search?: string;
  }) {
    const where: any = {};

    if (params?.vertical) {
      where.vertical = params.vertical;
    }
    if (params?.stage) {
      where.stage = params.stage;
    }
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { dealNumber: { contains: params.search, mode: 'insensitive' } },
        { institution: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.deal.findMany({
      where,
      include: {
        institution: {
          select: { id: true, name: true, code: true, city: true, naacRating: true },
        },
        quotes: {
          select: { id: true, quoteNumber: true, totalAmount: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getKanbanDeals() {
    const deals = await this.prisma.deal.findMany({
      include: {
        institution: {
          select: { id: true, name: true, code: true, city: true, naacRating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stages: Record<DealStage, { count: number; totalAmount: number; deals: any[] }> = {
      [DealStage.QUALIFICATION]: { count: 0, totalAmount: 0, deals: [] },
      [DealStage.NEEDS_ANALYSIS]: { count: 0, totalAmount: 0, deals: [] },
      [DealStage.PROPOSAL_QUOTE]: { count: 0, totalAmount: 0, deals: [] },
      [DealStage.NEGOTIATION]: { count: 0, totalAmount: 0, deals: [] },
      [DealStage.CLOSED_WON]: { count: 0, totalAmount: 0, deals: [] },
      [DealStage.CLOSED_LOST]: { count: 0, totalAmount: 0, deals: [] },
    };

    let totalPipelineValue = 0;
    let weightedPipelineValue = 0;

    for (const deal of deals) {
      const amount = Number(deal.amount);
      if (stages[deal.stage]) {
        stages[deal.stage].count += 1;
        stages[deal.stage].totalAmount += amount;
        stages[deal.stage].deals.push(deal);
      }

      if (deal.stage !== DealStage.CLOSED_LOST) {
        totalPipelineValue += amount;
        weightedPipelineValue += (amount * deal.probabilityPct) / 100;
      }
    }

    return {
      stages,
      summary: {
        totalDeals: deals.length,
        totalPipelineValue,
        weightedPipelineValue: Math.round(weightedPipelineValue),
      },
    };
  }

  async createDeal(dto: CreateDealDto) {
    const count = await this.prisma.deal.count();
    const currentYear = new Date().getFullYear();
    const dealNumber = `TM4I-DL-${currentYear}-${String(count + 1).padStart(3, '0')}`;

    const stage = dto.stage || DealStage.QUALIFICATION;
    const probabilityPct = this.mapStageToProbability(stage);

    return this.prisma.$transaction(async (tx) => {
      const deal = await tx.deal.create({
        data: {
          dealNumber,
          title: dto.title,
          institutionId: dto.institutionId,
          vertical: dto.vertical || LeadVertical.ENGINEERING_COLLEGES,
          amount: new Decimal(dto.amount),
          stage,
          probabilityPct,
          expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
          ownerEmployeeId: dto.ownerEmployeeId,
          notes: dto.notes,
        },
        include: { institution: true },
      });

      await tx.dealStageHistory.create({
        data: {
          dealId: deal.id,
          fromStage: DealStage.QUALIFICATION,
          toStage: stage,
          notes: 'Deal created in pipeline.',
        },
      });

      return deal;
    });
  }

  async updateDealStage(id: string, dto: UpdateDealStageDto) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found.`);
    }

    const newProbability = this.mapStageToProbability(dto.stage);
    const isClosed = dto.stage === DealStage.CLOSED_WON || dto.stage === DealStage.CLOSED_LOST;

    return this.prisma.$transaction(async (tx) => {
      const updatedDeal = await tx.deal.update({
        where: { id },
        data: {
          stage: dto.stage,
          probabilityPct: newProbability,
          closedAt: isClosed ? new Date() : null,
        },
        include: { institution: true },
      });

      await tx.dealStageHistory.create({
        data: {
          dealId: deal.id,
          fromStage: deal.stage,
          toStage: dto.stage,
          notes: dto.notes || `Advanced stage to ${dto.stage}. Probability: ${newProbability}%.`,
        },
      });

      return updatedDeal;
    });
  }

  // =========================================================================
  // 4. Quotations & Finance ERP Bridge
  // =========================================================================

  async getQuotes(dealId?: string) {
    const where = dealId ? { dealId } : {};
    return this.prisma.quote.findMany({
      where,
      include: {
        items: true,
        institution: {
          select: { id: true, name: true, code: true, city: true },
        },
        deal: {
          select: { id: true, dealNumber: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuote(dto: CreateQuoteDto) {
    const count = await this.prisma.quote.count();
    const currentYear = new Date().getFullYear();
    const quoteNumber = `QT-${currentYear}-${String(count + 1).padStart(3, '0')}`;

    let subtotal = 0;
    const itemsData = dto.items.map((item) => {
      const taxable = item.quantity * item.unitRate;
      subtotal += taxable;
      const taxRate = item.taxRatePct ?? 18.0;
      const itemTax = (taxable * taxRate) / 100;
      return {
        description: item.description,
        hsnSacCode: item.hsnSacCode || '998334',
        quantity: new Decimal(item.quantity),
        unitRate: new Decimal(item.unitRate),
        taxRatePct: new Decimal(taxRate),
        taxableAmount: new Decimal(taxable),
        totalAmount: new Decimal(taxable + itemTax),
      };
    });

    const discount = dto.discount || 0;
    const taxableAfterDiscount = Math.max(0, subtotal - discount);

    // Default intra-state 18% GST (CGST 9% + SGST 9%)
    const cgstAmount = (taxableAfterDiscount * 9) / 100;
    const sgstAmount = (taxableAfterDiscount * 9) / 100;
    const igstAmount = 0;
    const totalAmount = taxableAfterDiscount + cgstAmount + sgstAmount + igstAmount;

    return this.prisma.quote.create({
      data: {
        quoteNumber,
        dealId: dto.dealId,
        institutionId: dto.institutionId,
        subtotal: new Decimal(subtotal),
        discount: new Decimal(discount),
        cgstAmount: new Decimal(cgstAmount),
        sgstAmount: new Decimal(sgstAmount),
        igstAmount: new Decimal(igstAmount),
        totalAmount: new Decimal(totalAmount),
        status: QuoteStatus.DRAFT,
        validUntil: new Date(dto.validUntil),
        notes: dto.notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        institution: true,
      },
    });
  }

  // 1-Click Commercial Bridge: Converts Quote into Active Accounts Receivable Invoice in Finance ERP
  async pushQuoteToFinance(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true, institution: true },
    });

    if (!quote) {
      throw new NotFoundException(`Quotation with ID ${quoteId} not found.`);
    }

    if (quote.status === QuoteStatus.INVOICED) {
      throw new BadRequestException(`Quotation ${quote.quoteNumber} has already been pushed to Finance ERP.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Resolve or Create Finance Customer
      const custName = quote.institution?.name || 'Institutional Client';
      const custEmail = quote.institution?.primaryContactEmail || 'billing@techm4india.com';
      const custPhone = quote.institution?.primaryContactPhone || '';
      const custCity = quote.institution?.city || 'Hyderabad';

      let customer = await tx.customer.findFirst({
        where: { name: { equals: custName, mode: 'insensitive' } },
      });

      if (!customer) {
        const custCount = await tx.customer.count();
        customer = await tx.customer.create({
          data: {
            code: `CUST-${String(custCount + 1).padStart(3, '0')}`,
            name: custName,
            email: custEmail,
            phone: custPhone,
            billingAddress: `${custCity}, Telangana`,
            placeOfSupply: 'Telangana',
            stateCode: '36',
          },
        });
      }

      // 2. Generate Invoice Number
      const invCount = await tx.invoice.count();
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `TM4I-INV-${currentYear}-${String(invCount + 1).padStart(3, '0')}`;

      // 3. Create Invoice in Finance Database
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: customer.id,
          type: InvoiceType.B2B,
          subtotal: quote.subtotal,
          discount: quote.discount,
          taxableAmount: new Decimal(Number(quote.subtotal) - Number(quote.discount)),
          cgst: quote.cgstAmount,
          sgst: quote.sgstAmount,
          igst: quote.igstAmount,
          totalAmount: quote.totalAmount,
          amountPaid: new Decimal(0),
          balanceDue: quote.totalAmount,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: `Generated from CRM Quotation ${quote.quoteNumber}.`,
          items: {
            create: quote.items.map((item) => ({
              description: item.description,
              hsnSacCode: item.hsnSacCode,
              quantity: item.quantity,
              unitPrice: item.unitRate,
              taxableAmount: item.taxableAmount,
              cgstAmount: new Decimal((Number(item.taxableAmount) * 9) / 100),
              sgstAmount: new Decimal((Number(item.taxableAmount) * 9) / 100),
              igstAmount: new Decimal(0),
              totalAmount: item.totalAmount,
            })),
          },
        },
      });

      // 4. Mark Quote as INVOICED
      await tx.quote.update({
        where: { id: quote.id },
        data: {
          status: QuoteStatus.INVOICED,
          invoicedAt: new Date(),
        },
      });

      return {
        success: true,
        message: `Successfully bridged quote ${quote.quoteNumber} to Finance ERP.`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.totalAmount),
        customerName: customer.name,
      };
    });
  }

  // =========================================================================
  // 5. Reports & Analytics Summary
  // =========================================================================

  async getReportsSummary() {
    const [leads, deals, wonDeals] = await Promise.all([
      this.prisma.lead.findMany({ select: { id: true, status: true, score: true, vertical: true } }),
      this.prisma.deal.findMany({ select: { id: true, amount: true, stage: true, vertical: true } }),
      this.prisma.deal.findMany({ where: { stage: DealStage.CLOSED_WON }, select: { amount: true } }),
    ]);

    const totalPipelineValue = deals.reduce((acc, d) => acc + Number(d.amount), 0);
    const totalWonRevenue = wonDeals.reduce((acc, d) => acc + Number(d.amount), 0);

    const winRate = deals.length > 0
      ? Math.round((wonDeals.length / deals.length) * 100)
      : 0;

    return {
      totalLeads: leads.length,
      totalDeals: deals.length,
      wonDealsCount: wonDeals.length,
      totalPipelineValue,
      totalWonRevenue,
      winRatePercentage: winRate,
      averageDealSize: deals.length > 0 ? Math.round(totalPipelineValue / deals.length) : 0,
    };
  }

  private mapStageToProbability(stage: DealStage): number {
    switch (stage) {
      case DealStage.QUALIFICATION:
        return 10;
      case DealStage.NEEDS_ANALYSIS:
        return 25;
      case DealStage.PROPOSAL_QUOTE:
        return 50;
      case DealStage.NEGOTIATION:
        return 75;
      case DealStage.CLOSED_WON:
        return 100;
      case DealStage.CLOSED_LOST:
        return 0;
      default:
        return 10;
    }
  }
}
