import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { InstitutionType, NaacRating, MouStatus } from '@prisma/client';

describe('InstitutionsService', () => {
  let service: InstitutionsService;
  let prisma: any;

  const mockPrismaService = {
    institution: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(4),
      create: jest.fn(),
      update: jest.fn(),
    },
    moU: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InstitutionsService>(InstitutionsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInstitutions', () => {
    it('should query institutions with count metadata', async () => {
      const mockList = [
        {
          id: 'inst-1',
          code: 'INST-001',
          name: 'Osmania University College of Engineering',
          type: InstitutionType.GOVERNMENT_UNIVERSITY,
          naacRating: NaacRating.A_PLUS_PLUS,
          healthScore: 94,
          _count: { mous: 1, batches: 2, deals: 1, contacts: 3 },
        },
      ];
      prisma.institution.findMany.mockResolvedValue(mockList);

      const result = await service.getInstitutions({ search: 'Osmania' });
      expect(result).toEqual(mockList);
      expect(prisma.institution.findMany).toHaveBeenCalled();
    });
  });

  describe('getInstitutionById', () => {
    it('should return institution dossier when found', async () => {
      const mockInst = {
        id: 'inst-1',
        name: 'Osmania University',
        contacts: [],
        mous: [],
        deals: [],
        batches: [],
      };
      prisma.institution.findUnique.mockResolvedValue(mockInst);

      const result = await service.getInstitutionById('inst-1');
      expect(result).toEqual(mockInst);
    });

    it('should throw NotFoundException when institution does not exist', async () => {
      prisma.institution.findUnique.mockResolvedValue(null);
      await expect(service.getInstitutionById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createInstitution', () => {
    it('should generate INST-XXX code and create institution', async () => {
      prisma.institution.count.mockResolvedValue(4);
      prisma.institution.create.mockImplementation((args: any) => ({
        id: 'new-id',
        ...args.data,
      }));

      const result = await service.createInstitution({
        name: 'IIT Hyderabad Extension Campus',
        city: 'Kandi',
        state: 'Telangana',
        type: InstitutionType.GOVERNMENT_UNIVERSITY,
        naacRating: NaacRating.A_PLUS_PLUS,
      });

      expect(result.code).toBe('INST-005');
      expect(result.name).toBe('IIT Hyderabad Extension Campus');
    });
  });

  describe('createMou', () => {
    it('should create MoU with generated number', async () => {
      prisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', name: 'Osmania University' });
      prisma.moU.count.mockResolvedValue(2);
      prisma.moU.create.mockImplementation((args: any) => ({
        id: 'mou-id',
        ...args.data,
      }));

      const result = await service.createMou({
        institutionId: 'inst-1',
        title: 'Robotics CoE Partnership',
        effectiveDate: '2026-01-01',
        expiryDate: '2029-01-01',
        scopeSummary: 'GPU Lab setup and certification',
        institutionSignatoryName: 'Dr. Principal',
        institutionSignatoryRole: 'Principal',
        status: MouStatus.ACTIVE,
      });

      expect(result.mouNumber).toMatch(/^MOU-2026-\d{3}$/);
      expect(result.title).toBe('Robotics CoE Partnership');
    });
  });

  describe('getHealthLeaderboard', () => {
    it('should query top 10 institutions by health score descending', async () => {
      const mockLeaderboard = [
        { id: 'inst-1', name: 'Osmania University', healthScore: 94 },
        { id: 'inst-2', name: 'JNTUH', healthScore: 91 },
      ];
      prisma.institution.findMany.mockResolvedValue(mockLeaderboard);

      const result = await service.getHealthLeaderboard();
      expect(result).toHaveLength(2);
      expect(result[0].healthScore).toBe(94);
    });
  });
});
