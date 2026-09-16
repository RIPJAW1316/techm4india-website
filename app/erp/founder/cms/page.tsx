import type { Metadata } from "next";

import { FounderCms } from "./FounderCms";

export const metadata: Metadata = {
  title: "Content Studio | TechM4India ERP",
  description: "Versioned content pages with a draft, review and publish workflow for TechM4India.",
};

export default function FounderCmsPage() {
  return <FounderCms />;
}
