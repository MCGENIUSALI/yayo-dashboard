"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/** One box per digit; typing moves forward, Backspace moves back, pasting fills every box. */
export function OtpInput({ value, onChange, length = 6, invalid, label = "Code reçu par SMS" }: { value: string; onChange: (v: string) => void; length?: number; invalid?: boolean; label?: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function set(i: number, d: string) {
    const clean = d.replace(/\D/g, "");
    if (clean.length > 1) {
      const next = (value.slice(0, i) + clean).slice(0, length);
      onChange(next);
      refs.current[Math.min(next.length, length - 1)]?.focus();
      return;
    }
    const arr = digits.slice();
    arr[i] = clean;
    onChange(arr.join("").slice(0, length));
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  }

  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Chiffre ${i + 1}`}
          aria-invalid={invalid || undefined}
          maxLength={length}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-full min-w-0 rounded-md border-2 bg-surface text-center type-h3 outline-none transition-[border-color,box-shadow] duration-(--duration-instant) focus:border-accent focus:shadow-focus",
            invalid ? "border-danger text-fg-danger" : d ? "border-line-strong" : "border-line",
          )}
        />
      ))}
    </div>
  );
}
