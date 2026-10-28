import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from './crm.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DealStage, LeadStatus, LeadVertical, QuoteStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('CrmService', () => {
  let service: CrmService;
  let prisma: any;

  const mockPrismaService = {
    lead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(5),
      create: jest.fn(),
      update: jest.fn(),
    },
    deal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(3),
      create: jest.fn(),
      update: jest.fn(),
    },
    dealStageHistory: {
      create: jest.fn(),
    },
    quote: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(2),
      create: jest.fn(),
      update: jest.fn(),
    },
    institution: {
      findFirst: jest.fn(),
      count: jest.fn().mockResolvedValue(4),
      create: jest.fn(),
    },
    contact: {
      create: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
      count: jest.fn().mockResolvedValue(10),
      create: jest.fn(),
    },
    invoice: {
      count: jest.fn().mockResolvedValue(15),
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation((cb) => cb(mockPrismaService));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLead', () => {
    it('should generate leadNumber and compute dynamic score', async () => {
      prisma.lead.count.mockResolvedValue(8);
      prisma.lead.create.mockImplementation((args: any) => ({
        id: 'ld-new',
        ...args.data,
      }));

      const result = await service.createLead({
        institutionName: 'Osmania University College of Engineering',
        vertical: LeadVertical.ENGINEERING_COLLEGES,
        contactPerson: 'Dr. Rajesh Varma',
        email: 'dean@osmania.ac.in',
        phone: '+91 94401 23456',
        city: 'Hyderabad',
        estimatedBudget: 1500000,
      });

      expect(result.leadNumber).toMatch(/^TM4I-LD-2026-\d{3}$/);
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.institutionName).toBe('Osmania University College of Engineering');
    });
  });

  describe('convertLead (1-Click Atomic Conversion)', () => {
    it('should reject already converted lead', async () => {
      prisma.lead.findUnique.mockResolvedValue({
        id: 'ld-1',
        leadNumber: 'TM4I-LD-2026-001',
        isConverted: true,
      });

      await expect(service.convertLead('ld-1', {})).rejects.toThrow(BadRequestException);
    });

    it('should atomically create institution, contact, deal and mark lead as won', async () => {
      const mockLead = {
        id: 'ld-1',
        leadNumber: 'TM4I-LD-2026-001',
        institutionName: 'Osmania University',
        contactPerson: 'Rajesh Varma',
        email: 'dean@osmania.ac.in',
        phone: '+91 94401 23456',
        city: 'Hyderabad',
        state: 'Telangana',
        vertical: LeadVertical.ENGINEERING_COLLEGES,
        estimatedBudget: new Decimal(1500000),
        score: 88,
        isConverted: false,
      };

      prisma.lead.findUnique.mockResolvedValue(mockLead);
      prisma.institution.findFirst.mockResolvedValue(null);
      prisma.institution.count.mockResolvedValue(5);
      prisma.institution.create.mockResolvedValue({ id: 'inst-new', name: 'Osmania University' });
      prisma.contact.create.mockResolvedValue({ id: 'con-new', firstName: 'Rajesh', lastName: 'Varma' });
      prisma.deal.count.mockResolvedValue(3);
      prisma.deal.create.mockResolvedValue({
        id: 'dl-new',
        dealNumber: 'TM4I-DL-2026-004',
        amount: new Decimal(1500000),
        stage: DealStage.QUALIFICATION,
      });
      prisma.dealStageHistory.create.mockResolvedValue({});
      prisma.lead.update.mockResolvedValue({ ...mockLead, isConverted: true, status: LeadStatus.WON });

      const result = await service.convertLead('ld-1', { dealAmount: 1500000 });

      expect(result.success).toBe(true);
      expect(result.account).toBeDefined();
      expect(result.contact).toBeDefined();
      expect(result.deal).toBeDefined();
      expect(prisma.deal.create).toHaveBeenCalled();
      expect(prisma.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ld-1' },
          data: expect.objectContaining({ isConverted: true, status: LeadStatus.WON }),
        }),
      );
    });
  });

  describe('getKanbanDeals', () => {
    it('should group deals by 6 Kanban stages and compute pipeline totals', async () => {
      const mockDeals = [
        { id: 'd1', stage: DealStage.QUALIFICATION, amount: new Decimal(1000000), probabilityPct: 10 },
        { id: 'd2', stage: DealStage.PROPOSAL_QUOTE, amount: new Decimal(2000000), probabilityPct: 50 },
        { id: 'd3', stage: DealStage.CLOSED_WON, amount: new Decimal(1500000), probabilityPct: 100 },
      ];
      prisma.deal.findMany.mockResolvedValue(mockDeals);

      const kanban = await service.getKanbanDeals();

      expect(kanban.stages[DealStage.QUALIFICATION].count).toBe(1);
      expect(kanban.stages[DealStage.PROPOSAL_QUOTE].count).toBe(1);
      expect(kanban.stages[DealStage.CLOSED_WON].count).toBe(1);
      expect(kanban.summary.totalDeals).toBe(3);
      expect(kanban.summary.totalPipelineValue).toBe(4500000);
      expect(kanban.summary.weightedPipelineValue).toBe(100000 + 1000000 + 1500000);
    });
  });

  describe('updateDealStage', () => {
    it('should advance deal stage and log transition in dealStageHistory', async () => {
      prisma.deal.findUnique.mockResolvedValue({
        id: 'dl-1',
        stage: DealStage.QUALIFICATION,
      });
      prisma.deal.update.mockResolvedValue({
        id: 'dl-1',
        stage: DealStage.PROPOSAL_QUOTE,
        probabilityPct: 50,
      });
      prisma.dealStageHistory.create.mockResolvedValue({});

      const updated = await service.updateDealStage('dl-1', {
        stage: DealStage.PROPOSAL_QUOTE,
        notes: 'Quote presented to academic council',
      });

      expect(updated.stage).toBe(DealStage.PROPOSAL_QUOTE);
      expect(prisma.dealStageHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromStage: DealStage.QUALIFICATION,
            toStage: DealStage.PROPOSAL_QUOTE,
          }),
        }),
      );
    });
  });

  describe('pushQuoteToFinance', () => {
    it('should bridge quote to Finance AR invoice and update quote status', async () => {
      const mockQuote = {
        id: 'qt-1',
        quoteNumber: 'QT-2026-001',
        status: QuoteStatus.DRAFT,
        subtotal: new Decimal(1000000),
        discount: new Decimal(0),
        cgstAmount: new Decimal(90000),
        sgstAmount: new Decimal(90000),
        igstAmount: new Decimal(0),
        totalAmount: new Decimal(1180000),
        items: [
          {
            description: 'Robotics Kit Rig',
            hsnSacCode: '998334',
            quantity: new Decimal(1),
            unitRate: new Decimal(1000000),
            taxableAmount: new Decimal(1000000),
            totalAmount: new Decimal(1180000),
          },
        ],
        institution: {
          name: 'Osmania University',
          city: 'Hyderabad',
          primaryContactEmail: 'dean@osmania.ac.in',
        },
      };

      prisma.quote.findUnique.mockResolvedValue(mockQuote);
      prisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', name: 'Osmania University' });
      prisma.invoice.count.mockResolvedValue(41);
      prisma.invoice.create.mockResolvedValue({
        id: 'inv-42',
        invoiceNumber: 'TM4I-INV-2026-042',
        totalAmount: new Decimal(1180000),
      });
      prisma.quote.update.mockResolvedValue({ ...mockQuote, status: QuoteStatus.INVOICED });

      const result = await service.pushQuoteToFinance('qt-1');

      expect(result.success).toBe(true);
      expect(result.invoiceNumber).toBe('TM4I-INV-2026-042');
      expect(prisma.invoice.create).toHaveBeenCalled();
      expect(prisma.quote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'qt-1' },
          data: expect.objectContaining({ status: QuoteStatus.INVOICED }),
        }),
      );
    });
  });
});
