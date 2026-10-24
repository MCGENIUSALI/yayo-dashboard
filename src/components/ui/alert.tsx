import { CircleCheck, Info, TriangleAlert, CircleX } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  info: { box: "bg-info-subtle", title: "text-fg-info", icon: <Info /> },
  warning: { box: "bg-warning-subtle", title: "text-fg-warning", icon: <TriangleAlert /> },
  danger: { box: "bg-danger-subtle", title: "text-fg-danger", icon: <CircleX /> },
  success: { box: "bg-success-subtle", title: "text-fg-success", icon: <CircleCheck /> },
  inverse: { box: "bg-inverse text-fg-inverse", title: "text-fg-inverse", icon: <Info /> },
} as const;

/** Inline banner (DS "Feedback / Alert"). */
export function Alert({ tone = "info", title, children, icon, action, className }: { tone?: keyof typeof tones; title: ReactNode; children?: ReactNode; icon?: ReactNode; action?: ReactNode; className?: string }) {
  const t = tones[tone];
  return (
    <div className={cn("flex gap-3 rounded-lg p-4", t.box, className)}>
      <span className={cn("mt-0.5 shrink-0 [&_svg]:size-5", t.title)}>{icon ?? t.icon}</span>
      <div className="min-w-0 flex-1">
        <p className={cn("type-label-m", t.title)}>{title}</p>
        {children && <div className={cn("mt-0.5 type-body-s", tone === "inverse" ? "opacity-80" : "text-fg-secondary")}>{children}</div>}
      </div>
      {action}
    </div>
  );
}

/**
 * Failure of an action the user just triggered: stays until retried or
 * dismissed, announced immediately, with the retry next to the message.
 */
export function ActionError({ error, onRetry, className }: { error: string | null; onRetry?: () => void; className?: string }) {
  if (!error) return null;
  return (
    <div role="alert" className={cn("animate-fade-in", className)}>
      <Alert
        tone="danger"
        title="L’opération a échoué"
        action={
          onRetry && (
            <button type="button" onClick={onRetry} className="pressable -my-1 h-9 shrink-0 self-center rounded-md bg-surface px-3 type-label-s text-fg shadow-e1 hover:bg-surface-muted">
              Réessayer
            </button>
          )
        }
      >
        {error}
      </Alert>
    </div>
  );
}
