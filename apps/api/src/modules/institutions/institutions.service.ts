import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateMouDto } from './dto/create-mou.dto';
import { InstitutionType, MouStatus, NaacRating } from '@prisma/client';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInstitutions(params?: {
    search?: string;
    type?: InstitutionType;
    naacRating?: NaacRating;
  }) {
    const where: any = {};

    if (params?.type) {
      where.type = params.type;
    }
    if (params?.naacRating) {
      where.naacRating = params.naacRating;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
        { aisheCode: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.institution.findMany({
      where,
      include: {
        _count: {
          select: {
            mous: true,
            batches: true,
            deals: true,
            contacts: true,
          },
        },
      },
      orderBy: [{ healthScore: 'desc' }, { name: 'asc' }],
    });
  }

  async getInstitutionById(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        contacts: true,
        mous: {
          orderBy: { effectiveDate: 'desc' },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
        },
        batches: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found.`);
    }

    return institution;
  }

  async createInstitution(dto: CreateInstitutionDto) {
    const count = await this.prisma.institution.count();
    const code = `INST-${String(count + 1).padStart(3, '0')}`;

    return this.prisma.institution.create({
      data: {
        code,
        name: dto.name,
        type: dto.type,
        naacRating: dto.naacRating,
        aisheCode: dto.aisheCode,
        nirfRankTier: dto.nirfRankTier,
        city: dto.city,
        state: dto.state || 'Telangana',
        pincode: dto.pincode,
        totalStudents: dto.totalStudents || 0,
        primaryContactName: dto.primaryContactName,
        primaryContactPhone: dto.primaryContactPhone,
        primaryContactEmail: dto.primaryContactEmail,
        healthScore: dto.healthScore || 80,
      },
    });
  }

  async updateInstitution(id: string, dto: UpdateInstitutionDto) {
    await this.getInstitutionById(id);

    return this.prisma.institution.update({
      where: { id },
      data: dto,
    });
  }

  async getMous(institutionId?: string) {
    const where = institutionId ? { institutionId } : {};
    return this.prisma.moU.findMany({
      where,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
          },
        },
      },
      orderBy: { effectiveDate: 'desc' },
    });
  }

  async createMou(dto: CreateMouDto) {
    await this.getInstitutionById(dto.institutionId);

    const count = await this.prisma.moU.count();
    const currentYear = new Date().getFullYear();
    const mouNumber = `MOU-${currentYear}-${String(count + 1).padStart(3, '0')}`;

    return this.prisma.moU.create({
      data: {
        mouNumber,
        institutionId: dto.institutionId,
        title: dto.title,
        effectiveDate: new Date(dto.effectiveDate),
        expiryDate: new Date(dto.expiryDate),
        scopeSummary: dto.scopeSummary,
        signedDocumentUrl: dto.signedDocumentUrl,
        techm4SignatoryEmployeeId: dto.techm4SignatoryEmployeeId,
        institutionSignatoryName: dto.institutionSignatoryName,
        institutionSignatoryRole: dto.institutionSignatoryRole,
        status: dto.status || MouStatus.ACTIVE,
      },
      include: {
        institution: true,
      },
    });
  }

  async updateMouStatus(mouId: string, status: MouStatus) {
    const mou = await this.prisma.moU.findUnique({ where: { id: mouId } });
    if (!mou) {
      throw new NotFoundException(`MoU with ID ${mouId} not found.`);
    }

    return this.prisma.moU.update({
      where: { id: mouId },
      data: { status },
    });
  }

  async getHealthLeaderboard() {
    return this.prisma.institution.findMany({
      take: 10,
      orderBy: { healthScore: 'desc' },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        naacRating: true,
        city: true,
        healthScore: true,
        _count: {
          select: { mous: true, batches: true },
        },
      },
    });
  }
}
