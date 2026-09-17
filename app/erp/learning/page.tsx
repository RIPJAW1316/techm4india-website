"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Learning() {
  return (
    <ModuleOperations
      config={{
        module: "learning",
        eyebrow: "Education delivery",
        title: "Learning",
        description: "Monitor school and university cohorts, student progress, and active curriculum modules.",
        singular: "Learning record",
        helper: "Track an educational cohort, course module, or learner achievement.",
        accent: "sky",
      }}
    />
  );
}
