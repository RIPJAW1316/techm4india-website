"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Cms() {
  return (
    <ModuleOperations
      config={{
        module: "cms",
        eyebrow: "Publishing & outreach",
        title: "Content publishing",
        description: "Coordinate editorial reports, admissions announcements, and national STEM publications.",
        singular: "Content record",
        helper: "Register an article draft, annual report, or marketing campaign.",
        accent: "indigo",
      }}
    />
  );
}
