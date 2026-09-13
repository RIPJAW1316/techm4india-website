import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Shared helpers for V2 domain services: organization scoping, pagination,
 * audit recording, unique-constraint mapping, and employee reference checks.
 */
@Injectable()
export abstract class V2ServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly audit: AuditService,
  ) {}

  protected organizationId(principal: Principal): string {
    if (!principal.organizationId) {
      throw new ForbiddenException("Organization context required");
    }
    return principal.organizationId;
  }

  protected page(query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return { page, limit, skip: (page - 1) * limit, take: limit };
  }

  protected async record(
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

  protected duplicate(error: unknown, message: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException(message);
    }
    throw error;
  }

  protected async employeeInOrganization(
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
}
