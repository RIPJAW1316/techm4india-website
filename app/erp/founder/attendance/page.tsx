import { AttendancePage } from "../../components/AttendancePage";
import { FounderModuleNavigation } from "../../components/FounderModuleNavigation";
import { ProtectedErp } from "../../components/ProtectedErp";

export default function FounderAttendancePage() {
  return <ProtectedErp requiredExecutive><div className="erp-content founder-route-navigation"><FounderModuleNavigation active="attendance" /></div><AttendancePage management /></ProtectedErp>;
}
