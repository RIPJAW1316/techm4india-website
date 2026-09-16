import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Priority, SupportTicketStatus } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import {
  AddSupportCommentDto,
  AssignSupportTicketDto,
  CreateSupportTicketDto,
  SupportTicketQueryDto,
} from "./dto/support.dto";

const SLA_HOURS: Record<Priority, number> = {
  URGENT: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

const ticketInclude = {
  requester: { select: { id: true, firstName: true, lastName: true, designation: true } },
  assignee: { select: { id: true, firstName: true, lastName: true, designation: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.SupportTicketInclude;

@Injectable()
export class SupportService extends V2ServiceBase {
  private isAgent(principal: Principal): boolean {
    return principal.permissions.includes("support.tickets.resolve");
  }

  private visibilityFilter(principal: Principal): Prisma.SupportTicketWhereInput {
    if (this.isAgent(principal)) return {};
    const employeeId = principal.employeeId ?? "";
    return {
      OR: [{ requesterEmployeeId: employeeId }, { assigneeEmployeeId: employeeId }],
    };
  }

  private async ticket(principal: Principal, id: string) {
    const row = await this.prisma.supportTicket.findFirst({
      where: {
        id,
        organizationId: this.organizationId(principal),
        ...this.visibilityFilter(principal),
      },
      include: ticketInclude,
    });
    if (!row) throw new NotFoundException("Support ticket not found");
    return row;
  }

  async dashboard(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const where = { organizationId, ...this.visibilityFilter(principal) };
    const [byStatus, overdue] = await Promise.all([
      this.prisma.supportTicket.groupBy({
        by: ["status"],
        where,
        orderBy: { status: "asc" },
        _count: { status: true },
      }),
      this.prisma.supportTicket.count({
        where: {
          ...where,
          slaDueAt: { lt: new Date() },
          status: { notIn: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED] },
        },
      }),
    ]);
    return {
      tickets: Object.fromEntries(byStatus.map((item) => [item.status, item._count.status])),
      slaBreached: overdue,
    };
  }

  async listTickets(principal: Principal, query: SupportTicketQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.SupportTicketWhereInput = {
      organizationId,
      ...this.visibilityFilter(principal),
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.assigneeEmployeeId ? { assigneeEmployeeId: query.assigneeEmployeeId } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.supportTicket.findMany({
        where,
        include: ticketInclude,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  getTicket(principal: Principal, id: string) {
    return this.prisma.supportTicket
      .findFirst({
        where: {
          id,
          organizationId: this.organizationId(principal),
          ...this.visibilityFilter(principal),
        },
        include: {
          ...ticketInclude,
          comments: { orderBy: { createdAt: "asc" } },
        },
      })
      .then((row) => {
        if (!row) throw new NotFoundException("Support ticket not found");
        return row;
      });
  }

  async createTicket(principal: Principal, dto: CreateSupportTicketDto, request?: RequestMetadata) {
    const priority = dto.priority ?? Priority.MEDIUM;
    const now = new Date();
    const slaDueAt = new Date(now.getTime() + SLA_HOURS[priority] * 3_600_000);
    const code = `TKT-${now.getTime().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;
    let row;
    try {
      row = await this.prisma.supportTicket.create({
        data: {
          organizationId: this.organizationId(principal),
          requesterEmployeeId: principal.employeeId,
          code,
          subject: dto.subject.trim(),
          description: dto.description.trim(),
          category: dto.category,
          priority,
          slaDueAt,
          createdByUserId: principal.userId,
        },
        include: ticketInclude,
      });
    } catch (error) {
      this.duplicate(error, "A ticket with this code already exists");
    }
    await this.record("SUPPORT_TICKET_CREATED", principal, "SupportTicket", row.id, request, {
      code: row.code,
      priority,
    });
    return row;
  }

  async addComment(
    principal: Principal,
    id: string,
    dto: AddSupportCommentDto,
    request?: RequestMetadata,
  ) {
    const ticket = await this.ticket(principal, id);
    const comment = await this.prisma.supportTicketComment.create({
      data: {
        ticketId: id,
        authorUserId: principal.userId,
        body: dto.body.trim(),
        isInternal: dto.isInternal ?? false,
      },
    });
    if (!ticket.firstResponseAt && this.isAgent(principal)) {
      await this.prisma.supportTicket.update({
        where: { id },
        data: { firstResponseAt: new Date() },
      });
    }
    await this.record("SUPPORT_TICKET_COMMENTED", principal, "SupportTicket", id, request, {
      commentId: comment.id,
    });
    return comment;
  }

  async transition(
    principal: Principal,
    id: string,
    action: "hold" | "resume" | "resolve" | "close" | "reopen",
    request?: RequestMetadata,
  ) {
    const current = await this.ticket(principal, id);
    const transitions: Record<
      typeof action,
      { from: SupportTicketStatus[]; to: SupportTicketStatus }
    > = {
      hold: { from: [SupportTicketStatus.IN_PROGRESS], to: SupportTicketStatus.PENDING },
      resume: { from: [SupportTicketStatus.PENDING], to: SupportTicketStatus.IN_PROGRESS },
      resolve: {
        from: [SupportTicketStatus.IN_PROGRESS, SupportTicketStatus.PENDING],
        to: SupportTicketStatus.RESOLVED,
      },
      close: { from: [SupportTicketStatus.RESOLVED], to: SupportTicketStatus.CLOSED },
      reopen: {
        from: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED],
        to: SupportTicketStatus.REOPENED,
      },
    };
    const transition = transitions[action];
    if (!transition.from.includes(current.status)) {
      throw new ConflictException(`Cannot ${action} a ticket in ${current.status} status`);
    }
    const now = new Date();
    const row = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: transition.to,
        ...(action === "resolve" ? { resolvedAt: now } : {}),
        ...(action === "close" ? { closedAt: now } : {}),
        ...(action === "reopen" ? { resolvedAt: null, closedAt: null } : {}),
      },
      include: ticketInclude,
    });
    await this.record(
      `SUPPORT_TICKET_${action.toUpperCase()}`,
      principal,
      "SupportTicket",
      id,
      request,
      {
        from: current.status,
        to: row.status,
      },
    );
    return row;
  }

  async assignTicket(
    principal: Principal,
    id: string,
    dto: AssignSupportTicketDto,
    request?: RequestMetadata,
  ) {
    const current = await this.ticket(principal, id);
    if (
      current.status === SupportTicketStatus.RESOLVED ||
      current.status === SupportTicketStatus.CLOSED
    ) {
      throw new ConflictException("Resolved or closed tickets cannot be assigned");
    }
    await this.employeeInOrganization(principal, dto.assigneeEmployeeId, "Assignee");
    const row = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        assigneeEmployeeId: dto.assigneeEmployeeId,
        status: SupportTicketStatus.IN_PROGRESS,
        firstResponseAt: current.firstResponseAt ?? new Date(),
      },
      include: ticketInclude,
    });
    await this.record("SUPPORT_TICKET_ASSIGNED", principal, "SupportTicket", id, request, {
      assigneeEmployeeId: dto.assigneeEmployeeId,
    });
    return row;
  }
}
