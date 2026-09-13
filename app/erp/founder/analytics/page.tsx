import type { Metadata } from "next";

import { FounderAnalytics } from "./FounderAnalytics";

export const metadata: Metadata = {
  title: "Analytics | TechM4India ERP",
  description:
    "Organization-scoped cross-domain reporting rollup across education, operations, supply chain and people.",
};

export default function FounderAnalyticsPage() {
  return <FounderAnalytics />;
}
