import type { Metadata } from "next";

import { FounderEmployees } from "./FounderEmployees";

export const metadata: Metadata = {
  title: "Employees | TechM4India ERP",
  description:
    "Safe employee master and employment lifecycle workspace for authorized TechM4India HR users.",
};

export default function FounderEmployeesPage() {
  return <FounderEmployees />;
}
