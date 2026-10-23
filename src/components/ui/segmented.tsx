"use client";

import { cn } from "@/lib/cn";

/** Segmented control (DS "Tabs"): pill track with the active segment on surface. */
export function Segmented<T extends string>({ items, value, onChange, className }: { items: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn("flex w-full gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1 scrollbar-none md:w-auto md:self-start", className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cn(
              "h-9 flex-1 whitespace-nowrap rounded-md px-3 type-label-m transition md:flex-none",
              active ? "bg-surface text-fg shadow-e1" : "text-fg-secondary hover:text-fg",
            )}
          >
            {it.label}
            {it.count !== undefined && ` (${it.count})`}
          </button>
        );
      })}
    </div>
  );
}

/** Filter chips (DS "Chip · Selected"). */
export function Chips<T extends string>({ items, value, onChange, className }: { items: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:flex-wrap md:px-0", className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            aria-pressed={active}
            onClick={() => onChange(it.value)}
            className={cn(
              "h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 type-label-m transition",
              active ? "border-transparent bg-brand text-fg-inverse" : "border-line bg-surface text-fg hover:bg-surface-muted",
            )}
          >
            {it.label}
            {it.count !== undefined && ` (${it.count})`}
          </button>
        );
      })}
    </div>
  );
}
