import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "accent" | "inverse";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-fg-secondary",
  info: "bg-info-subtle text-fg-info",
  warning: "bg-warning-subtle text-fg-warning",
  success: "bg-success-subtle text-fg-success",
  danger: "bg-danger-subtle text-fg-danger",
  accent: "bg-accent-subtle text-fg-accent",
  inverse: "bg-inverse text-fg-inverse",
};

export function Badge({ tone = "neutral", icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 max-w-full items-center gap-1 whitespace-nowrap rounded-full px-2 type-label-s [&_svg]:size-3.5 [&_svg]:shrink-0", tones[tone], className)}>
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}
