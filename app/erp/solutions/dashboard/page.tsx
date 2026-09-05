import { DivisionDashboard } from "@/app/erp/components/DivisionDashboard";

export const metadata = {
  title: "Solutions Workspace",
  description: "TechM4India Solutions employee workspace.",
};

export default function SolutionsDashboardPage() {
  return <DivisionDashboard divisionSlug="solutions" />;
}
