import { LeavePage } from "../../components/LeavePage";
import { FounderModuleNavigation } from "../../components/FounderModuleNavigation";
import { ProtectedErp } from "../../components/ProtectedErp";

export default function FounderLeavePage() {
  return <ProtectedErp requiredExecutive><div className="erp-content founder-route-navigation"><FounderModuleNavigation active="leave" /></div><LeavePage management /></ProtectedErp>;
}
