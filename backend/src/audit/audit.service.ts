import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { RequestMetadata } from "../auth/interfaces/request-metadata";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: {
    action: string;
    actorUserId?: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    request?: RequestMetadata;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: input.action,
        actorUserId: input.actorUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: input.request?.ipAddress,
        userAgent: input.request?.userAgent?.slice(0, 512),
      },
    });
  }
}
