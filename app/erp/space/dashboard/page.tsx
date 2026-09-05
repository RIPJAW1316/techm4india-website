import { DivisionDashboard } from "@/app/erp/components/DivisionDashboard";

export const metadata = {
  title: "Space Workspace",
  description: "TechM4India Space employee workspace.",
};

export default function SpaceDashboardPage() {
  return <DivisionDashboard divisionSlug="space" />;
}
