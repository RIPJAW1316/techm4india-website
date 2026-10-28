import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateCostCentreDto } from './dto/create-cost-centre.dto';
import { UpdateCostCentreBudgetDto } from './dto/update-cost-centre-budget.dto';
import { DivisionCode, Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPrimaryOrganization() {
    let org = await this.prisma.organization.findFirst({
      where: { code: 'TECHM4INDIA' },
    });

    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          code: 'TECHM4INDIA',
          name: 'TechM4India Innovations Pvt. Ltd.',
          legalName: 'TechM4India Innovations Private Limited',
          cin: 'U72900TG2024PTC123456',
          gstin: '36AAACT1234F1Z5',
          pan: 'AAACT1234F',
          website: 'https://techm4india.com',
          email: 'contact@techm4india.com',
          phone: '+91 40 2345 6789',
          registeredAddress: 'T-Hub 2.0, Inorbit Mall Road, Madhapur, Hyderabad, Telangana 500081',
          corporateAddress: 'Plot 42, Hitech City Main Road, Cyberabad, Hyderabad, Telangana 500081',
          isActive: true,
        },
      });
    }

    return org;
  }

  // =========================================================================
  // Corporate Profile
  // =========================================================================

  async getCompanyProfile() {
    const org = await this.getPrimaryOrganization();

    const stats = await this.prisma.organization.findUnique({
      where: { id: org.id },
      include: {
        _count: {
          select: {
            departments: true,
            branches: true,
            costCentres: true,
            employees: true,
          },
        },
      },
    });

    return stats;
  }

  async updateCompanyProfile(dto: UpdateOrganizationDto) {
    const org = await this.getPrimaryOrganization();

    return this.prisma.organization.update({
      where: { id: org.id },
      data: {
        name: dto.name,
        legalName: dto.legalName,
        cin: dto.cin,
        gstin: dto.gstin,
        pan: dto.pan,
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        registeredAddress: dto.registeredAddress,
        corporateAddress: dto.corporateAddress,
      },
    });
  }

  // =========================================================================
  // 5-Division Business Matrix
  // =========================================================================

  async getDivisions() {
    const divisionsMeta = [
      {
        code: DivisionCode.TECHM4_SCHOOLS,
        name: 'TechM4Schools',
        focus: 'K-12 STEM Labs, Robotics Clubs & Atal Tinkering Labs',
        lead: 'Director of School Partnerships',
      },
      {
        code: DivisionCode.TECHM4_ENGINEERING,
        name: 'TechM4Engineering',
        focus: 'Industry 4.0, Autonomous Robotics, Edge AI & Mechatronics',
        lead: 'Chief Technology Officer (CTO)',
      },
      {
        code: DivisionCode.TECHM4_SOLUTIONS,
        name: 'TechM4Solutions',
        focus: 'Enterprise Custom Software, EdTech Systems & Cloud Transformation',
        lead: 'VP of Enterprise Solutions',
      },
      {
        code: DivisionCode.TECHM4_SPACE,
        name: 'TechM4Space Technology',
        focus: 'CanSat Nano-Satellites, Rocketry & Space Telemetry',
        lead: 'Head of Aerospace Systems',
      },
      {
        code: DivisionCode.HORIZON_INSTITUTES,
        name: 'Horizon Startup School',
        focus: 'Entrepreneurship Bootcamps, Incubation & Seed Connect',
        lead: 'Managing Director, Horizon',
      },
    ];

    const result = await Promise.all(
      divisionsMeta.map(async (div) => {
        const programCount = await this.prisma.program.count({
          where: { division: div.code, isActive: true },
        });
        const costCentreCount = await this.prisma.costCentre.count({
          where: { division: div.code, isActive: true },
        });

        return {
          ...div,
          activePrograms: programCount,
          activeCostCentres: costCentreCount,
        };
      }),
    );

    return result;
  }

  // =========================================================================
  // Multi-Branch Directory
  // =========================================================================

  async getBranches(isHeadquarters?: boolean) {
    const org = await this.getPrimaryOrganization();

    const where: Prisma.BranchWhereInput = { organizationId: org.id };
    if (isHeadquarters !== undefined) {
      where.isHeadquarters = isHeadquarters;
    }

    return this.prisma.branch.findMany({
      where,
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: [{ isHeadquarters: 'desc' }, { city: 'asc' }],
    });
  }

  async createBranch(dto: CreateBranchDto) {
    const org = await this.getPrimaryOrganization();

    const existing = await this.prisma.branch.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Branch with code "${dto.code}" already exists.`);
    }

    return this.prisma.branch.create({
      data: {
        organizationId: org.id,
        code: dto.code,
        name: dto.name,
        city: dto.city,
        state: dto.state,
        country: dto.country ?? 'India',
        address: dto.address,
        isHeadquarters: dto.isHeadquarters ?? false,
      },
    });
  }

  // =========================================================================
  // Departments
  // =========================================================================

  async getDepartments(search?: string) {
    const org = await this.getPrimaryOrganization();

    const where: Prisma.DepartmentWhereInput = { organizationId: org.id };
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.department.findMany({
      where,
      include: {
        _count: { select: { employees: true, designations: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const org = await this.getPrimaryOrganization();

    const existing = await this.prisma.department.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Department with code "${dto.code}" already exists.`);
    }

    return this.prisma.department.create({
      data: {
        organizationId: org.id,
        code: dto.code,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  // =========================================================================
  // Cost Centres & Budget Allocation
  // =========================================================================

  async getCostCentres(division?: DivisionCode) {
    const org = await this.getPrimaryOrganization();

    const where: Prisma.CostCentreWhereInput = { organizationId: org.id };
    if (division) {
      where.division = division;
    }

    const centres = await this.prisma.costCentre.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    return centres.map((cc) => {
      const annual = Number(cc.budgetAnnual);
      const utilized = Number(cc.budgetUtilized);
      const remaining = annual - utilized;
      const rate = annual > 0 ? (utilized / annual) * 100 : 0;

      return {
        ...cc,
        budgetRemaining: remaining,
        utilizationRate: Math.round(rate * 100) / 100,
      };
    });
  }

  async createCostCentre(dto: CreateCostCentreDto) {
    const org = await this.getPrimaryOrganization();

    const existing = await this.prisma.costCentre.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Cost Centre with code "${dto.code}" already exists.`);
    }

    return this.prisma.costCentre.create({
      data: {
        organizationId: org.id,
        code: dto.code,
        name: dto.name,
        division: dto.division,
        budgetAnnual: new Prisma.Decimal(dto.budgetAnnual ?? 0),
        budgetUtilized: new Prisma.Decimal(0),
        managerEmployeeId: dto.managerEmployeeId,
      },
    });
  }

  async updateCostCentreBudget(id: string, dto: UpdateCostCentreBudgetDto) {
    const cc = await this.prisma.costCentre.findUnique({
      where: { id },
    });
    if (!cc) {
      throw new NotFoundException(`Cost Centre with ID "${id}" not found.`);
    }

    const data: Prisma.CostCentreUpdateInput = {};
    if (dto.budgetAnnual !== undefined) {
      data.budgetAnnual = new Prisma.Decimal(dto.budgetAnnual);
    }
    if (dto.budgetUtilized !== undefined) {
      data.budgetUtilized = new Prisma.Decimal(dto.budgetUtilized);
    }

    return this.prisma.costCentre.update({
      where: { id },
      data,
    });
  }
}
