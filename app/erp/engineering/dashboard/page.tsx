import { DivisionDashboard } from "@/app/erp/components/DivisionDashboard";

export const metadata = {
  title: "Engineering Workspace",
  description: "TechM4India Engineering employee workspace.",
};

export default function EngineeringDashboardPage() {
  return <DivisionDashboard divisionSlug="engineering" />;
}
