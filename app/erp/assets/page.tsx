"use client";

import { ModuleOperations } from "../components/module-operations";

export default function Assets() {
  return (
    <ModuleOperations
      config={{
        module: "assets",
        eyebrow: "Operations control",
        title: "Assets & procurement",
        description: "Track robotics equipment kits, compute hardware, and supplier purchase orders across locations.",
        singular: "Asset record",
        helper: "Register an equipment batch, hardware asset, or procurement order.",
        accent: "amber",
      }}
    />
  );
}
