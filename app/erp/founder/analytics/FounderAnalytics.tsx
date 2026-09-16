"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type { AnalyticsOverview, ApiResponse } from "@/lib/api/types";

function FounderAnalyticsContent() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchV2<ApiResponse<AnalyticsOverview>>("/analytics/overview");
      setOverview(response.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Analytics could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sections: Array<{
    kicker: string;
    heading: string;
    stats: Array<[string, number, string]>;
  }> = overview
    ? [
        {
          kicker: "Education",
          heading: "Learning delivery",
          stats: [
            ["Programmes", overview.education.programs, "All lifecycle states"],
            ["Published", overview.education.publishedPrograms, "Ready for batches"],
            ["Students", overview.education.students, "Consent on file"],
            ["Active enrollments", overview.education.activeEnrollments, "In progress"],
            ["Certificates", overview.education.certificatesIssued, "Completion issued"],
          ],
        },
        {
          kicker: "Operations",
          heading: "Service & governance",
          stats: [
            ["Open tickets", overview.operations.openTickets, "Awaiting resolution"],
            ["Pending compliance", overview.operations.pendingCompliance, "Not yet completed"],
            ["Published content", overview.operations.publishedContent, "Live pages"],
          ],
        },
        {
          kicker: "Supply chain",
          heading: "Procurement & assets",
          stats: [
            ["Active vendors", overview.supplyChain.activeVendors, "Approved suppliers"],
            ["Purchase orders", overview.supplyChain.purchaseOrders, "All statuses"],
            ["Assets", overview.supplyChain.assets, "Registered"],
          ],
        },
        {
          kicker: "People",
          heading: "Talent pipeline",
          stats: [
            ["Reviews in flight", overview.people.openReviews, "Not yet finalized"],
            ["Open requisitions", overview.people.openRequisitions, "Actively hiring"],
          ],
        },
      ]
    : [];

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="analytics" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Reporting · organization scoped</p>
            <h1>
              Analytics <em>overview</em>
            </h1>
            <p>
              A read-only, organization-scoped rollup across education, operations, supply chain and
              people — every figure stays within your organization boundary.
            </p>
          </div>
        </section>

        {error ? (
          <div className="erp-error" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="erp-state" role="status">
            <span className="erp-loader" aria-hidden="true" />
            <p>Loading analytics</p>
          </div>
        ) : null}

        {!loading && overview
          ? sections.map((section) => (
              <section className="erp-section" key={section.heading}>
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">{section.kicker}</p>
                    <h2>{section.heading}</h2>
                  </div>
                </div>
                <div className="erp-stat-grid" aria-label={section.heading}>
                  {section.stats.map(([label, value, hint]) => (
                    <article key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>{hint}</small>
                    </article>
                  ))}
                </div>
              </section>
            ))
          : null}
      </div>
    </main>
  );
}

export function FounderAnalytics() {
  return (
    <ProtectedErp requiredAnalytics>
      <FounderAnalyticsContent />
    </ProtectedErp>
  );
}
