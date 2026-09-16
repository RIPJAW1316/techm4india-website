import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  PerformanceCycleStatus,
  PerformanceGoalStatus,
  PerformanceReviewStatus,
  Prisma,
} from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { PrismaService } from "../prisma/prisma.service";
import {
  AcknowledgeReviewDto,
  CreateCycleDto,
  CreateGoalDto,
  CreateReviewDto,
  CycleQueryDto,
  FinalizeReviewDto,
  GoalQueryDto,
  ManagerReviewDto,
  ReviewQueryDto,
  SelfAssessmentDto,
  UpdateGoalDto,
} from "./dto/performance.dto";

const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  designation: true,
} satisfies Prisma.EmployeeSelect;

const reviewInclude = {
  cycle: { select: { id: true, code: true, name: true, status: true, ratingScaleMax: true } },
  employee: { select: employeeSelect },
  reviewer: { select: employeeSelect },
} satisfies Prisma.PerformanceReviewInclude;

@Injectable()
export class PerformanceService {
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictException(message);
    }
    throw error;
  }

  private async employeeInOrganization(
    principal: Principal,
    employeeId: string,
    label = "Employee",
  ): Promise<void> {
    const row = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        division: { organizationId: this.organizationId(principal) },
        employmentStatus: { notIn: ["EXITED", "TERMINATED", "RESIGNED"] },
      },
      select: { id: true },
    });
    if (!row) throw new NotFoundException(`${label} not found in organization`);
  }

  private assertRatingWithinScale(rating: number, ratingScaleMax: number): void {
    if (rating > ratingScaleMax) {
      throw new BadRequestException(
        `Rating cannot exceed the cycle rating scale of ${ratingScaleMax}`,
      );
    }
  }

  private async cycle(principal: Principal, id: string) {
    const row = await this.prisma.performanceCycle.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: { _count: { select: { goals: true, reviews: true } } },
    });
    if (!row) throw new NotFoundException("Performance cycle not found");
    return row;
  }

  private async review(principal: Principal, id: string) {
    const row = await this.prisma.performanceReview.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: reviewInclude,
    });
    if (!row) throw new NotFoundException("Performance review not found");
    return row;
  }

  private assertReviewVisible(
    principal: Principal,
    review: { employeeId: string; reviewerEmployeeId: string },
  ): void {
    if (principal.permissions.includes("performance.reviews.manage")) return;
    if (
      review.employeeId === principal.employeeId ||
      review.reviewerEmployeeId === principal.employeeId
    ) {
      return;
    }
    throw new NotFoundException("Performance review not found");
  }

  // ----- Dashboard ---------------------------------------------------------

  async dashboard(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const cycles = await this.prisma.performanceCycle.groupBy({
      by: ["status"],
      where: { organizationId },
      orderBy: { status: "asc" },
      _count: { status: true },
    });
    const reviews = await this.prisma.performanceReview.groupBy({
      by: ["status"],
      where: { organizationId },
      orderBy: { status: "asc" },
      _count: { status: true },
    });
    const activeGoals = await this.prisma.performanceGoal.count({
      where: { organizationId, status: PerformanceGoalStatus.ACTIVE },
    });
    return {
      cycles: Object.fromEntries(cycles.map((item) => [item.status, item._count.status])),
      reviews: Object.fromEntries(reviews.map((item) => [item.status, item._count.status])),
      activeGoals,
    };
  }

  // ----- Cycles ------------------------------------------------------------

  async listCycles(principal: Principal, query: CycleQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.PerformanceCycleWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.performanceCycle.findMany({
        where,
        include: { _count: { select: { goals: true, reviews: true } } },
        orderBy: [{ startsOn: "desc" }],
        skip,
        take,
      }),
      this.prisma.performanceCycle.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  getCycle(principal: Principal, id: string) {
    return this.cycle(principal, id);
  }

  async createCycle(principal: Principal, dto: CreateCycleDto, request?: RequestMetadata) {
    const startsOn = new Date(dto.startsOn);
    const endsOn = new Date(dto.endsOn);
    if (endsOn.getTime() <= startsOn.getTime()) {
      throw new BadRequestException("Cycle end date must be after the start date");
    }
    let row;
    try {
      row = await this.prisma.performanceCycle.create({
        data: {
          organizationId: this.organizationId(principal),
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          type: dto.type,
          startsOn,
          endsOn,
          ratingScaleMax: dto.ratingScaleMax ?? 5,
          description: dto.description?.trim(),
          createdByUserId: principal.userId,
        },
      });
    } catch (error) {
      this.duplicate(error, "A cycle with this code already exists in the organization");
    }
    await this.record("PERFORMANCE_CYCLE_CREATED", principal, "PerformanceCycle", row.id, request, {
      code: row.code,
    });
    return row;
  }

  async transitionCycle(
    principal: Principal,
    id: string,
    action: "activate" | "close",
    request?: RequestMetadata,
  ) {
    const current = await this.cycle(principal, id);
    if (action === "activate" && current.status !== PerformanceCycleStatus.DRAFT) {
      throw new ConflictException("Only draft cycles can be activated");
    }
    if (action === "close" && current.status !== PerformanceCycleStatus.ACTIVE) {
      throw new ConflictException("Only active cycles can be closed");
    }
    const now = new Date();
    const row = await this.prisma.performanceCycle.update({
      where: { id },
      data:
        action === "activate"
          ? { status: PerformanceCycleStatus.ACTIVE, activatedAt: now }
          : { status: PerformanceCycleStatus.CLOSED, closedAt: now },
      include: { _count: { select: { goals: true, reviews: true } } },
    });
    await this.record(
      action === "activate" ? "PERFORMANCE_CYCLE_ACTIVATED" : "PERFORMANCE_CYCLE_CLOSED",
      principal,
      "PerformanceCycle",
      id,
      request,
      { from: current.status, to: row.status },
    );
    return row;
  }

  // ----- Goals -------------------------------------------------------------

  async listGoals(principal: Principal, query: GoalQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.PerformanceGoalWhereInput = {
      organizationId,
      ...(query.cycleId ? { cycleId: query.cycleId } : {}),
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.performanceGoal.findMany({
        where,
        include: { employee: { select: employeeSelect } },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.performanceGoal.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createGoal(
    principal: Principal,
    cycleId: string,
    dto: CreateGoalDto,
    request?: RequestMetadata,
  ) {
    const cycle = await this.cycle(principal, cycleId);
    if (cycle.status === PerformanceCycleStatus.CLOSED) {
      throw new ConflictException("Goals cannot be added to a closed cycle");
    }
    await this.employeeInOrganization(principal, dto.employeeId);
    const aggregate = await this.prisma.performanceGoal.aggregate({
      where: {
        cycleId,
        employeeId: dto.employeeId,
        status: { in: [PerformanceGoalStatus.ACTIVE, PerformanceGoalStatus.COMPLETED] },
      },
      _sum: { weight: true },
    });
    const existingWeight = Number(aggregate._sum.weight ?? 0);
    if (existingWeight + dto.weight > 100) {
      throw new ConflictException(
        `Goal weight would exceed 100% for this employee (currently ${existingWeight}%)`,
      );
    }
    const row = await this.prisma.performanceGoal.create({
      data: {
        organizationId: this.organizationId(principal),
        cycleId,
        employeeId: dto.employeeId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        category: dto.category ?? "BUSINESS",
        metric: dto.metric?.trim(),
        targetValue: dto.targetValue?.trim(),
        weight: new Prisma.Decimal(dto.weight),
        createdByUserId: principal.userId,
      },
      include: { employee: { select: employeeSelect } },
    });
    await this.record("PERFORMANCE_GOAL_CREATED", principal, "PerformanceGoal", row.id, request, {
      cycleId,
      employeeId: dto.employeeId,
    });
    return row;
  }

  async updateGoal(
    principal: Principal,
    id: string,
    dto: UpdateGoalDto,
    request?: RequestMetadata,
  ) {
    const current = await this.prisma.performanceGoal.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!current) throw new NotFoundException("Performance goal not found");
    const completing =
      dto.status === PerformanceGoalStatus.COMPLETED ||
      (dto.progressPercent !== undefined && dto.progressPercent >= 100);
    const row = await this.prisma.performanceGoal.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.progressPercent !== undefined
          ? { progressPercent: new Prisma.Decimal(dto.progressPercent) }
          : {}),
        ...(completing && current.status !== PerformanceGoalStatus.CANCELLED
          ? { status: PerformanceGoalStatus.COMPLETED, progressPercent: new Prisma.Decimal(100) }
          : {}),
      },
      include: { employee: { select: employeeSelect } },
    });
    await this.record("PERFORMANCE_GOAL_UPDATED", principal, "PerformanceGoal", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }

  // ----- Reviews -----------------------------------------------------------

  async listReviews(principal: Principal, query: ReviewQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const scoped = principal.permissions.includes("performance.reviews.manage")
      ? {}
      : {
          OR: [
            { employeeId: principal.employeeId ?? "" },
            { reviewerEmployeeId: principal.employeeId ?? "" },
          ],
        };
    const where: Prisma.PerformanceReviewWhereInput = {
      organizationId,
      ...(query.cycleId ? { cycleId: query.cycleId } : {}),
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...scoped,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.performanceReview.findMany({
        where,
        include: reviewInclude,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.performanceReview.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async getReview(principal: Principal, id: string) {
    const row = await this.review(principal, id);
    this.assertReviewVisible(principal, row);
    return row;
  }

  async createReview(
    principal: Principal,
    cycleId: string,
    dto: CreateReviewDto,
    request?: RequestMetadata,
  ) {
    const cycle = await this.cycle(principal, cycleId);
    if (cycle.status !== PerformanceCycleStatus.ACTIVE) {
      throw new ConflictException("Reviews can only be created within an active cycle");
    }
    if (dto.employeeId === dto.reviewerEmployeeId) {
      throw new BadRequestException("A reviewer cannot review themselves");
    }
    await this.employeeInOrganization(principal, dto.employeeId, "Employee");
    await this.employeeInOrganization(principal, dto.reviewerEmployeeId, "Reviewer");
    let row;
    try {
      row = await this.prisma.performanceReview.create({
        data: {
          organizationId: this.organizationId(principal),
          cycleId,
          employeeId: dto.employeeId,
          reviewerEmployeeId: dto.reviewerEmployeeId,
        },
        include: reviewInclude,
      });
    } catch (error) {
      this.duplicate(error, "A review already exists for this employee in the cycle");
    }
    await this.record(
      "PERFORMANCE_REVIEW_CREATED",
      principal,
      "PerformanceReview",
      row.id,
      request,
      {
        cycleId,
        employeeId: dto.employeeId,
      },
    );
    return row;
  }

  async submitSelfAssessment(
    principal: Principal,
    id: string,
    dto: SelfAssessmentDto,
    request?: RequestMetadata,
  ) {
    const current = await this.review(principal, id);
    if (current.employeeId !== principal.employeeId) {
      throw new ForbiddenException("Only the review subject can submit a self-assessment");
    }
    if (current.status !== PerformanceReviewStatus.PENDING_SELF) {
      throw new ConflictException("A self-assessment is not awaited for this review");
    }
    this.assertRatingWithinScale(dto.selfRating, current.cycle.ratingScaleMax);
    const row = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        status: PerformanceReviewStatus.PENDING_MANAGER,
        selfRating: new Prisma.Decimal(dto.selfRating),
        selfComments: dto.selfComments.trim(),
        selfSubmittedAt: new Date(),
      },
      include: reviewInclude,
    });
    await this.record(
      "PERFORMANCE_REVIEW_SELF_SUBMITTED",
      principal,
      "PerformanceReview",
      id,
      request,
      {
        from: current.status,
        to: row.status,
      },
    );
    return row;
  }

  async submitManagerReview(
    principal: Principal,
    id: string,
    dto: ManagerReviewDto,
    request?: RequestMetadata,
  ) {
    const current = await this.review(principal, id);
    if (current.status !== PerformanceReviewStatus.PENDING_MANAGER) {
      throw new ConflictException("A manager review is not awaited for this review");
    }
    this.assertRatingWithinScale(dto.managerRating, current.cycle.ratingScaleMax);
    const row = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        status: PerformanceReviewStatus.PENDING_FINALIZATION,
        managerRating: new Prisma.Decimal(dto.managerRating),
        managerComments: dto.managerComments.trim(),
        managerSubmittedAt: new Date(),
      },
      include: reviewInclude,
    });
    await this.record(
      "PERFORMANCE_REVIEW_MANAGER_SUBMITTED",
      principal,
      "PerformanceReview",
      id,
      request,
      {
        from: current.status,
        to: row.status,
      },
    );
    return row;
  }

  async finalizeReview(
    principal: Principal,
    id: string,
    dto: FinalizeReviewDto,
    request?: RequestMetadata,
  ) {
    const current = await this.review(principal, id);
    if (current.status !== PerformanceReviewStatus.PENDING_FINALIZATION) {
      throw new ConflictException("Only reviews awaiting finalization can be finalized");
    }
    this.assertRatingWithinScale(dto.finalRating, current.cycle.ratingScaleMax);
    const row = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        status: PerformanceReviewStatus.FINALIZED,
        finalRating: new Prisma.Decimal(dto.finalRating),
        calibrationNotes: dto.calibrationNotes?.trim(),
        finalizedByUserId: principal.userId,
        finalizedAt: new Date(),
      },
      include: reviewInclude,
    });
    await this.record("PERFORMANCE_REVIEW_FINALIZED", principal, "PerformanceReview", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }

  async acknowledgeReview(
    principal: Principal,
    id: string,
    dto: AcknowledgeReviewDto,
    request?: RequestMetadata,
  ) {
    const current = await this.review(principal, id);
    if (current.employeeId !== principal.employeeId) {
      throw new ForbiddenException("Only the review subject can acknowledge a review");
    }
    if (current.status !== PerformanceReviewStatus.FINALIZED) {
      throw new ConflictException("Only finalized reviews can be acknowledged");
    }
    const row = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        status: PerformanceReviewStatus.ACKNOWLEDGED,
        acknowledgement: dto.acknowledgement?.trim(),
        acknowledgedAt: new Date(),
      },
      include: reviewInclude,
    });
    await this.record(
      "PERFORMANCE_REVIEW_ACKNOWLEDGED",
      principal,
      "PerformanceReview",
      id,
      request,
      {
        from: current.status,
        to: row.status,
      },
    );
    return row;
  }
}
