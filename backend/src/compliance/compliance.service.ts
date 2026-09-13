import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ComplianceStatus, Prisma } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import {
  AddComplianceEvidenceDto,
  ComplianceQueryDto,
  CreateComplianceObligationDto,
} from "./dto/compliance.dto";

const obligationInclude = {
  owner: { select: { id: true, firstName: true, lastName: true, designation: true } },
  _count: { select: { evidence: true } },
} satisfies Prisma.ComplianceObligationInclude;

@Injectable()
export class ComplianceService extends V2ServiceBase {
  private async obligation(principal: Principal, id: string) {
    const row = await this.prisma.complianceObligation.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: obligationInclude,
    });
    if (!row) throw new NotFoundException("Compliance obligation not found");
    return row;
  }

  getObligation(principal: Principal, id: string) {
    return this.prisma.complianceObligation
      .findFirst({
        where: { id, organizationId: this.organizationId(principal) },
        include: { ...obligationInclude, evidence: { orderBy: { createdAt: "desc" } } },
      })
      .then((row) => {
        if (!row) throw new NotFoundException("Compliance obligation not found");
        return row;
      });
  }

  async dashboard(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const [byStatus, overdue] = await Promise.all([
      this.prisma.complianceObligation.groupBy({
        by: ["status"],
        where: { organizationId },
        orderBy: { status: "asc" },
        _count: { status: true },
      }),
      this.prisma.complianceObligation.count({
        where: {
          organizationId,
          dueDate: { lt: new Date() },
          status: { notIn: [ComplianceStatus.COMPLETED, ComplianceStatus.WAIVED] },
        },
      }),
    ]);
    return {
      obligations: Object.fromEntries(byStatus.map((item) => [item.status, item._count.status])),
      overdue,
    };
  }

  async listObligations(principal: Principal, query: ComplianceQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.ComplianceObligationWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
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
      this.prisma.complianceObligation.findMany({
        where,
        include: obligationInclude,
        orderBy: [{ dueDate: "asc" }],
        skip,
        take,
      }),
      this.prisma.complianceObligation.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createObligation(
    principal: Principal,
    dto: CreateComplianceObligationDto,
    request?: RequestMetadata,
  ) {
    if (dto.ownerEmployeeId) {
      await this.employeeInOrganization(principal, dto.ownerEmployeeId, "Owner");
    }
    let row;
    try {
      row = await this.prisma.complianceObligation.create({
        data: {
          organizationId: this.organizationId(principal),
          ownerEmployeeId: dto.ownerEmployeeId,
          code: dto.code.trim().toUpperCase(),
          title: dto.title.trim(),
          description: dto.description?.trim(),
          category: dto.category,
          authority: dto.authority?.trim(),
          frequency: dto.frequency ?? "ONE_TIME",
          dueDate: new Date(dto.dueDate),
          createdByUserId: principal.userId,
        },
        include: obligationInclude,
      });
    } catch (error) {
      this.duplicate(error, "A compliance obligation with this code already exists");
    }
    await this.record("COMPLIANCE_OBLIGATION_CREATED", principal, "ComplianceObligation", row.id, request, {
      code: row.code,
    });
    return row;
  }

  async addEvidence(
    principal: Principal,
    id: string,
    dto: AddComplianceEvidenceDto,
    request?: RequestMetadata,
  ) {
    const current = await this.obligation(principal, id);
    if (
      current.status === ComplianceStatus.COMPLETED ||
      current.status === ComplianceStatus.WAIVED
    ) {
      throw new ConflictException("Evidence cannot be added to a closed obligation");
    }
    const evidence = await this.prisma.complianceEvidence.create({
      data: {
        obligationId: id,
        title: dto.title.trim(),
        note: dto.note?.trim(),
        documentUrl: dto.documentUrl?.trim(),
        uploadedByUserId: principal.userId,
      },
    });
    await this.record("COMPLIANCE_EVIDENCE_ADDED", principal, "ComplianceObligation", id, request, {
      evidenceId: evidence.id,
    });
    return evidence;
  }

  async transition(
    principal: Principal,
    id: string,
    action: "start" | "submit" | "complete" | "waive",
    request?: RequestMetadata,
  ) {
    const current = await this.obligation(principal, id);
    const transitions: Record<
      typeof action,
      { from: ComplianceStatus[]; to: ComplianceStatus }
    > = {
      start: { from: [ComplianceStatus.PENDING], to: ComplianceStatus.IN_PROGRESS },
      submit: {
        from: [ComplianceStatus.IN_PROGRESS],
        to: ComplianceStatus.SUBMITTED,
      },
      complete: {
        from: [ComplianceStatus.SUBMITTED],
        to: ComplianceStatus.COMPLETED,
      },
      waive: {
        from: [
          ComplianceStatus.PENDING,
          ComplianceStatus.IN_PROGRESS,
          ComplianceStatus.SUBMITTED,
        ],
        to: ComplianceStatus.WAIVED,
      },
    };
    const transition = transitions[action];
    if (!transition.from.includes(current.status)) {
      throw new ConflictException(`Cannot ${action} an obligation in ${current.status} status`);
    }
    if (action === "submit" && current._count.evidence < 1) {
      throw new ConflictException("At least one evidence record is required before submission");
    }
    const now = new Date();
    const row = await this.prisma.complianceObligation.update({
      where: { id },
      data: {
        status: transition.to,
        ...(action === "submit" ? { submittedAt: now } : {}),
        ...(action === "complete" ? { completedAt: now } : {}),
      },
      include: obligationInclude,
    });
    await this.record(`COMPLIANCE_OBLIGATION_${action.toUpperCase()}`, principal, "ComplianceObligation", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }
}
