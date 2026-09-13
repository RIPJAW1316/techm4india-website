import type { Metadata } from "next";

import { FounderPrograms } from "./FounderPrograms";

export const metadata: Metadata = {
  title: "Programs & Learning | TechM4India ERP",
  description:
    "Review-controlled programme curriculum, publication, batches, students and lesson progress for TechM4India.",
};

export default function FounderProgramsPage() {
  return <FounderPrograms />;
}
