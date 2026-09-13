import type { Metadata } from "next";

import { FounderCompliance } from "./FounderCompliance";

export const metadata: Metadata = {
  title: "Compliance | TechM4India ERP",
  description:
    "Statutory compliance calendar with evidence-backed submission and completion tracking for TechM4India.",
};

export default function FounderCompliancePage() {
  return <FounderCompliance />;
}
