"use client";

import { ChevronDown } from "lucide-react";
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-md border border-transparent bg-surface-sunken px-3.5 type-body-l text-fg placeholder:text-fg-tertiary transition-[border-color,background-color,box-shadow] duration-(--duration-instant) ease-(--ease-standard) hover:border-line focus:border-line-focus focus:bg-surface focus:shadow-focus focus:outline-none disabled:text-fg-disabled aria-invalid:border-danger aria-invalid:bg-danger-subtle/40 aria-invalid:focus:shadow-[0_0_0_3px_var(--red-100)]";

/** Lets Input / Select / Textarea link themselves to the Field's message without extra props. */
const FieldContext = createContext<{ describedBy?: string; invalid: boolean } | null>(null);

function useFieldA11y(props: { "aria-describedby"?: string; "aria-invalid"?: ComponentProps<"input">["aria-invalid"] }) {
  const field = useContext(FieldContext);
  return {
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid || undefined),
  };
}

/**
 * Label + control + message. The error replaces the hint, is announced
 * politely and linked to the control (aria-describedby / aria-invalid).
 */
export function Field({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  const msgId = `${id}-msg`;
  const hasMsg = Boolean(error || hint);
  return (
    <FieldContext.Provider value={{ describedBy: hasMsg ? msgId : undefined, invalid: Boolean(error) }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className="type-label-m">
          {label}
        </label>
        {children(id)}
        <div id={msgId} aria-live="polite" className="empty:hidden">
          {error ? (
            <p key="error" className="animate-fade-in type-body-s text-fg-danger">
              {error}
            </p>
          ) : hint ? (
            <p className="type-body-s text-fg-tertiary">{hint}</p>
          ) : null}
        </div>
      </div>
    </FieldContext.Provider>
  );
}

export function Input({ icon, className, ...props }: { icon?: ReactNode } & ComponentProps<"input">) {
  const a11y = useFieldA11y(props);
  if (!icon) return <input className={cn(control, "h-12", className)} {...props} {...a11y} />;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-secondary [&_svg]:size-4.5">{icon}</span>
      <input className={cn(control, "h-12 pl-10", className)} {...props} {...a11y} />
    </div>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  const a11y = useFieldA11y(props);
  return <textarea className={cn(control, "min-h-24 py-3", className)} {...props} {...a11y} />;
}

export function Select({ icon, className, children, ...props }: { icon?: ReactNode } & ComponentProps<"select">) {
  const a11y = useFieldA11y(props);
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-secondary [&_svg]:size-4.5">{icon}</span>}
      <select className={cn(control, "h-12 appearance-none pr-10", icon && "pl-10", className)} {...props} {...a11y}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4.5 -translate-y-1/2 text-fg-secondary" />
    </div>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-(--duration-fast) ease-(--ease-standard) active:[&>span]:w-6", checked ? "bg-success" : "bg-line-strong", disabled && "opacity-50")}
    >
      <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-white shadow-e1 transition-[transform,width] duration-(--duration-fast) ease-(--ease-out)", checked && "translate-x-5 [:active>&]:translate-x-4")} />
    </button>
  );
}

export function Checkbox({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="size-5 shrink-0 cursor-pointer rounded-xs accent-[var(--bg-brand)] disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

/** Row with leading icon, label + helper text and a trailing switch (DS "List Row · Trailing=Switch"). */
export function SwitchRow({ icon, label, hint, checked, onChange }: { icon?: ReactNode; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 py-3">
      {icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-sunken [&_svg]:size-4.5">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="type-label-m">{label}</p>
        {hint && <p className="type-body-s text-fg-tertiary">{hint}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
