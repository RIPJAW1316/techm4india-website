import type { Metadata } from "next";

import { FounderPerformance } from "./FounderPerformance";

export const metadata: Metadata = {
  title: "Performance & Appraisal | TechM4India ERP",
  description:
    "Review cycles, weighted goals, and the self-assessment, manager review, finalization and acknowledgement workflow for TechM4India.",
};

export default function FounderPerformancePage() {
  return <FounderPerformance />;
}
