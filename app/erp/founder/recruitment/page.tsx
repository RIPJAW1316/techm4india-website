import type { Metadata } from "next";

import { FounderRecruitment } from "./FounderRecruitment";

export const metadata: Metadata = {
  title: "Recruitment & Onboarding | TechM4India ERP",
  description:
    "Approval-controlled job requisitions, candidate interviews, offers and onboarding for TechM4India.",
};

export default function FounderRecruitmentPage() {
  return <FounderRecruitment />;
}
