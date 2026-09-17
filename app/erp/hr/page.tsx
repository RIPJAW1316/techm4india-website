"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Hr() {
  return (
    <ModuleOperations
      config={{
        module: "hr",
        eyebrow: "People operations",
        title: "HR operations",
        description: "Keep leave movements, payroll cycles, and workforce actions visible in one operating register.",
        singular: "HR record",
        helper: "Capture a leave request, payroll run, or people operations action.",
        accent: "teal",
      }}
    />
  );
}
