import type { Metadata } from "next";

import { FounderDashboard } from "./FounderDashboard";

export const metadata: Metadata = {
  title: "Founder Control Centre",
  description: "Organization-wide operations visibility for TechM4India leadership.",
};

export default function FounderDashboardPage() {
  return <FounderDashboard />;
}
