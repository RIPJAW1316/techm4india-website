"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Finance() {
  return (
    <ModuleOperations
      config={{
        module: "finance",
        eyebrow: "Commercial operations",
        title: "Finance",
        description: "Maintain clear visibility over incoming invoices, receivables, and operational expenses.",
        singular: "Finance record",
        helper: "Record an invoice, disbursement, client milestone, or expense item.",
        accent: "emerald",
      }}
    />
  );
}
