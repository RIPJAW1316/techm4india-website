import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, Prisma } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: Principal, page = 1, limit = 20) {
    const where = { userId: principal.userId };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, type: true, title: true, body: true, readAt: true, createdAt: true, resourceType: true, resourceId: true },
      }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async markRead(principal: Principal, id: string) {
    const result = await this.prisma.notification.updateMany({ where: { id, userId: principal.userId }, data: { readAt: new Date() } });
    if (!result.count) throw new NotFoundException("Notification not found");
    return this.prisma.notification.findUniqueOrThrow({ where: { id } });
  }

  async create(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    resourceType?: string;
    resourceId?: string;
    tx?: Prisma.TransactionClient;
  }) {
    const client = input.tx ?? this.prisma;
    return client.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
      },
    });
  }
}
