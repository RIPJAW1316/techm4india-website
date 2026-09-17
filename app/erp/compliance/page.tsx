"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Compliance() {
  return (
    <ModuleOperations
      config={{
        module: "compliance",
        eyebrow: "Governance & regulatory",
        title: "Compliance",
        description: "Stay ahead of statutory GST return filings, information security audits, and institutional compliance.",
        singular: "Compliance task",
        helper: "Record an audit checklist, tax filing milestone, or regulatory review.",
        accent: "emerald",
      }}
    />
  );
}
