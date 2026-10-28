import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateCurriculumModuleDto } from './dto/create-curriculum-module.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { CreateBatchSessionDto } from './dto/create-batch-session.dto';
import { BatchStatus, DivisionCode, Prisma } from '@prisma/client';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // Programs
  // =========================================================================

  async findAllPrograms(filters?: {
    division?: DivisionCode;
    isActive?: boolean;
    search?: string;
  }) {
    const where: Prisma.ProgramWhereInput = {};

    if (filters?.division) {
      where.division = filters.division;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.program.findMany({
      where,
      include: {
        modules: {
          orderBy: { moduleNumber: 'asc' },
        },
        _count: {
          select: {
            batches: true,
            courses: true,
            certificates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProgramById(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { moduleNumber: 'asc' },
        },
        batches: {
          include: {
            institution: {
              select: { id: true, code: true, name: true, city: true },
            },
            _count: {
              select: { students: true, sessions: true },
            },
          },
          orderBy: { startDate: 'desc' },
        },
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
            category: true,
            difficultyLevel: true,
            isPublished: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID "${id}" not found`);
    }

    return program;
  }

  async createProgram(dto: CreateProgramDto) {
    const existing = await this.prisma.program.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Program with code "${dto.code}" already exists`);
    }

    return this.prisma.program.create({
      data: {
        code: dto.code,
        title: dto.title,
        division: dto.division,
        summary: dto.summary,
        durationWeeks: dto.durationWeeks ?? 12,
        credits: dto.credits ?? 4,
        certificationType: dto.certificationType,
        targetAudience: dto.targetAudience ?? 'Undergraduate Engineering',
        isActive: dto.isActive ?? true,
        modules: dto.modules?.length
          ? {
              create: dto.modules.map((m) => ({
                moduleNumber: m.moduleNumber,
                title: m.title,
                description: m.description,
                totalHours: m.totalHours ?? 20,
                labHours: m.labHours ?? 12,
                theoryHours: m.theoryHours ?? 8,
              })),
            }
          : undefined,
      },
      include: {
        modules: true,
      },
    });
  }

  async updateProgram(id: string, dto: UpdateProgramDto) {
    await this.findProgramById(id);

    return this.prisma.program.update({
      where: { id },
      data: {
        title: dto.title,
        division: dto.division,
        summary: dto.summary,
        durationWeeks: dto.durationWeeks,
        credits: dto.credits,
        certificationType: dto.certificationType,
        targetAudience: dto.targetAudience,
        isActive: dto.isActive,
      },
    });
  }

  async addCurriculumModule(programId: string, dto: CreateCurriculumModuleDto) {
    await this.findProgramById(programId);

    const existing = await this.prisma.curriculumModule.findUnique({
      where: {
        programId_moduleNumber: {
          programId,
          moduleNumber: dto.moduleNumber,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Module number ${dto.moduleNumber} already exists for this program`,
      );
    }

    return this.prisma.curriculumModule.create({
      data: {
        programId,
        moduleNumber: dto.moduleNumber,
        title: dto.title,
        description: dto.description,
        totalHours: dto.totalHours ?? 20,
        labHours: dto.labHours ?? 12,
        theoryHours: dto.theoryHours ?? 8,
      },
    });
  }

  // =========================================================================
  // Batches
  // =========================================================================

  async findBatchesByProgram(programId: string) {
    await this.findProgramById(programId);

    return this.prisma.batch.findMany({
      where: { programId },
      include: {
        institution: {
          select: { id: true, code: true, name: true, city: true },
        },
        sessions: {
          orderBy: { sessionNumber: 'asc' },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createBatch(dto: CreateBatchDto) {
    if (!dto.programId) {
      throw new BadRequestException('Program ID is required to schedule a batch');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) {
      throw new BadRequestException('Batch end date must be after start date');
    }

    const existingCode = await this.prisma.batch.findUnique({
      where: { batchCode: dto.batchCode },
    });
    if (existingCode) {
      throw new ConflictException(`Batch with code "${dto.batchCode}" already exists`);
    }

    return this.prisma.batch.create({
      data: {
        batchCode: dto.batchCode,
        programId: dto.programId,
        institutionId: dto.institutionId,
        name: dto.name,
        startDate: start,
        endDate: end,
        capacity: dto.capacity ?? 60,
        leadFacultyEmployeeId: dto.leadFacultyEmployeeId,
        status: dto.status ?? BatchStatus.UPCOMING,
      },
      include: {
        program: {
          select: { id: true, code: true, title: true, division: true },
        },
        institution: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  async updateBatchStatus(batchId: string, status: BatchStatus) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID "${batchId}" not found`);
    }

    return this.prisma.batch.update({
      where: { id: batchId },
      data: { status },
    });
  }

  async createBatchSession(batchId: string, dto: CreateBatchSessionDto) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID "${batchId}" not found`);
    }

    const existingSession = await this.prisma.batchSession.findUnique({
      where: {
        batchId_sessionNumber: {
          batchId,
          sessionNumber: dto.sessionNumber,
        },
      },
    });
    if (existingSession) {
      throw new ConflictException(
        `Session number ${dto.sessionNumber} already scheduled for this batch`,
      );
    }

    return this.prisma.batchSession.create({
      data: {
        batchId,
        sessionNumber: dto.sessionNumber,
        topic: dto.topic,
        scheduledDate: new Date(dto.scheduledDate),
        durationMinutes: dto.durationMinutes ?? 90,
        meetingUrl: dto.meetingUrl,
        isCompleted: dto.isCompleted ?? false,
      },
    });
  }
}
