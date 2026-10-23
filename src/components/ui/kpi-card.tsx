import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Trend } from "@/lib/types";

/** KPI tile from "DS / Pro": icon, label, value and a trend chip (Up / Down / Neutral). */
export function KpiCard({ icon, label, value, trend, trendLabel, className }: { icon: ReactNode; label: string; value: ReactNode; trend?: Trend; trendLabel?: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3 rounded-lg border border-line-subtle bg-surface p-4", className)}>
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-surface-sunken text-fg [&_svg]:size-4">{icon}</span>
        <span className="type-body-s text-fg-secondary">{label}</span>
      </div>
      <p className="type-h3 break-words tabular-nums">{value}</p>
      {trendLabel && (
        <Badge
          className="self-start"
          tone={trend === "up" ? "success" : trend === "down" ? "danger" : "neutral"}
          icon={trend === "up" ? <TrendingUp /> : trend === "down" ? <TrendingDown /> : <Clock />}
        >
          {trendLabel}
        </Badge>
      )}
    </div>
  );
}
