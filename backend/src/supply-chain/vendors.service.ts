import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, VendorStatus } from "@prisma/client";

import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import { CreateVendorDto, VendorQueryDto } from "./dto/supply-chain.dto";

@Injectable()
export class VendorsService extends V2ServiceBase {
  private async vendor(principal: Principal, id: string) {
    const row = await this.prisma.vendor.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: { _count: { select: { purchaseOrders: true, assets: true } } },
    });
    if (!row) throw new NotFoundException("Vendor not found");
    return row;
  }

  getVendor(principal: Principal, id: string) {
    return this.vendor(principal, id);
  }

  async listVendors(principal: Principal, query: VendorQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.VendorWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
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
      this.prisma.vendor.findMany({ where, orderBy: [{ createdAt: "desc" }], skip, take }),
      this.prisma.vendor.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createVendor(
    principal: Principal,
    dto: CreateVendorDto,
    request?: RequestMetadata,
  ) {
    let row;
    try {
      row = await this.prisma.vendor.create({
        data: {
          organizationId: this.organizationId(principal),
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          legalName: dto.legalName?.trim(),
          category: dto.category,
          contactEmail: dto.contactEmail?.trim().toLowerCase(),
          contactPhone: dto.contactPhone?.trim(),
          gstin: dto.gstin?.trim().toUpperCase(),
          pan: dto.pan?.trim().toUpperCase(),
          addressLine1: dto.addressLine1?.trim(),
          city: dto.city?.trim(),
          state: dto.state?.trim(),
          country: dto.country?.trim(),
          paymentTermsDays: dto.paymentTermsDays ?? 30,
          notes: dto.notes?.trim(),
          createdByUserId: principal.userId,
        },
      });
    } catch (error) {
      this.duplicate(error, "A vendor with this code already exists in the organization");
    }
    await this.record("VENDOR_CREATED", principal, "Vendor", row.id, request, {
      code: row.code,
    });
    return row;
  }

  async transitionVendor(
    principal: Principal,
    id: string,
    action: "approve" | "suspend" | "reinstate" | "blacklist",
    request?: RequestMetadata,
  ) {
    const current = await this.vendor(principal, id);
    const transitions: Record<
      typeof action,
      { from: VendorStatus[]; to: VendorStatus }
    > = {
      approve: { from: [VendorStatus.PENDING_APPROVAL], to: VendorStatus.ACTIVE },
      suspend: { from: [VendorStatus.ACTIVE], to: VendorStatus.SUSPENDED },
      reinstate: { from: [VendorStatus.SUSPENDED], to: VendorStatus.ACTIVE },
      blacklist: {
        from: [
          VendorStatus.PENDING_APPROVAL,
          VendorStatus.ACTIVE,
          VendorStatus.SUSPENDED,
        ],
        to: VendorStatus.BLACKLISTED,
      },
    };
    const transition = transitions[action];
    if (!transition.from.includes(current.status)) {
      throw new ConflictException(`Cannot ${action} a vendor in ${current.status} status`);
    }
    const row = await this.prisma.vendor.update({
      where: { id },
      data: {
        status: transition.to,
        ...(action === "approve"
          ? { approvedByUserId: principal.userId, approvedAt: new Date() }
          : {}),
      },
    });
    await this.record(`VENDOR_${action.toUpperCase()}`, principal, "Vendor", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }
}
