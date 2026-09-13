import type { Metadata } from "next";

import { FounderDelivery } from "./FounderDelivery";

export const metadata: Metadata = {
  title: "Project Delivery | TechM4India ERP",
  description:
    "Milestones, risks, sprints and time logs for delivery tracking across TechM4India projects.",
};

export default function FounderDeliveryPage() {
  return <FounderDelivery />;
}
