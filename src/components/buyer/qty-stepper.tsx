"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/** − 1 + quantity control (DS "Stepper"). */
export function QtyStepper({ value, onChange, min = 1, max, label, size = "md", disabled }: { value: number; onChange: (v: number) => void; min?: number; max: number; label: string; size?: "sm" | "md"; disabled?: boolean }) {
  const btn = cn("pressable flex items-center justify-center rounded-full bg-surface shadow-e1 disabled:opacity-40 disabled:shadow-none", size === "md" ? "size-9" : "size-8");
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center gap-1 rounded-full bg-surface-sunken p-1", disabled && "opacity-50")}>
      <button type="button" className={btn} aria-label="Diminuer la quantité" disabled={disabled || value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className={cn("text-center tabular-nums", size === "md" ? "w-9 type-label-l" : "w-7 type-label-m")}>
        {value}
      </output>
      <button type="button" className={btn} aria-label="Augmenter la quantité" disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}
