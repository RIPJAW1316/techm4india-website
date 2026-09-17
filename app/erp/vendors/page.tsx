"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Vendors() {
  return (
    <ModuleOperations
      config={{
        module: "vendors",
        eyebrow: "Ecosystem relations",
        title: "Vendors & partners",
        description: "Maintain strategic technology alliances, lab kit suppliers, and certification partner contracts.",
        singular: "Partner record",
        helper: "Track a vendor profile, partner agreement, or SLA review.",
        accent: "purple",
      }}
    />
  );
}
