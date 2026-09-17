"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import { DIVISIONS, getDivisionConfig, isOrganizationWideContext } from "@/lib/erp/divisions";
import { ErpLoading, ProtectedErp } from "./components/ProtectedErp";
import { useErpAuth } from "./components/AuthProvider";

type VisibleDivision = { id: string; slug: string; name: string; status: string };

function ErpLandingContent() {
  const { context, logout } = useErpAuth();
  const router = useRouter();
  const [divisions, setDivisions] = useState<VisibleDivision[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const organizationWide = isOrganizationWideContext(context);

  useEffect(() => {
    if (context && !organizationWide && context.employee?.division?.slug) {
      const config = getDivisionConfig(context.employee.division.slug);
      if (config) router.replace(config.dashboardPath);
    }
  }, [context, organizationWide, router]);

  useEffect(() => {
    if (!organizationWide) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoadingDivisions(true);
      setError(null);
      void apiFetch<ApiResponse<VisibleDivision[]>>("/divisions")
        .then((response) => {
          if (!cancelled) setDivisions(response.data);
        })
        .catch((reason) => {
          if (!cancelled)
            setError(
              reason instanceof ApiError && reason.status === 403
                ? "Your organization access is still being configured."
                : "Available workspaces could not be loaded.",
            );
        })
        .finally(() => {
          if (!cancelled) setLoadingDivisions(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [organizationWide]);

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  const assignedDivisionConfig = getDivisionConfig(context?.employee?.division?.slug);

  if (context && !organizationWide && !assignedDivisionConfig) {
    return (
      <main className="erp-selector-shell">
        <section className="erp-selector-card" aria-labelledby="erp-config-title">
          <p className="erp-kicker">TechM4India ERP</p>
          <h1 id="erp-config-title">Workspace configuration needed</h1>
          <p>
            Your account is authenticated, but no supported division or department is assigned yet.
            Please contact your administrator.
          </p>
          <button
            className="erp-button erp-button-primary"
            type="button"
            onClick={() => void signOut()}
          >
            Sign out <span aria-hidden="true">↗</span>
          </button>
        </section>
      </main>
    );
  }

  if (!organizationWide) return <ErpLoading label="Opening your workspace" />;

  const availableConfigs = divisions
    .map((division) => getDivisionConfig(division.slug))
    .filter((config): config is NonNullable<typeof config> => Boolean(config));
  const visibleConfigs =
    availableConfigs.length > 0
      ? availableConfigs
      : DIVISIONS.filter((division) => divisions.some((item) => item.slug === division.slug));

  return (
    <main className="erp-selector-shell">
      <section className="erp-selector-card" aria-labelledby="erp-selector-title">
        <div className="erp-selector-header">
          <div>
            <p className="erp-kicker">TechM4India ERP</p>
            <h1 id="erp-selector-title">Choose a workspace</h1>
            <p>
              Welcome, {context?.employee?.firstName ?? context?.user.email}. Select a permitted
              division to continue.
            </p>
          </div>
          <button className="erp-text-button" type="button" onClick={() => void signOut()}>
            Log out ↗
          </button>
        </div>
        {loadingDivisions ? (
          <ErpLoading label="Loading permitted workspaces" />
        ) : error ? (
          <div className="erp-error" role="alert">
            <p>{error}</p>
            <button
              className="erp-text-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again ↗
            </button>
          </div>
        ) : visibleConfigs.length === 0 ? (
          <div className="erp-workspace-grid">
            <button
              className="erp-workspace-option"
              type="button"
              style={{ borderColor: "hsl(var(--primary))", background: "hsl(var(--card))" }}
              onClick={() => router.push("/erp/dashboard")}
            >
              <span>Command Center</span>
              <strong>TechM4India Command Center</strong>
              <small>
                Executive ERP overview &amp; registers <span aria-hidden="true">↗</span>
              </small>
            </button>
          </div>
        ) : (
          <div className="erp-workspace-grid">
            <button
              className="erp-workspace-option"
              type="button"
              style={{ borderColor: "hsl(var(--primary))", background: "hsl(var(--card))" }}
              onClick={() => router.push("/erp/dashboard")}
            >
              <span>Command Center</span>
              <strong>TechM4India Command Center</strong>
              <small>
                Executive ERP overview &amp; registers <span aria-hidden="true">↗</span>
              </small>
            </button>
            {visibleConfigs.map((division) => (
              <button
                className="erp-workspace-option"
                type="button"
                key={division.slug}
                onClick={() => router.replace(division.dashboardPath)}
              >
                <span>{division.shortName}</span>
                <strong>{division.displayName}</strong>
                <small>
                  {division.workspaceLabel} <span aria-hidden="true">↗</span>
                </small>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function ErpLandingPage() {
  return (
    <ProtectedErp>
      <ErpLandingContent />
    </ProtectedErp>
  );
}
