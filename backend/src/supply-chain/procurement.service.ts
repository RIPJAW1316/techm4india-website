import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PurchaseOrderStatus, StockMovementType } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import {
  CreatePurchaseOrderDto,
  PurchaseOrderQueryDto,
} from "./dto/supply-chain.dto";

const orderInclude = {
  vendor: { select: { id: true, code: true, name: true, status: true } },
  items: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.PurchaseOrderInclude;

@Injectable()
export class ProcurementService extends V2ServiceBase {
  private async order(principal: Principal, id: string) {
    const row = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: orderInclude,
    });
    if (!row) throw new NotFoundException("Purchase order not found");
    return row;
  }

  getOrder(principal: Principal, id: string) {
    return this.order(principal, id);
  }

  async listOrders(principal: Principal, query: PurchaseOrderQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.PurchaseOrderWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.vendorId ? { vendorId: query.vendorId } : {}),
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
      this.prisma.purchaseOrder.findMany({
        where,
        include: orderInclude,
        orderBy: [{ orderDate: "desc" }],
        skip,
        take,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createOrder(
    principal: Principal,
    dto: CreatePurchaseOrderDto,
    request?: RequestMetadata,
  ) {
    const organizationId = this.organizationId(principal);
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: dto.vendorId, organizationId },
      select: { id: true, status: true },
    });
    if (!vendor) throw new NotFoundException("Vendor not found in organization");
    if (vendor.status !== "ACTIVE") {
      throw new ConflictException("Purchase orders require an active vendor");
    }
    const itemIds = dto.items
      .map((item) => item.itemId)
      .filter((id): id is string => Boolean(id));
    if (itemIds.length > 0) {
      const found = await this.prisma.inventoryItem.count({
        where: { id: { in: itemIds }, organizationId },
      });
      if (found !== new Set(itemIds).size) {
        throw new NotFoundException("One or more inventory items were not found");
      }
    }
    const total = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    );
    let row;
    try {
      row = await this.prisma.purchaseOrder.create({
        data: {
          organizationId,
          vendorId: dto.vendorId,
          code: dto.code.trim().toUpperCase(),
          title: dto.title.trim(),
          currency: dto.currency?.trim().toUpperCase() ?? "INR",
          orderDate: new Date(dto.orderDate),
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
          totalAmount: new Prisma.Decimal(total.toFixed(2)),
          notes: dto.notes?.trim(),
          createdByUserId: principal.userId,
          items: {
            create: dto.items.map((item) => ({
              itemId: item.itemId,
              description: item.description.trim(),
              quantity: new Prisma.Decimal(item.quantity),
              unitCost: new Prisma.Decimal(item.unitCost),
            })),
          },
        },
        include: orderInclude,
      });
    } catch (error) {
      this.duplicate(error, "A purchase order with this code already exists");
    }
    await this.record("PURCHASE_ORDER_CREATED", principal, "PurchaseOrder", row.id, request, {
      code: row.code,
      total,
    });
    return row;
  }

  async transitionOrder(
    principal: Principal,
    id: string,
    action: "submit" | "approve" | "issue" | "cancel",
    request?: RequestMetadata,
  ) {
    const current = await this.order(principal, id);
    const transitions: Record<
      typeof action,
      { from: PurchaseOrderStatus[]; to: PurchaseOrderStatus }
    > = {
      submit: { from: [PurchaseOrderStatus.DRAFT], to: PurchaseOrderStatus.SUBMITTED },
      approve: { from: [PurchaseOrderStatus.SUBMITTED], to: PurchaseOrderStatus.APPROVED },
      issue: { from: [PurchaseOrderStatus.APPROVED], to: PurchaseOrderStatus.ISSUED },
      cancel: {
        from: [
          PurchaseOrderStatus.DRAFT,
          PurchaseOrderStatus.SUBMITTED,
          PurchaseOrderStatus.APPROVED,
          PurchaseOrderStatus.ISSUED,
        ],
        to: PurchaseOrderStatus.CANCELLED,
      },
    };
    const transition = transitions[action];
    if (!transition.from.includes(current.status)) {
      throw new ConflictException(`Cannot ${action} an order in ${current.status} status`);
    }
    const now = new Date();
    const row = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: transition.to,
        ...(action === "submit" ? { submittedAt: now } : {}),
        ...(action === "approve"
          ? { approvedByUserId: principal.userId, approvedAt: now }
          : {}),
        ...(action === "issue" ? { issuedAt: now } : {}),
        ...(action === "cancel" ? { closedAt: now } : {}),
      },
      include: orderInclude,
    });
    await this.record(`PURCHASE_ORDER_${action.toUpperCase()}`, principal, "PurchaseOrder", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }

  /**
   * Receives all outstanding lines of an issued order, incrementing inventory
   * stock and writing a RECEIPT movement for each linked item, transactionally.
   */
  async receiveOrder(principal: Principal, id: string, request?: RequestMetadata) {
    const current = await this.order(principal, id);
    if (
      current.status !== PurchaseOrderStatus.ISSUED &&
      current.status !== PurchaseOrderStatus.PARTIALLY_RECEIVED
    ) {
      throw new ConflictException("Only issued orders can be received");
    }
    const organizationId = this.organizationId(principal);
    const row = await this.prisma.$transaction(async (tx) => {
      for (const line of current.items) {
        const outstanding = Number(line.quantity) - Number(line.receivedQuantity);
        if (outstanding <= 0) continue;
        await tx.purchaseOrderItem.update({
          where: { id: line.id },
          data: { receivedQuantity: line.quantity },
        });
        if (line.itemId) {
          const item = await tx.inventoryItem.findUniqueOrThrow({
            where: { id: line.itemId },
            select: { quantityOnHand: true },
          });
          const balanceAfter = Number(item.quantityOnHand) + outstanding;
          await tx.inventoryItem.update({
            where: { id: line.itemId },
            data: { quantityOnHand: new Prisma.Decimal(balanceAfter) },
          });
          await tx.stockMovement.create({
            data: {
              organizationId,
              itemId: line.itemId,
              type: StockMovementType.RECEIPT,
              quantity: new Prisma.Decimal(outstanding),
              balanceAfter: new Prisma.Decimal(balanceAfter),
              reference: current.code,
              createdByUserId: principal.userId,
            },
          });
        }
      }
      return tx.purchaseOrder.update({
        where: { id },
        data: { status: PurchaseOrderStatus.RECEIVED, closedAt: new Date() },
        include: orderInclude,
      });
    });
    await this.record("PURCHASE_ORDER_RECEIVED", principal, "PurchaseOrder", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }
}
