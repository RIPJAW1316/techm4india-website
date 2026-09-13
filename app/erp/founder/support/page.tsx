import type { Metadata } from "next";

import { FounderSupport } from "./FounderSupport";

export const metadata: Metadata = {
  title: "Helpdesk | TechM4India ERP",
  description:
    "SLA-tracked support tickets with triage, assignment, resolution and a full comment trail for TechM4India.",
};

export default function FounderSupportPage() {
  return <FounderSupport />;
}
