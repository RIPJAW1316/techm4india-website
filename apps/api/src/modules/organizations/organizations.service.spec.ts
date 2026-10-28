import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../../database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DivisionCode } from '@prisma/client';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prisma: any;

  const mockOrg = {
    id: 'org-1',
    code: 'TECHM4INDIA',
    name: 'TechM4India Innovations Pvt. Ltd.',
    legalName: 'TechM4India Innovations Private Limited',
    cin: 'U72900TG2024PTC123456',
    gstin: '36AAACT1234F1Z5',
  };

  beforeEach(async () => {
    prisma = {
      organization: {
        findFirst: jest.fn().mockResolvedValue(mockOrg),
        findUnique: jest.fn().mockResolvedValue(mockOrg),
        create: jest.fn().mockResolvedValue(mockOrg),
        update: jest.fn(),
      },
      program: {
        count: jest.fn().mockResolvedValue(3),
      },
      costCentre: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      branch: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      department: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCompanyProfile & updateCompanyProfile', () => {
    it('should return corporate profile and entity statistics', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        ...mockOrg,
        _count: { departments: 6, branches: 2, costCentres: 5, employees: 30 },
      });

      const profile = await service.getCompanyProfile();
      expect(profile).toHaveProperty('cin', 'U72900TG2024PTC123456');
      expect(profile?._count.branches).toBe(2);
    });

    it('should update corporate legal details', async () => {
      prisma.organization.update.mockResolvedValue({
        ...mockOrg,
        gstin: '36AAACT9999F1Z0',
      });

      const updated = await service.updateCompanyProfile({
        gstin: '36AAACT9999F1Z0',
      });
      expect(updated.gstin).toBe('36AAACT9999F1Z0');
      expect(prisma.organization.update).toHaveBeenCalled();
    });
  });

  describe('getDivisions', () => {
    it('should return 5 divisions with active program and cost centre metrics', async () => {
      const divisions = await service.getDivisions();
      expect(divisions).toHaveLength(5);
      expect(divisions[0]).toHaveProperty('code');
      expect(divisions[0]).toHaveProperty('activePrograms', 3);
      expect(divisions[0]).toHaveProperty('activeCostCentres', 2);
    });
  });

  describe('createBranch', () => {
    it('should create new branch when code is unique', async () => {
      prisma.branch.findUnique.mockResolvedValue(null);
      const mockBranch = {
        id: 'br-1',
        code: 'BLR-01',
        name: 'Bengaluru Innovation Center',
        city: 'Bengaluru',
        state: 'Karnataka',
      };
      prisma.branch.create.mockResolvedValue(mockBranch);

      const result = await service.createBranch({
        code: 'BLR-01',
        name: 'Bengaluru Innovation Center',
        city: 'Bengaluru',
        state: 'Karnataka',
      });

      expect(result).toEqual(mockBranch);
      expect(prisma.branch.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if branch code exists', async () => {
      prisma.branch.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createBranch({
          code: 'HYD-HQ',
          name: 'Hyderabad HQ',
          city: 'Hyderabad',
          state: 'Telangana',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createDepartment', () => {
    it('should create department when code is unique', async () => {
      prisma.department.findUnique.mockResolvedValue(null);
      const mockDept = {
        id: 'dept-1',
        code: 'SPACE',
        name: 'Space Systems & CanSat',
      };
      prisma.department.create.mockResolvedValue(mockDept);

      const result = await service.createDepartment({
        code: 'SPACE',
        name: 'Space Systems & CanSat',
      });

      expect(result).toEqual(mockDept);
    });

    it('should throw ConflictException if department code exists', async () => {
      prisma.department.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createDepartment({
          code: 'SPACE',
          name: 'Space Systems',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Cost Centres & Budget Allocations', () => {
    it('should calculate budget remaining and utilization rate in getCostCentres', async () => {
      prisma.costCentre.findMany.mockResolvedValue([
        {
          id: 'cc-1',
          code: 'CC-ENG-01',
          name: 'Robotics Lab',
          division: DivisionCode.TECHM4_ENGINEERING,
          budgetAnnual: 1000000,
          budgetUtilized: 250000,
        },
      ]);

      const result = await service.getCostCentres(DivisionCode.TECHM4_ENGINEERING);
      expect(result).toHaveLength(1);
      expect(result[0].budgetRemaining).toBe(750000);
      expect(result[0].utilizationRate).toBe(25);
    });

    it('should create cost centre with budget allocation', async () => {
      prisma.costCentre.findUnique.mockResolvedValue(null);
      const mockCC = {
        id: 'cc-1',
        code: 'CC-NEW-01',
        name: 'New Lab',
        division: DivisionCode.TECHM4_SPACE,
        budgetAnnual: 500000,
      };
      prisma.costCentre.create.mockResolvedValue(mockCC);

      const result = await service.createCostCentre({
        code: 'CC-NEW-01',
        name: 'New Lab',
        division: DivisionCode.TECHM4_SPACE,
        budgetAnnual: 500000,
      });

      expect(result).toEqual(mockCC);
    });

    it('should update cost centre budget allocation', async () => {
      prisma.costCentre.findUnique.mockResolvedValue({ id: 'cc-1' });
      prisma.costCentre.update.mockResolvedValue({
        id: 'cc-1',
        budgetAnnual: 1200000,
        budgetUtilized: 300000,
      });

      const updated = await service.updateCostCentreBudget('cc-1', {
        budgetAnnual: 1200000,
        budgetUtilized: 300000,
      });

      expect(updated.budgetAnnual).toBe(1200000);
      expect(prisma.costCentre.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cost centre does not exist', async () => {
      prisma.costCentre.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCostCentreBudget('non-existent', { budgetAnnual: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
