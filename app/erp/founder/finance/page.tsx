import type { Metadata } from "next";
import { FounderFinance } from "./FounderFinance";

export const metadata: Metadata = {
  title: "Finance & GST | TechM4India ERP",
  description: "Finance operations, configurable GST records, receivables, expenses and journals for TechM4India.",
};

export default function FounderFinancePage() {
  return <FounderFinance />;
}
