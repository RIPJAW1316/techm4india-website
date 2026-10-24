import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { HrmsService } from './hrms.service';
import { PrismaService } from '../../database/prisma.service';

describe('HrmsService', () => {
  let service: HrmsService;
  let prisma: any;

  const mockPrismaService = {
    employee: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    leaveApplication: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    leaveType: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    leaveBalance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    attendanceRecord: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    attendanceRegularization: {
      upsert: jest.fn(),
    },
    claimCategory: {
      findMany: jest.fn(),
    },
    expenseClaim: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    salaryStructure: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    payrollPeriod: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    payslip: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    holiday: {
      findMany: jest.fn(),
    },
    announcement: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    discussionTopic: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    discussionReply: {
      create: jest.fn(),
    },
    companyDocument: {
      findMany: jest.fn(),
    },
    department: {
      findMany: jest.fn(),
    },
    branch: {
      findMany: jest.fn(),
    },
    designation: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<HrmsService>(HrmsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('Dashboard Summary', () => {
    it('returns aggregated counts and self-service status', async () => {
      prisma.employee.count.mockResolvedValue(45);
      prisma.leaveApplication.count.mockResolvedValue(3);
      prisma.attendanceRecord.count.mockResolvedValue(40);
      prisma.holiday.findMany.mockResolvedValue([]);
      prisma.announcement.findMany.mockResolvedValue([]);

      const result = await service.getDashboardSummary('user-1', ['HRMS_USER']);
      expect(result.overview.totalEmployees).toBe(45);
      expect(result.overview.presentToday).toBe(40);
      expect(result.isPrivileged).toBe(false);
    });
  });

  describe('Leave Calculations', () => {
    it('rejects leave when end date is before start date', async () => {
      prisma.leaveType.findUnique.mockResolvedValue({
        id: 'lt-1',
        code: 'ANNUAL',
        isPaid: true,
      });

      await expect(
        service.applyLeave('emp-1', {
          leaveTypeCode: 'ANNUAL',
          startDate: '2026-05-10',
          endDate: '2026-05-08',
          reason: 'Vacation',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects paid leave application when balance is insufficient', async () => {
      prisma.leaveType.findUnique.mockResolvedValue({
        id: 'lt-1',
        code: 'ANNUAL',
        isPaid: true,
      });
      // 1 day remaining
      prisma.leaveBalance.findUnique.mockResolvedValue({
        entitledDays: 10,
        takenDays: 9,
        carriedForwardDays: 0,
      });

      // Mon to Wed = 3 business days
      await expect(
        service.applyLeave('emp-1', {
          leaveTypeCode: 'ANNUAL',
          startDate: '2026-05-04',
          endDate: '2026-05-06',
          reason: 'Vacation',
        }),
      ).rejects.toThrow(/Insufficient leave balance/);
    });

    it('successfully creates leave application when balance is sufficient', async () => {
      prisma.leaveType.findUnique.mockResolvedValue({
        id: 'lt-1',
        code: 'ANNUAL',
        isPaid: true,
      });
      prisma.leaveBalance.findUnique.mockResolvedValue({
        entitledDays: 15,
        takenDays: 2,
        carriedForwardDays: 0,
      });
      prisma.leaveApplication.create.mockResolvedValue({
        id: 'la-1',
        totalDays: 2,
        status: 'PENDING',
      });

      const res = await service.applyLeave('emp-1', {
        leaveTypeCode: 'ANNUAL',
        startDate: '2026-05-04',
        endDate: '2026-05-05',
        reason: 'Personal errand',
      });

      expect(res.status).toBe('PENDING');
      expect(prisma.leaveApplication.create).toHaveBeenCalled();
    });
  });

  describe('Attendance Clock In / Out', () => {
    it('prevents double clock in on the same day', async () => {
      prisma.attendanceRecord.findUnique.mockResolvedValue({
        id: 'att-1',
        clockInTime: new Date(),
      });

      await expect(service.clockIn('emp-1', '127.0.0.1')).rejects.toThrow(
        /already clocked in/i,
      );
    });

    it('calculates work minutes and overtime on clock out', async () => {
      const clockIn = new Date();
      clockIn.setHours(clockIn.getHours() - 9); // 9 hours ago = 540 min

      prisma.attendanceRecord.findUnique.mockResolvedValue({
        id: 'att-1',
        clockInTime: clockIn,
      });
      prisma.attendanceRecord.update.mockImplementation(({ data }) => ({
        id: 'att-1',
        ...data,
      }));

      const res = await service.clockOut('emp-1', '127.0.0.1');
      expect(res.workMinutes).toBeGreaterThanOrEqual(539);
      expect(res.overtimeMinutes).toBeGreaterThan(0);
    });
  });

  describe('Indian Statutory Salary Structure', () => {
    it('calculates statutory deductions including PF, PT, and net pay', async () => {
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.salaryStructure.upsert.mockImplementation(({ update }) => update);

      const res = await service.upsertSalaryStructure('emp-1', {
        monthlyCtc: 80000,
        basicSalary: 40000,
        hra: 20000,
        specialAllowance: 20000,
        providentFundEmployee: 1800,
        professionalTax: 200,
        tdsEstimate: 3000,
      });

      // Gross: 40000 + 20000 + 20000 = 80000
      // Deductions: 1800 (PF) + 200 (PT) + 3000 (TDS) = 5000
      // Net: 75000
      expect(res.netSalary).toBe(75000);
      expect(res.providentFundEmployee).toBe(1800);
      expect(res.professionalTax).toBe(200);
    });
  });
});
