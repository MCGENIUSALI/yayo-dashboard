"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Phone number with the fixed +243 prefix (RDC). */
export function PhoneInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <div className={cn("flex h-14 items-center rounded-md border border-transparent bg-surface-sunken transition-[border-color,box-shadow,background-color] duration-(--duration-instant) focus-within:border-line-focus focus-within:bg-surface focus-within:shadow-focus has-[[aria-invalid=true]]:border-danger", className)}>
      <span className="flex h-full items-center gap-1.5 border-r border-line pr-3 pl-4 type-label-l">
        <span aria-hidden className="text-lg leading-none">🇨🇩</span> +243 <ChevronDown aria-hidden className="size-4 text-fg-tertiary" />
      </span>
      <input type="tel" inputMode="tel" autoComplete="tel-national" className="h-full min-w-0 flex-1 bg-transparent px-3 type-body-l outline-none placeholder:text-fg-tertiary" {...props} />
    </div>
  );
}
