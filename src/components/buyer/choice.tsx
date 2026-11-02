"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Selectable card with a radio dot (addresses, payment methods, roles, dispute reasons). */
export function RadioCard({ name, value, checked, onChange, icon, title, children, accent, className }: { name: string; value: string; checked: boolean; onChange: (v: string) => void; icon?: ReactNode; title: ReactNode; children?: ReactNode; accent?: boolean; className?: string }) {
  return (
    <label
      className={cn(
        "pressable flex cursor-pointer items-center gap-4 rounded-xl border bg-surface p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-line-focus",
        checked ? (accent ? "border-2 border-accent bg-accent-subtle p-[15px]" : "border-2 border-line-focus p-[15px]") : "border-line",
        className,
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      {icon && <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-md [&_svg]:size-5.5", checked && accent ? "bg-accent text-fg-on-accent" : checked ? "bg-accent-subtle text-fg-accent" : "bg-surface-sunken text-fg-secondary")}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block type-label-l">{title}</span>
        {children && <span className="mt-0.5 block type-body-s text-fg-secondary">{children}</span>}
      </span>
      <span aria-hidden className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2", checked ? "border-line-focus bg-brand" : "border-line-strong")}>
        {checked && <span className="size-2 rounded-full bg-surface" />}
      </span>
    </label>
  );
}

/** Pill chips with multi or single selection (slots, filters, rating tags). */
export function ChoiceChips({ items, selected, onToggle, label, className }: { items: string[]; selected: string[]; onToggle: (v: string) => void; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {items.map((it) => {
        const on = selected.includes(it);
        return (
          <button key={it} type="button" aria-pressed={on} onClick={() => onToggle(it)} className={cn("pressable h-10 rounded-full border px-4 type-label-m", on ? "border-transparent bg-brand text-fg-inverse" : "border-line bg-surface hover:bg-surface-muted")}>
            {it}
          </button>
        );
      })}
    </div>
  );
}
