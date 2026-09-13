import type { Metadata } from "next";

import { FounderSupplyChain } from "./FounderSupplyChain";

export const metadata: Metadata = {
  title: "Supply Chain | TechM4India ERP",
  description:
    "Vendor approval, purchase orders received into a live stock ledger, and the asset register lifecycle for TechM4India.",
};

export default function FounderSupplyChainPage() {
  return <FounderSupplyChain />;
}
