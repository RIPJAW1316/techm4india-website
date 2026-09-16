import { ErpShell } from "./ErpShell";
import type { ErpModuleId } from "@/lib/erp/modules";

/**
 * Mount point kept for the module pages that already render it. The navigation
 * itself now lives in {@link ErpShell}, which draws the workspace rail and the
 * context bar from `lib/erp/modules`.
 */
export function FounderModuleNavigation({ active }: { active: ErpModuleId }) {
  return <ErpShell active={active} />;
}
