import { Injectable } from "@nestjs/common";

import { Principal } from "../auth/auth.types";
import { V2ServiceBase } from "../common/v2-service.base";

/**
 * Read-only cross-domain rollups. Every count is derived transactionally and
 * scoped to the caller's organization, so no figure can cross a tenant boundary.
 */
@Injectable()
export class AnalyticsService extends V2ServiceBase {
  async overview(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const [
      programs,
      publishedPrograms,
      students,
      activeEnrollments,
      certificatesIssued,
      openTickets,
      pendingCompliance,
      publishedContent,
      activeVendors,
      purchaseOrders,
      assets,
      openReviews,
      openRequisitions,
    ] = await this.prisma.$transaction([
      this.prisma.program.count({ where: { organizationId } }),
      this.prisma.program.count({ where: { organizationId, status: "PUBLISHED" } }),
      this.prisma.student.count({ where: { organizationId } }),
      this.prisma.programEnrollment.count({ where: { organizationId, status: "ACTIVE" } }),
      this.prisma.programCertificate.count({ where: { organizationId } }),
      this.prisma.supportTicket.count({
        where: { organizationId, status: { notIn: ["RESOLVED", "CLOSED"] } },
      }),
      this.prisma.complianceObligation.count({
        where: { organizationId, status: { notIn: ["COMPLETED", "WAIVED"] } },
      }),
      this.prisma.cmsPage.count({ where: { organizationId, status: "PUBLISHED" } }),
      this.prisma.vendor.count({ where: { organizationId, status: "ACTIVE" } }),
      this.prisma.purchaseOrder.count({ where: { organizationId } }),
      this.prisma.asset.count({ where: { organizationId } }),
      this.prisma.performanceReview.count({
        where: { organizationId, status: { notIn: ["FINALIZED", "ACKNOWLEDGED"] } },
      }),
      this.prisma.jobRequisition.count({ where: { organizationId, status: "OPEN" } }),
    ]);
    return {
      education: { programs, publishedPrograms, students, activeEnrollments, certificatesIssued },
      operations: { openTickets, pendingCompliance, publishedContent },
      supplyChain: { activeVendors, purchaseOrders, assets },
      people: { openReviews, openRequisitions },
    };
  }
}
