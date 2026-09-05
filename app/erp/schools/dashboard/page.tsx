import { DivisionDashboard } from "@/app/erp/components/DivisionDashboard";

export const metadata = {
  title: "Schools Workspace",
  description: "TechM4India Schools employee workspace.",
};

export default function SchoolsDashboardPage() {
  return <DivisionDashboard divisionSlug="schools" />;
}
