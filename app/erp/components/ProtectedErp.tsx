"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  canAccessDivisionWorkspace,
  canAccessExecutiveWorkspace,
  resolveDashboardPath,
  type DivisionSlug,
} from "@/lib/erp/divisions";
import { useErpAuth } from "./AuthProvider";

export function ErpLoading({
  label = "Restoring your workspace",
}: {
  label?: string;
}) {
  return (
    <div className="erp-state" role="status">
      <span className="erp-loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ProtectedErp({
  children,
  requiredDivision,
  requiredExecutive = false,
  requiredHr = false,
  requiredAdmin = false,
  requiredPayroll = false,
  requiredFinance = false,
  requiredRecruitment = false,
  requiredPrograms = false,
  requiredPerformance = false,
  requiredSupplyChain = false,
  requiredSupport = false,
  requiredCms = false,
  requiredCompliance = false,
  requiredDelivery = false,
  requiredAnalytics = false,
}: {
  children: ReactNode;
  requiredDivision?: DivisionSlug;
  requiredExecutive?: boolean;
  requiredHr?: boolean;
  requiredAdmin?: boolean;
  requiredPayroll?: boolean;
  requiredFinance?: boolean;
  requiredRecruitment?: boolean;
  requiredPrograms?: boolean;
  requiredPerformance?: boolean;
  requiredSupplyChain?: boolean;
  requiredSupport?: boolean;
  requiredCms?: boolean;
  requiredCompliance?: boolean;
  requiredDelivery?: boolean;
  requiredAnalytics?: boolean;
}) {
  const { status, context } = useErpAuth();
  const router = useRouter();
  const divisionAllowed =
    !requiredDivision || canAccessDivisionWorkspace(context, requiredDivision);
  const executiveAllowed =
    !requiredExecutive || canAccessExecutiveWorkspace(context);
  const hrAllowed =
    !requiredHr || Boolean(context?.permissions.includes("hr.employees.read"));
  const adminAllowed =
    !requiredAdmin ||
    Boolean(context?.permissions.includes("admin.users.read"));
  const payrollAllowed =
    !requiredPayroll ||
    Boolean(context?.permissions.includes("payroll.dashboard.read"));
  const financeAllowed =
    !requiredFinance ||
    Boolean(context?.permissions.includes("finance.dashboard.read"));
  const recruitmentAllowed =
    !requiredRecruitment ||
    Boolean(context?.permissions.includes("recruitment.dashboard.read"));
  const programsAllowed =
    !requiredPrograms ||
    Boolean(context?.permissions.includes("programs.read"));
  const performanceAllowed =
    !requiredPerformance ||
    Boolean(context?.permissions.includes("performance.cycles.read"));
  const supplyChainAllowed =
    !requiredSupplyChain ||
    Boolean(
      context?.permissions.some((permission) =>
        [
          "procurement.vendors.read",
          "procurement.orders.read",
          "inventory.read",
          "assets.read",
        ].includes(permission),
      ),
    );
  const supportAllowed =
    !requiredSupport ||
    Boolean(context?.permissions.includes("support.tickets.read"));
  const cmsAllowed =
    !requiredCms || Boolean(context?.permissions.includes("cms.content.read"));
  const complianceAllowed =
    !requiredCompliance || Boolean(context?.permissions.includes("compliance.read"));
  const deliveryAllowed =
    !requiredDelivery || Boolean(context?.permissions.includes("projects.delivery.read"));
  const analyticsAllowed =
    !requiredAnalytics || Boolean(context?.permissions.includes("analytics.read"));

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (
      status === "authenticated" &&
      (!divisionAllowed || !executiveAllowed || !hrAllowed || !adminAllowed || !payrollAllowed || !financeAllowed || !recruitmentAllowed || !programsAllowed || !performanceAllowed || !supplyChainAllowed || !supportAllowed || !cmsAllowed || !complianceAllowed || !deliveryAllowed || !analyticsAllowed)
    )
      router.replace(resolveDashboardPath(context));
  }, [
    status,
    context,
    divisionAllowed,
    executiveAllowed,
    hrAllowed,
    adminAllowed,
    payrollAllowed,
    financeAllowed,
    recruitmentAllowed,
    programsAllowed,
    performanceAllowed,
    supplyChainAllowed,
    supportAllowed,
    cmsAllowed,
    complianceAllowed,
    deliveryAllowed,
    analyticsAllowed,
    router,
  ]);

  if (status === "loading") return <ErpLoading />;
  if (status === "unauthenticated")
    return <ErpLoading label="Taking you to sign in" />;
  if (!divisionAllowed || !executiveAllowed || !hrAllowed || !adminAllowed || !payrollAllowed || !financeAllowed || !recruitmentAllowed || !programsAllowed || !performanceAllowed || !supplyChainAllowed || !supportAllowed || !cmsAllowed || !complianceAllowed || !deliveryAllowed || !analyticsAllowed)
    return <ErpLoading label="Opening your permitted workspace" />;
  return <>{children}</>;
}
