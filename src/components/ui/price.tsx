import { cn } from "@/lib/cn";
import { formatFC, formatUSD } from "@/lib/format";

const sizes = { s: "type-price-s", m: "type-price-m", l: "type-price-l" } as const;

/** Price in FC with the USD equivalent underneath (project rule). */
export function Price({ amount, compareAt, size = "m", inline, className }: { amount: number; compareAt?: number; size?: keyof typeof sizes; inline?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex", inline ? "items-baseline gap-1.5" : "flex-col", className)}>
      <span className={cn(sizes[size], "whitespace-nowrap")}>{formatFC(amount)}</span>
      <span className="flex items-baseline gap-1.5">
        {compareAt && <span className="type-price-strike text-fg-tertiary">{formatFC(compareAt)}</span>}
        <span className="type-body-s whitespace-nowrap text-fg-tertiary">{formatUSD(amount)}</span>
      </span>
    </span>
  );
}
