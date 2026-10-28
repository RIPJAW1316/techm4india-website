import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BatchStatus, GrievanceCategory, GrievanceStatus, StudentFeeStatus } from '@prisma/client';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      student: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      batch: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      studentFee: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      studentGrievance: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStudent', () => {
    it('should create student with auto-generated studentId if omitted', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      const mockCreated = {
        id: 'std-1',
        studentId: 'STD-2026-ABC',
        firstName: 'Ananya',
        lastName: 'Rao',
        email: 'ananya.rao@example.com',
      };
      prisma.student.create.mockResolvedValue(mockCreated);

      const result = await service.createStudent({
        firstName: 'Ananya',
        lastName: 'Rao',
        email: 'ananya.rao@example.com',
      });

      expect(prisma.student.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreated);
    });

    it('should throw ConflictException if student email already exists', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'existing', email: 'duplicate@example.com' });

      await expect(
        service.createStudent({
          firstName: 'Ananya',
          lastName: 'Rao',
          email: 'duplicate@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('enrollStudentInBatch', () => {
    it('should enroll student in batch and increment batch enrollment atomically', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'std-1', batchId: null });
      prisma.batch.findUnique.mockResolvedValue({
        id: 'b-1',
        batchCode: 'BATCH-2026-A',
        capacity: 60,
        currentEnrolled: 15,
        status: BatchStatus.UPCOMING,
        institutionId: 'inst-1',
      });
      prisma.batch.update.mockResolvedValue({ id: 'b-1', currentEnrolled: 16 });
      prisma.student.update.mockResolvedValue({
        id: 'std-1',
        batchId: 'b-1',
        batch: { id: 'b-1', currentEnrolled: 16, capacity: 60 },
      });

      const result = await service.enrollStudentInBatch('std-1', 'b-1');

      expect(prisma.batch.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'b-1' },
          data: { currentEnrolled: { increment: 1 } },
        }),
      );
      expect(prisma.student.update).toHaveBeenCalled();
      expect(result.batchId).toBe('b-1');
    });

    it('should throw BadRequestException if batch has reached capacity', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'std-1', batchId: null });
      prisma.batch.findUnique.mockResolvedValue({
        id: 'b-1',
        batchCode: 'BATCH-FULL',
        capacity: 30,
        currentEnrolled: 30,
        status: BatchStatus.UPCOMING,
      });

      await expect(service.enrollStudentInBatch('std-1', 'b-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if batch is cancelled or completed', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'std-1' });
      prisma.batch.findUnique.mockResolvedValue({
        id: 'b-1',
        batchCode: 'BATCH-CANCELLED',
        capacity: 30,
        currentEnrolled: 5,
        status: BatchStatus.CANCELLED,
      });

      await expect(service.enrollStudentInBatch('std-1', 'b-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createFee & recordFeePayment', () => {
    it('should compute netPayable and balanceDue when creating fee', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'std-1' });
      prisma.studentFee.create.mockImplementation(({ data }) => Promise.resolve({ id: 'fee-1', ...data }));

      const result = await service.createFee('std-1', {
        feeType: 'TUITION',
        totalAmount: 50000,
        discountAmount: 5000,
        dueDate: '2026-09-30T00:00:00.000Z',
      });

      expect(Number(result.netPayable)).toBe(45000);
      expect(Number(result.balanceDue)).toBe(45000);
      expect(result.status).toBe(StudentFeeStatus.UNPAID);
    });

    it('should record payment and update balanceDue and status', async () => {
      prisma.studentFee.findUnique.mockResolvedValue({
        id: 'fee-1',
        netPayable: 45000,
        paidAmount: 0,
        balanceDue: 45000,
      });
      prisma.studentFee.update.mockImplementation(({ data }) => Promise.resolve({ id: 'fee-1', ...data }));

      const result = await service.recordFeePayment('fee-1', { amountPaid: 20000 });
      expect(Number(result.paidAmount)).toBe(20000);
      expect(Number(result.balanceDue)).toBe(25000);
      expect(result.status).toBe(StudentFeeStatus.PARTIALLY_PAID);
    });

    it('should mark fee as PAID when paid amount equals remaining balance', async () => {
      prisma.studentFee.findUnique.mockResolvedValue({
        id: 'fee-1',
        netPayable: 45000,
        paidAmount: 20000,
        balanceDue: 25000,
      });
      prisma.studentFee.update.mockImplementation(({ data }) => Promise.resolve({ id: 'fee-1', ...data }));

      const result = await service.recordFeePayment('fee-1', { amountPaid: 25000 });
      expect(Number(result.paidAmount)).toBe(45000);
      expect(Number(result.balanceDue)).toBe(0);
      expect(result.status).toBe(StudentFeeStatus.PAID);
    });

    it('should throw BadRequestException if payment exceeds remaining balance', async () => {
      prisma.studentFee.findUnique.mockResolvedValue({
        id: 'fee-1',
        netPayable: 45000,
        paidAmount: 0,
        balanceDue: 45000,
      });

      await expect(
        service.recordFeePayment('fee-1', { amountPaid: 50000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createGrievance & updateGrievance', () => {
    it('should create grievance with auto-generated ticket number', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'std-1' });
      prisma.studentGrievance.create.mockImplementation(({ data }) => Promise.resolve({ id: 'grv-1', ...data }));

      const result = await service.createGrievance('std-1', {
        category: GrievanceCategory.LAB_EQUIPMENT,
        title: 'LiDAR calibration issue',
        description: 'Sensor does not boot',
      });

      expect(result.ticketNumber).toContain('GRV-');
      expect(result.status).toBe(GrievanceStatus.OPEN);
    });

    it('should update grievance resolution and record timestamp', async () => {
      prisma.studentGrievance.findUnique.mockResolvedValue({
        ticketNumber: 'GRV-123456',
        status: GrievanceStatus.OPEN,
        resolvedAt: null,
      });
      prisma.studentGrievance.update.mockImplementation(({ data }) => Promise.resolve({ ticketNumber: 'GRV-123456', ...data }));

      const result = await service.updateGrievance('GRV-123456', {
        status: GrievanceStatus.RESOLVED,
        resolutionNotes: 'Calibrated USB bus',
      });

      expect(result.status).toBe(GrievanceStatus.RESOLVED);
      expect(result.resolvedAt).toBeInstanceOf(Date);
    });
  });
});
