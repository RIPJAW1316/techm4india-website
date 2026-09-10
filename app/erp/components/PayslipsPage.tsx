"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { apiFetchV2, ApiError } from "@/lib/api/client";
import { ErpLoading, ProtectedErp } from "./ProtectedErp";
export function PayslipsPage({
  divisionSlug,
}: {
  divisionSlug: "engineering" | "solutions" | "schools" | "space";
}) {
  return (
    <ProtectedErp requiredDivision={divisionSlug}>
      <PayslipContent />
    </ProtectedErp>
  );
}
function PayslipContent() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const response = await apiFetchV2<{ data: any[] }>(
        "/payroll/me/payslips",
      );
      setRows(response.data);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Payslips could not load.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading) return <ErpLoading label="Loading payslips" />;
  return (
    <main className="erp-main">
      <div className="erp-content">
        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Employee self-service</p>
            <h1>
              My <em>payslips</em>
            </h1>
            <p>
              Only finalized payroll snapshots for your employee profile are
              shown here.
            </p>
          </div>
        </section>
        {error && (
          <div className="erp-error" role="alert">
            <p>{error}</p>
          </div>
        )}
        <section className="erp-section">
          <div className="erp-notification-list">
            {rows.map((row) => (
              <article className="erp-notification" key={row.id}>
                <div>
                  <h3>
                    {row.run?.period?.year}/
                    {String(row.run?.period?.month ?? "").padStart(2, "0")}
                  </h3>
                  <p>
                    {row.employee?.firstName} {row.employee?.lastName} ·{" "}
                    {row.employee?.employeeCode}
                  </p>
                </div>
                <strong>₹{row.netPay}</strong>
              </article>
            ))}
            {!rows.length && (
              <div className="erp-empty">
                <strong>No finalized payslips yet.</strong>
                <span>
                  Your payroll team will publish one after finalization.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
