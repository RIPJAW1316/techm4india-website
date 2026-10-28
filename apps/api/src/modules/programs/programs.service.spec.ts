import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsService } from './programs.service';
import { PrismaService } from '../../database/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BatchStatus, DivisionCode, ProgramCertificationType } from '@prisma/client';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      program: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      curriculumModule: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      batch: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      batchSession: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPrograms', () => {
    it('should query programs with division filters', async () => {
      const mockPrograms = [
        {
          id: 'prog-1',
          code: 'PRG-ROB-01',
          title: 'Robotics Engineering',
          division: DivisionCode.TECHM4_ENGINEERING,
          modules: [],
        },
      ];
      prisma.program.findMany.mockResolvedValue(mockPrograms);

      const result = await service.findAllPrograms({
        division: DivisionCode.TECHM4_ENGINEERING,
      });

      expect(prisma.program.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { division: DivisionCode.TECHM4_ENGINEERING },
        }),
      );
      expect(result).toEqual(mockPrograms);
    });
  });

  describe('findProgramById', () => {
    it('should return program when found', async () => {
      const mockProgram = { id: 'prog-1', code: 'PRG-1', title: 'Test' };
      prisma.program.findUnique.mockResolvedValue(mockProgram);

      const result = await service.findProgramById('prog-1');
      expect(result).toEqual(mockProgram);
    });

    it('should throw NotFoundException when program does not exist', async () => {
      prisma.program.findUnique.mockResolvedValue(null);

      await expect(service.findProgramById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProgram', () => {
    it('should create program when code is unique', async () => {
      prisma.program.findUnique.mockResolvedValue(null);
      const created = { id: 'prog-1', code: 'PRG-NEW-01', title: 'New Program' };
      prisma.program.create.mockResolvedValue(created);

      const result = await service.createProgram({
        code: 'PRG-NEW-01',
        title: 'New Program',
        division: DivisionCode.TECHM4_ENGINEERING,
        summary: 'Program summary description',
        durationWeeks: 12,
        credits: 4,
        certificationType: ProgramCertificationType.TECHM4_INDUSTRY_CERTIFICATE,
      });

      expect(prisma.program.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should throw ConflictException if program code already exists', async () => {
      prisma.program.findUnique.mockResolvedValue({ id: 'prog-existing', code: 'PRG-NEW-01' });

      await expect(
        service.createProgram({
          code: 'PRG-NEW-01',
          title: 'New Program',
          division: DivisionCode.TECHM4_ENGINEERING,
          summary: 'Program summary description',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createBatch', () => {
    it('should create batch when dates are valid', async () => {
      prisma.batch.findUnique.mockResolvedValue(null);
      const mockBatch = {
        id: 'batch-1',
        batchCode: 'BATCH-2026-A',
        status: BatchStatus.UPCOMING,
      };
      prisma.batch.create.mockResolvedValue(mockBatch);

      const result = await service.createBatch({
        batchCode: 'BATCH-2026-A',
        programId: 'prog-1',
        name: 'Cohort 2026 A',
        startDate: '2026-08-01T00:00:00.000Z',
        endDate: '2026-11-30T00:00:00.000Z',
        capacity: 60,
      });

      expect(prisma.batch.create).toHaveBeenCalled();
      expect(result).toEqual(mockBatch);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      await expect(
        service.createBatch({
          batchCode: 'BATCH-INVALID',
          programId: 'prog-1',
          name: 'Invalid Cohort',
          startDate: '2026-11-30T00:00:00.000Z',
          endDate: '2026-08-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateBatchStatus', () => {
    it('should transition batch status', async () => {
      prisma.batch.findUnique.mockResolvedValue({ id: 'b-1', status: BatchStatus.UPCOMING });
      prisma.batch.update.mockResolvedValue({ id: 'b-1', status: BatchStatus.IN_PROGRESS });

      const result = await service.updateBatchStatus('b-1', BatchStatus.IN_PROGRESS);
      expect(result.status).toBe(BatchStatus.IN_PROGRESS);
    });
  });
});
