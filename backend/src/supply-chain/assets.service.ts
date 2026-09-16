import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { AssetStatus, Prisma } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import { AssignAssetDto, AssetQueryDto, CreateAssetDto } from "./dto/supply-chain.dto";

const assetInclude = {
  vendor: { select: { id: true, code: true, name: true } },
  assignedTo: {
    select: { id: true, employeeCode: true, firstName: true, lastName: true },
  },
} satisfies Prisma.AssetInclude;

@Injectable()
export class AssetsService extends V2ServiceBase {
  private async asset(principal: Principal, id: string) {
    const row = await this.prisma.asset.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: assetInclude,
    });
    if (!row) throw new NotFoundException("Asset not found");
    return row;
  }

  getAsset(principal: Principal, id: string) {
    return this.asset(principal, id);
  }

  async listAssets(principal: Principal, query: AssetQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.AssetWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(search
        ? {
            OR: [
              { assetTag: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        include: assetInclude,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.asset.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createAsset(principal: Principal, dto: CreateAssetDto, request?: RequestMetadata) {
    const organizationId = this.organizationId(principal);
    if (dto.vendorId) {
      const vendor = await this.prisma.vendor.findFirst({
        where: { id: dto.vendorId, organizationId },
        select: { id: true },
      });
      if (!vendor) throw new NotFoundException("Vendor not found in organization");
    }
    let row;
    try {
      row = await this.prisma.asset.create({
        data: {
          organizationId,
          vendorId: dto.vendorId,
          assetTag: dto.assetTag.trim().toUpperCase(),
          name: dto.name.trim(),
          category: dto.category,
          serialNumber: dto.serialNumber?.trim(),
          purchaseCost:
            dto.purchaseCost !== undefined ? new Prisma.Decimal(dto.purchaseCost) : undefined,
          acquiredOn: dto.acquiredOn ? new Date(dto.acquiredOn) : undefined,
          warrantyEndsOn: dto.warrantyEndsOn ? new Date(dto.warrantyEndsOn) : undefined,
          location: dto.location?.trim(),
          notes: dto.notes?.trim(),
          createdByUserId: principal.userId,
        },
        include: assetInclude,
      });
    } catch (error) {
      this.duplicate(error, "An asset with this tag already exists in the organization");
    }
    await this.record("ASSET_CREATED", principal, "Asset", row.id, request, {
      assetTag: row.assetTag,
    });
    return row;
  }

  async assignAsset(
    principal: Principal,
    id: string,
    dto: AssignAssetDto,
    request?: RequestMetadata,
  ) {
    const current = await this.asset(principal, id);
    if (current.status !== AssetStatus.IN_STORE && current.status !== AssetStatus.IN_REPAIR) {
      throw new ConflictException(`Cannot assign an asset in ${current.status} status`);
    }
    await this.employeeInOrganization(principal, dto.assignedEmployeeId, "Assignee");
    const row = await this.prisma.asset.update({
      where: { id },
      data: {
        status: AssetStatus.ASSIGNED,
        assignedEmployeeId: dto.assignedEmployeeId,
        location: dto.location?.trim() ?? current.location,
        assignedAt: new Date(),
      },
      include: assetInclude,
    });
    await this.record("ASSET_ASSIGNED", principal, "Asset", id, request, {
      assignedEmployeeId: dto.assignedEmployeeId,
    });
    return row;
  }

  async returnAsset(principal: Principal, id: string, request?: RequestMetadata) {
    const current = await this.asset(principal, id);
    if (current.status !== AssetStatus.ASSIGNED) {
      throw new ConflictException("Only assigned assets can be returned");
    }
    const row = await this.prisma.asset.update({
      where: { id },
      data: { status: AssetStatus.IN_STORE, assignedEmployeeId: null, assignedAt: null },
      include: assetInclude,
    });
    await this.record("ASSET_RETURNED", principal, "Asset", id, request, {});
    return row;
  }

  async retireAsset(principal: Principal, id: string, request?: RequestMetadata) {
    const current = await this.asset(principal, id);
    if (current.status === AssetStatus.RETIRED) {
      throw new ConflictException("Asset is already retired");
    }
    const row = await this.prisma.asset.update({
      where: { id },
      data: {
        status: AssetStatus.RETIRED,
        assignedEmployeeId: null,
        retiredAt: new Date(),
      },
      include: assetInclude,
    });
    await this.record("ASSET_RETIRED", principal, "Asset", id, request, {
      from: current.status,
    });
    return row;
  }
}
