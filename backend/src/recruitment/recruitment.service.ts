import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  JobRequisitionStatus,
  Prisma,
  RecruitmentApplicantStatus,
} from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { PrismaService } from "../prisma/prisma.service";
import {
  ApplicantQueryDto,
  CompleteInterviewDto,
  CreateApplicantDto,
  CreateOfferDto,
  CreateOnboardingTaskDto,
  CreateRequisitionDto,
  OfferResponseDto,
  RequisitionQueryDto,
  ScheduleInterviewDto,
  UpdateOnboardingTaskDto,
} from "./dto/recruitment.dto";

const requisitionInclude = {
  division: { select: { id: true, name: true, slug: true } },
  department: { select: { id: true, name: true, slug: true } },
  hiringManager: {
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      designation: true,
    },
  },
  _count: { select: { applicants: true } },
} satisfies Prisma.JobRequisitionInclude;

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private organizationId(principal: Principal): string {
    if (!principal.organizationId) {
      throw new ForbiddenException("Organization context required");
    }
    return principal.organizationId;
  }

  private page(query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return { page, limit, skip: (page - 1) * limit, take: limit };
  }

  private async record(
    action: string,
    principal: Principal,
    entityType: string,
    entityId: string,
    request?: RequestMetadata,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.audit.record({
      action,
      actorUserId: principal.userId,
      entityType,
      entityId,
      request,
      metadata,
    });
  }

  private duplicate(error: unknown, message: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException(message);
    }
    throw error;
  }

  private async validateOrganizationReferences(
    principal: Principal,
    dto: Pick<
      CreateRequisitionDto,
      "divisionId" | "departmentId" | "hiringManagerEmployeeId"
    >,
  ): Promise<void> {
    const organizationId = this.organizationId(principal);
    if (dto.divisionId) {
      const division = await this.prisma.division.findFirst({
        where: { id: dto.divisionId, organizationId },
        select: { id: true },
      });
      if (!division) throw new NotFoundException("Division not found in organization");
    }
    if (dto.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: dto.departmentId,
          division: { organizationId },
          ...(dto.divisionId ? { divisionId: dto.divisionId } : {}),
        },
        select: { id: true },
      });
      if (!department) {
        throw new NotFoundException("Department not found in organization or division");
      }
    }
    if (dto.hiringManagerEmployeeId) {
      await this.employeeInOrganization(
        principal,
        dto.hiringManagerEmployeeId,
        "Hiring manager",
      );
    }
  }

  private async employeeInOrganization(
    principal: Principal,
    employeeId: string,
    label = "Employee",
  ) {
    const row = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        division: { organizationId: this.organizationId(principal) },
        employmentStatus: { notIn: ["EXITED", "TERMINATED", "RESIGNED"] },
      },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!row) throw new NotFoundException(`${label} not found in organization`);
    return row;
  }

  private async requisition(principal: Principal, id: string) {
    const row = await this.prisma.jobRequisition.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: requisitionInclude,
    });
    if (!row) throw new NotFoundException("Job requisition not found");
    return row;
  }

  private async applicant(principal: Principal, id: string) {
    const canReadOffers = principal.permissions.includes("recruitment.offers.read");
    const row = await this.prisma.recruitmentApplicant.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: {
        requisition: {
          select: { id: true, code: true, title: true, status: true },
        },
        interviews: {
          orderBy: { scheduledAt: "desc" },
          include: {
            interviewer: {
              select: { id: true, firstName: true, lastName: true, designation: true },
            },
          },
        },
        onboardingTasks: {
          orderBy: [{ status: "asc" }, { dueDate: "asc" }],
          include: {
            owner: {
              select: { id: true, firstName: true, lastName: true, designation: true },
            },
          },
        },
        ...(canReadOffers ? { offers: { orderBy: { createdAt: "desc" } } } : {}),
      },
    });
    if (!row) throw new NotFoundException("Applicant not found");
    return row;
  }

  async dashboard(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const requisitions = await this.prisma.jobRequisition.groupBy({
      by: ["status"],
      where: { organizationId },
      orderBy: { status: "asc" },
      _count: { status: true },
    });
    const applicants = await this.prisma.recruitmentApplicant.groupBy({
      by: ["status"],
      where: { organizationId },
      orderBy: { status: "asc" },
      _count: { status: true },
    });
    const [interviews, onboarding] = await this.prisma.$transaction([
      this.prisma.recruitmentInterview.count({
        where: {
          organizationId,
          status: "SCHEDULED",
          scheduledAt: { gte: new Date() },
        },
      }),
      this.prisma.recruitmentOnboardingTask.count({
        where: { organizationId, status: { in: ["PENDING", "IN_PROGRESS"] } },
      }),
    ]);
    return {
      requisitions: Object.fromEntries(
        requisitions.map((item) => [item.status, item._count.status]),
      ),
      applicants: Object.fromEntries(
        applicants.map((item) => [item.status, item._count.status]),
      ),
      upcomingInterviews: interviews,
      outstandingOnboardingTasks: onboarding,
    };
  }

  async listRequisitions(principal: Principal, query: RequisitionQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.JobRequisitionWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.jobRequisition.findMany({
        where,
        include: requisitionInclude,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.jobRequisition.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  getRequisition(principal: Principal, id: string) {
    return this.requisition(principal, id);
  }

  async createRequisition(
    principal: Principal,
    dto: CreateRequisitionDto,
    request?: RequestMetadata,
  ) {
    await this.validateOrganizationReferences(principal, dto);
    let row;
    try {
      row = await this.prisma.jobRequisition.create({
        data: {
          organizationId: this.organizationId(principal),
          divisionId: dto.divisionId,
          departmentId: dto.departmentId,
          hiringManagerEmployeeId: dto.hiringManagerEmployeeId,
          code: dto.code.trim().toUpperCase(),
          title: dto.title.trim(),
          employmentType: dto.employmentType,
          openings: dto.openings,
          priority: dto.priority,
          description: dto.description.trim(),
          requirements: dto.requirements?.trim(),
          location: dto.location?.trim(),
          createdByUserId: principal.userId,
        },
        include: requisitionInclude,
      });
    } catch (error) {
      this.duplicate(error, "Job requisition code already exists in this organization");
    }
    await this.record(
      "RECRUITMENT_REQUISITION_CREATED",
      principal,
      "JobRequisition",
      row.id,
      request,
      { code: row.code, title: row.title },
    );
    return row;
  }

  async transitionRequisition(
    principal: Principal,
    id: string,
    action: "submit" | "approve" | "open" | "hold" | "close" | "cancel",
    request?: RequestMetadata,
  ) {
    const current = await this.requisition(principal, id);
    const transitions: Record<
      typeof action,
      { from: JobRequisitionStatus[]; to: JobRequisitionStatus; action: string }
    > = {
      submit: {
        from: [JobRequisitionStatus.DRAFT],
        to: JobRequisitionStatus.PENDING_APPROVAL,
        action: "RECRUITMENT_REQUISITION_SUBMITTED",
      },
      approve: {
        from: [JobRequisitionStatus.PENDING_APPROVAL],
        to: JobRequisitionStatus.APPROVED,
        action: "RECRUITMENT_REQUISITION_APPROVED",
      },
      open: {
        from: [JobRequisitionStatus.APPROVED, JobRequisitionStatus.ON_HOLD],
        to: JobRequisitionStatus.OPEN,
        action: "RECRUITMENT_REQUISITION_OPENED",
      },
      hold: {
        from: [JobRequisitionStatus.OPEN],
        to: JobRequisitionStatus.ON_HOLD,
        action: "RECRUITMENT_REQUISITION_PUT_ON_HOLD",
      },
      close: {
        from: [JobRequisitionStatus.OPEN, JobRequisitionStatus.ON_HOLD],
        to: JobRequisitionStatus.CLOSED,
        action: "RECRUITMENT_REQUISITION_CLOSED",
      },
      cancel: {
        from: [
          JobRequisitionStatus.DRAFT,
          JobRequisitionStatus.PENDING_APPROVAL,
          JobRequisitionStatus.APPROVED,
          JobRequisitionStatus.OPEN,
          JobRequisitionStatus.ON_HOLD,
        ],
        to: JobRequisitionStatus.CANCELLED,
        action: "RECRUITMENT_REQUISITION_CANCELLED",
      },
    };
    const transition = transitions[action];
    if (!transition.from.includes(current.status)) {
      throw new ConflictException(
        `Cannot ${action} a requisition in ${current.status} status`,
      );
    }
    const now = new Date();
    const row = await this.prisma.jobRequisition.update({
      where: { id },
      data: {
        status: transition.to,
        ...(action === "approve"
          ? { approvedByUserId: principal.userId, approvedAt: now }
          : {}),
        ...(action === "open" ? { openedAt: now, closedAt: null } : {}),
        ...(action === "close" || action === "cancel" ? { closedAt: now } : {}),
      },
      include: requisitionInclude,
    });
    await this.record(
      transition.action,
      principal,
      "JobRequisition",
      row.id,
      request,
      { from: current.status, to: row.status },
    );
    return row;
  }

  async listApplicants(principal: Principal, query: ApplicantQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.RecruitmentApplicantWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.requisitionId ? { requisitionId: query.requisitionId } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.recruitmentApplicant.findMany({
        where,
        include: {
          requisition: { select: { id: true, code: true, title: true } },
          _count: { select: { interviews: true, onboardingTasks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.recruitmentApplicant.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  getApplicant(principal: Principal, id: string) {
    return this.applicant(principal, id);
  }

  async createApplicant(
    principal: Principal,
    dto: CreateApplicantDto,
    request?: RequestMetadata,
  ) {
    const requisition = await this.requisition(principal, dto.requisitionId);
    if (requisition.status !== JobRequisitionStatus.OPEN) {
      throw new ConflictException("Applicants can only be added to open requisitions");
    }
    const consentAt = new Date(dto.consentAt);
    if (consentAt.getTime() > Date.now() + 5 * 60_000) {
      throw new BadRequestException("Applicant consent timestamp cannot be in the future");
    }
    let row;
    try {
      row = await this.prisma.recruitmentApplicant.create({
        data: {
          organizationId: this.organizationId(principal),
          requisitionId: dto.requisitionId,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: dto.email.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          source: dto.source,
          consentAt,
          resumeUrl: dto.resumeUrl,
          notes: dto.notes?.trim(),
        },
        include: { requisition: { select: { id: true, code: true, title: true } } },
      });
    } catch (error) {
      this.duplicate(error, "Applicant email already exists for this requisition");
    }
    await this.record(
      "RECRUITMENT_APPLICANT_CREATED",
      principal,
      "RecruitmentApplicant",
      row.id,
      request,
      { requisitionId: row.requisitionId, source: row.source },
    );
    return row;
  }

  async scheduleInterview(
    principal: Principal,
    applicantId: string,
    dto: ScheduleInterviewDto,
    request?: RequestMetadata,
  ) {
    const applicant = await this.applicant(principal, applicantId);
    const terminalStatuses: RecruitmentApplicantStatus[] = [
        RecruitmentApplicantStatus.HIRED,
        RecruitmentApplicantStatus.REJECTED,
        RecruitmentApplicantStatus.WITHDRAWN,
      ];
    if (terminalStatuses.includes(applicant.status)) {
      throw new ConflictException("Applicant is no longer active in recruitment");
    }
    await this.employeeInOrganization(
      principal,
      dto.interviewerEmployeeId,
      "Interviewer",
    );
    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException("Interview must be scheduled in the future");
    }
    const row = await this.prisma.$transaction(async (tx) => {
      const interview = await tx.recruitmentInterview.create({
        data: {
          organizationId: this.organizationId(principal),
          applicantId,
          roundName: dto.roundName.trim(),
          scheduledAt,
          durationMinutes: dto.durationMinutes,
          mode: dto.mode,
          interviewerEmployeeId: dto.interviewerEmployeeId,
        },
      });
      await tx.recruitmentApplicant.update({
        where: { id: applicantId },
        data: { status: RecruitmentApplicantStatus.INTERVIEW },
      });
      return interview;
    });
    await this.record(
      "RECRUITMENT_INTERVIEW_SCHEDULED",
      principal,
      "RecruitmentInterview",
      row.id,
      request,
      { applicantId, scheduledAt: row.scheduledAt.toISOString() },
    );
    return row;
  }

  async completeInterview(
    principal: Principal,
    id: string,
    dto: CompleteInterviewDto,
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.recruitmentInterview.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Interview not found");
    if (current.status !== "SCHEDULED") {
      throw new ConflictException("Only scheduled interviews may be completed");
    }
    const row = await this.prisma.recruitmentInterview.update({
      where: { id },
      data: {
        status: "COMPLETED",
        score: new Prisma.Decimal(dto.score),
        recommendation: dto.recommendation,
        feedback: dto.feedback.trim(),
        completedAt: new Date(),
      },
    });
    await this.record(
      "RECRUITMENT_INTERVIEW_COMPLETED",
      principal,
      "RecruitmentInterview",
      id,
      request,
      { applicantId: row.applicantId, recommendation: row.recommendation },
    );
    return row;
  }

  async createOffer(
    principal: Principal,
    applicantId: string,
    dto: CreateOfferDto,
    request?: RequestMetadata,
  ) {
    const applicant = await this.applicant(principal, applicantId);
    if (
      ["HIRED", "REJECTED", "WITHDRAWN"].includes(applicant.status) ||
      !applicant.interviews.some((item) => item.status === "COMPLETED")
    ) {
      throw new ConflictException("A completed interview is required before an offer");
    }
    const existing = await this.prisma.recruitmentOffer.findFirst({
      where: {
        organizationId: this.organizationId(principal),
        applicantId,
        status: { in: ["DRAFT", "ISSUED", "ACCEPTED"] },
      },
    });
    if (existing) throw new ConflictException("Applicant already has an active offer");
    const row = await this.prisma.recruitmentOffer.create({
      data: {
        organizationId: this.organizationId(principal),
        applicantId,
        annualCtc: new Prisma.Decimal(dto.annualCtc),
        currency: dto.currency.trim().toUpperCase(),
        joiningDate: new Date(dto.joiningDate),
      },
    });
    await this.record(
      "RECRUITMENT_OFFER_CREATED",
      principal,
      "RecruitmentOffer",
      row.id,
      request,
      { applicantId },
    );
    return row;
  }

  async issueOffer(
    principal: Principal,
    id: string,
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.recruitmentOffer.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Offer not found");
    if (current.status !== "DRAFT") {
      throw new ConflictException("Only draft offers may be issued");
    }
    const row = await this.prisma.$transaction(async (tx) => {
      const offer = await tx.recruitmentOffer.update({
        where: { id },
        data: { status: "ISSUED", issuedAt: new Date() },
      });
      await tx.recruitmentApplicant.update({
        where: { id: offer.applicantId },
        data: { status: "OFFERED" },
      });
      return offer;
    });
    await this.record(
      "RECRUITMENT_OFFER_ISSUED",
      principal,
      "RecruitmentOffer",
      id,
      request,
      { applicantId: row.applicantId },
    );
    return row;
  }

  async recordOfferResponse(
    principal: Principal,
    id: string,
    dto: OfferResponseDto,
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.recruitmentOffer.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Offer not found");
    if (current.status !== "ISSUED") {
      throw new ConflictException("Only issued offers may record a response");
    }
    const row = await this.prisma.$transaction(async (tx) => {
      const offer = await tx.recruitmentOffer.update({
        where: { id },
        data: {
          status: dto.accepted ? "ACCEPTED" : "DECLINED",
          respondedAt: new Date(),
        },
      });
      await tx.recruitmentApplicant.update({
        where: { id: offer.applicantId },
        data: {
          status: dto.accepted
            ? RecruitmentApplicantStatus.HIRED
            : RecruitmentApplicantStatus.REJECTED,
        },
      });
      return offer;
    });
    await this.record(
      dto.accepted
        ? "RECRUITMENT_OFFER_ACCEPTED"
        : "RECRUITMENT_OFFER_DECLINED",
      principal,
      "RecruitmentOffer",
      id,
      request,
      { applicantId: row.applicantId },
    );
    return row;
  }

  async createOnboardingTask(
    principal: Principal,
    applicantId: string,
    dto: CreateOnboardingTaskDto,
    request?: RequestMetadata,
  ) {
    const applicant = await this.applicant(principal, applicantId);
    if (applicant.status !== RecruitmentApplicantStatus.HIRED) {
      throw new ConflictException("Onboarding tasks require an accepted offer");
    }
    await this.employeeInOrganization(principal, dto.ownerEmployeeId, "Task owner");
    const row = await this.prisma.recruitmentOnboardingTask.create({
      data: {
        organizationId: this.organizationId(principal),
        applicantId,
        title: dto.title.trim(),
        ownerEmployeeId: dto.ownerEmployeeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    await this.record(
      "RECRUITMENT_ONBOARDING_TASK_CREATED",
      principal,
      "RecruitmentOnboardingTask",
      row.id,
      request,
      { applicantId, ownerEmployeeId: row.ownerEmployeeId },
    );
    return row;
  }

  async updateOnboardingTask(
    principal: Principal,
    id: string,
    dto: UpdateOnboardingTaskDto,
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.recruitmentOnboardingTask.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Onboarding task not found");
    if (["COMPLETED", "WAIVED"].includes(current.status)) {
      throw new ConflictException("Completed or waived onboarding tasks are immutable");
    }
    const row = await this.prisma.recruitmentOnboardingTask.update({
      where: { id },
      data: {
        status: dto.status,
        completedAt: dto.status === "COMPLETED" ? new Date() : null,
      },
    });
    await this.record(
      "RECRUITMENT_ONBOARDING_TASK_UPDATED",
      principal,
      "RecruitmentOnboardingTask",
      id,
      request,
      { from: current.status, to: row.status },
    );
    return row;
  }
}
