import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateStudentFeeDto } from './dto/create-fee.dto';
import { RecordFeePaymentDto } from './dto/record-payment.dto';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { UpdateGrievanceDto } from './dto/update-grievance.dto';
import {
  BatchStatus,
  GrievanceStatus,
  Prisma,
  StudentFeeStatus,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // Student Profiles
  // =========================================================================

  async findAllStudents(filters?: {
    batchId?: string;
    institutionId?: string;
    search?: string;
  }) {
    const where: Prisma.StudentWhereInput = {};

    if (filters?.batchId) {
      where.batchId = filters.batchId;
    }
    if (filters?.institutionId) {
      where.institutionId = filters.institutionId;
    }
    if (filters?.search) {
      where.OR = [
        { studentId: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      include: {
        institution: {
          select: { id: true, code: true, name: true, city: true },
        },
        batch: {
          select: {
            id: true,
            batchCode: true,
            name: true,
            status: true,
            program: { select: { code: true, title: true } },
          },
        },
        _count: {
          select: {
            submissions: true,
            certificates: true,
            fees: true,
            grievances: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        institution: true,
        batch: {
          include: {
            program: true,
            sessions: { orderBy: { sessionNumber: 'asc' } },
          },
        },
        submissions: {
          include: {
            assignment: { select: { title: true, maxScore: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
        certificates: {
          include: {
            program: { select: { code: true, title: true, division: true } },
          },
        },
        fees: {
          orderBy: { dueDate: 'asc' },
        },
        grievances: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }

    return student;
  }

  async createStudent(dto: CreateStudentDto) {
    const existingEmail = await this.prisma.student.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException(`Student with email "${dto.email}" already exists`);
    }

    let studentId = dto.studentId;
    if (!studentId) {
      const year = new Date().getFullYear();
      const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
      studentId = `STD-${year}-${hex}`;
    } else {
      const existingId = await this.prisma.student.findUnique({
        where: { studentId },
      });
      if (existingId) {
        throw new ConflictException(`Student with ID "${studentId}" already exists`);
      }
    }

    return this.prisma.student.create({
      data: {
        studentId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender,
        dob: dto.dob ? new Date(dto.dob) : null,
        academicBranch: dto.academicBranch ?? 'Computer Science & Engineering',
        yearOfStudy: dto.yearOfStudy ?? 3,
        guardianName: dto.guardianName,
        guardianPhone: dto.guardianPhone,
        institutionId: dto.institutionId,
        batchId: dto.batchId,
        kycVerified: dto.kycVerified ?? true,
      },
      include: {
        institution: { select: { name: true, city: true } },
        batch: { select: { batchCode: true, name: true } },
      },
    });
  }

  // =========================================================================
  // Atomic Batch Enrollment
  // =========================================================================

  async enrollStudentInBatch(studentId: string, batchId: string) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
      });
      if (!student) {
        throw new NotFoundException(`Student with ID "${studentId}" not found`);
      }

      const batch = await tx.batch.findUnique({
        where: { id: batchId },
      });
      if (!batch) {
        throw new NotFoundException(`Batch with ID "${batchId}" not found`);
      }

      if (
        batch.status === BatchStatus.COMPLETED ||
        batch.status === BatchStatus.CANCELLED
      ) {
        throw new BadRequestException(
          `Cannot enroll in a batch with status "${batch.status}"`,
        );
      }

      if (batch.currentEnrolled >= batch.capacity) {
        throw new BadRequestException(
          `Batch "${batch.batchCode}" has reached maximum capacity of ${batch.capacity} students`,
        );
      }

      // Check if student was already in a different batch and decrement if needed
      if (student.batchId && student.batchId !== batchId) {
        await tx.batch.update({
          where: { id: student.batchId },
          data: { currentEnrolled: { decrement: 1 } },
        });
      }

      // If student is not already in this batch, increment
      if (student.batchId !== batchId) {
        await tx.batch.update({
          where: { id: batchId },
          data: { currentEnrolled: { increment: 1 } },
        });
      }

      return tx.student.update({
        where: { id: studentId },
        data: {
          batchId,
          institutionId: batch.institutionId ?? student.institutionId,
        },
        include: {
          batch: {
            select: {
              id: true,
              batchCode: true,
              name: true,
              currentEnrolled: true,
              capacity: true,
            },
          },
        },
      });
    });
  }

  // =========================================================================
  // Fees & Payment Reconciliation
  // =========================================================================

  async createFee(studentId: string, dto: CreateStudentFeeDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    const total = dto.totalAmount;
    const discount = dto.discountAmount ?? 0;
    if (discount > total) {
      throw new BadRequestException('Discount amount cannot exceed total fee amount');
    }

    const netPayable = total - discount;
    const balanceDue = netPayable;

    return this.prisma.studentFee.create({
      data: {
        studentId,
        feeType: dto.feeType,
        totalAmount: new Prisma.Decimal(total),
        discountAmount: new Prisma.Decimal(discount),
        netPayable: new Prisma.Decimal(netPayable),
        paidAmount: new Prisma.Decimal(0),
        balanceDue: new Prisma.Decimal(balanceDue),
        dueDate: new Date(dto.dueDate),
        status: StudentFeeStatus.UNPAID,
      },
    });
  }

  async recordFeePayment(feeId: string, dto: RecordFeePaymentDto) {
    const fee = await this.prisma.studentFee.findUnique({
      where: { id: feeId },
    });
    if (!fee) {
      throw new NotFoundException(`Student fee record with ID "${feeId}" not found`);
    }

    const currentBalance = Number(fee.balanceDue);
    if (dto.amountPaid > currentBalance) {
      throw new BadRequestException(
        `Payment amount (₹${dto.amountPaid}) cannot exceed remaining balance (₹${currentBalance})`,
      );
    }

    const newPaidAmount = Number(fee.paidAmount) + dto.amountPaid;
    const newBalanceDue = Number(fee.netPayable) - newPaidAmount;
    const status =
      newBalanceDue <= 0
        ? StudentFeeStatus.PAID
        : StudentFeeStatus.PARTIALLY_PAID;

    return this.prisma.studentFee.update({
      where: { id: feeId },
      data: {
        paidAmount: new Prisma.Decimal(newPaidAmount),
        balanceDue: new Prisma.Decimal(newBalanceDue),
        status,
      },
    });
  }

  // =========================================================================
  // Grievance Redressal
  // =========================================================================

  async createGrievance(studentId: string, dto: CreateGrievanceDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const ticketNumber = `GRV-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    return this.prisma.studentGrievance.create({
      data: {
        ticketNumber,
        studentId,
        category: dto.category,
        title: dto.title,
        description: dto.description,
        status: GrievanceStatus.OPEN,
      },
      include: {
        student: { select: { studentId: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateGrievance(ticketNumber: string, dto: UpdateGrievanceDto) {
    const grievance = await this.prisma.studentGrievance.findUnique({
      where: { ticketNumber },
    });
    if (!grievance) {
      throw new NotFoundException(`Grievance with ticket "${ticketNumber}" not found`);
    }

    const isClosing =
      dto.status === GrievanceStatus.RESOLVED ||
      dto.status === GrievanceStatus.CLOSED;

    return this.prisma.studentGrievance.update({
      where: { ticketNumber },
      data: {
        status: dto.status,
        resolutionNotes: dto.resolutionNotes,
        resolvedAt: isClosing ? new Date() : grievance.resolvedAt,
      },
    });
  }
}
