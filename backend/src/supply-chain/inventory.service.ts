import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, StockMovementType } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import {
  CreateInventoryItemDto,
  InventoryItemQueryDto,
  StockAdjustmentDto,
} from "./dto/supply-chain.dto";

@Injectable()
export class InventoryService extends V2ServiceBase {
  private async item(principal: Principal, id: string) {
    const row = await this.prisma.inventoryItem.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
    });
    if (!row) throw new NotFoundException("Inventory item not found");
    return row;
  }

  getItem(principal: Principal, id: string) {
    return this.item(principal, id);
  }

  async listItems(principal: Principal, query: InventoryItemQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.InventoryItemWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { sku: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventoryItem.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async listMovements(principal: Principal, itemId: string, query: InventoryItemQueryDto) {
    await this.item(principal, itemId);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.StockMovementWhereInput = {
      organizationId: this.organizationId(principal),
      itemId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createItem(
    principal: Principal,
    dto: CreateInventoryItemDto,
    request?: RequestMetadata,
  ) {
    let row;
    try {
      row = await this.prisma.inventoryItem.create({
        data: {
          organizationId: this.organizationId(principal),
          sku: dto.sku.trim().toUpperCase(),
          name: dto.name.trim(),
          description: dto.description?.trim(),
          category: dto.category.trim(),
          unitOfMeasure: dto.unitOfMeasure?.trim().toUpperCase() ?? "EACH",
          unitCost: new Prisma.Decimal(dto.unitCost ?? 0),
          reorderLevel: new Prisma.Decimal(dto.reorderLevel ?? 0),
          createdByUserId: principal.userId,
        },
      });
    } catch (error) {
      this.duplicate(error, "An inventory item with this SKU already exists");
    }
    await this.record("INVENTORY_ITEM_CREATED", principal, "InventoryItem", row.id, request, {
      sku: row.sku,
    });
    return row;
  }

  /**
   * Applies a signed stock delta and records the movement ledger entry
   * transactionally so the running balance can never drift.
   */
  async adjustStock(
    principal: Principal,
    itemId: string,
    dto: StockAdjustmentDto,
    request?: RequestMetadata,
  ) {
    const item = await this.item(principal, itemId);
    if (dto.quantity === 0) {
      throw new BadRequestException("Adjustment quantity cannot be zero");
    }
    const currentBalance = Number(item.quantityOnHand);
    const newBalance = currentBalance + dto.quantity;
    if (newBalance < 0) {
      throw new BadRequestException("Adjustment would drive stock below zero");
    }
    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantityOnHand: new Prisma.Decimal(newBalance) },
      });
      await tx.stockMovement.create({
        data: {
          organizationId: this.organizationId(principal),
          itemId,
          type: StockMovementType.ADJUSTMENT,
          quantity: new Prisma.Decimal(dto.quantity),
          balanceAfter: new Prisma.Decimal(newBalance),
          note: dto.note?.trim(),
          createdByUserId: principal.userId,
        },
      });
      return updated;
    });
    await this.record("INVENTORY_STOCK_ADJUSTED", principal, "InventoryItem", itemId, request, {
      quantity: dto.quantity,
      balanceAfter: newBalance,
    });
    return row;
  }
}
