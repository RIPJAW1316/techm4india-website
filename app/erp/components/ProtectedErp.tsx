"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { canAccessDivisionWorkspace, canAccessExecutiveWorkspace, resolveDashboardPath, type DivisionSlug } from "@/lib/erp/divisions";
import { useErpAuth } from "./AuthProvider";

export function ErpLoading({ label = "Restoring your workspace" }: { label?: string }) {
  return <div className="erp-state" role="status"><span className="erp-loader" aria-hidden="true" /><p>{label}</p></div>;
}

export function ProtectedErp({ children, requiredDivision, requiredExecutive = false }: { children: ReactNode; requiredDivision?: DivisionSlug; requiredExecutive?: boolean }) {
  const { status, context } = useErpAuth();
  const router = useRouter();
  const divisionAllowed = !requiredDivision || canAccessDivisionWorkspace(context, requiredDivision);
  const executiveAllowed = !requiredExecutive || canAccessExecutiveWorkspace(context);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && (!divisionAllowed || !executiveAllowed)) router.replace(resolveDashboardPath(context));
  }, [status, context, divisionAllowed, executiveAllowed, router]);

  if (status === "loading") return <ErpLoading />;
  if (status === "unauthenticated") return <ErpLoading label="Taking you to sign in" />;
  if (!divisionAllowed || !executiveAllowed) return <ErpLoading label="Opening your permitted workspace" />;
  return <>{children}</>;
}
