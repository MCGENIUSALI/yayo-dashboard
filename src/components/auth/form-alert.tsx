import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";

/**
 * Form-level message, part of the layout (no toast): errors and warnings are
 * announced at once (role="alert"), confirmations politely (role="status").
 */
export function FormAlert({ tone = "danger", title, children, className }: { tone?: "danger" | "info" | "success" | "warning"; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={`animate-fade-in ${className ?? ""}`}>
      <Alert tone={tone} title={title}>
        {children}
      </Alert>
    </div>
  );
}
