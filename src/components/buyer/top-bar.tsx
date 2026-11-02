"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Screen top bar (DS "Top App Bar"): back button, title, trailing actions.
 * Back goes to the previous screen when there is one in this tab, otherwise to `fallback`.
 */
export function TopBar({ title, fallback, trailing, overlay, className }: { title?: ReactNode; fallback: string; trailing?: ReactNode; overlay?: boolean; className?: string }) {
  const router = useRouter();
  function back() {
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) router.back();
    else router.push(fallback);
  }
  return (
    <div
      className={cn(
        "z-30 flex h-16 items-center gap-3 px-4 pt-[env(safe-area-inset-top)]",
        overlay ? "absolute inset-x-0 top-0" : "sticky top-0 bg-surface/95 backdrop-blur",
        className,
      )}
    >
      <button type="button" onClick={back} aria-label="Retour" className={cn("pressable flex size-11 shrink-0 items-center justify-center rounded-md", overlay ? "bg-surface/90 shadow-e1" : "bg-surface-sunken")}>
        <ArrowLeft className="size-5" />
      </button>
      {title && <h1 className="min-w-0 flex-1 truncate type-h4">{title}</h1>}
      {!title && <span className="flex-1" />}
      {trailing}
    </div>
  );
}
