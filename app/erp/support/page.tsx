"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Support() {
  return (
    <ModuleOperations
      config={{
        module: "support",
        eyebrow: "Service management",
        title: "Helpdesk",
        description: "Ensure institutional partner requests, platform credentials, and student certifications meet SLAs.",
        singular: "Support ticket",
        helper: "Log an institutional request, support inquiry, or platform issue.",
        accent: "rose",
      }}
    />
  );
}
