import type { ReactNode } from "react";
import { AuthProvider } from "./components/AuthProvider";

export default function ErpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="erp-route min-h-screen min-h-[100dvh] bg-background text-foreground flex flex-col">
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
