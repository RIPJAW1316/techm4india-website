import type { Metadata } from "next";

import { FounderOrganization } from "./FounderOrganization";

export const metadata: Metadata = {
  title: "Founder Organization | TechM4India ERP",
  description: "Organization structure and company profile management for TechM4India leadership.",
};

export default function FounderOrganizationPage() {
  return <FounderOrganization />;
}
