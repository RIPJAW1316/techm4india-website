import type { ReactNode } from "react";
import { AuthProvider } from "./components/AuthProvider";

export default function ErpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="erp-route">
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
