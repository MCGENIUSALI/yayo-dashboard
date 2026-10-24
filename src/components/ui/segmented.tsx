"use client";

import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

/**
 * Segmented control (DS "Tabs"): pill track with the active segment on surface.
 * Keyboard: one tab stop, arrows / Home / End move and select (WAI-ARIA tabs).
 */
export function Segmented<T extends string>({ items, value, onChange, className }: { items: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = items.findIndex((it) => it.value === value);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target = items[(next + items.length) % items.length];
    onChange(target.value);
    const btn = e.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(target.value)}"]`);
    btn?.focus();
    btn?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <div role="tablist" onKeyDown={onKeyDown} className={cn("flex w-full gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1 scrollbar-none md:w-auto md:self-start", className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            data-value={it.value}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(it.value)}
            className={cn(
              "pressable h-9 flex-1 whitespace-nowrap rounded-md px-3 type-label-m md:flex-none",
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
            type="button"
            aria-pressed={active}
            onClick={() => onChange(it.value)}
            className={cn(
              "pressable h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 type-label-m",
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
