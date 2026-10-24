"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePresence } from "@/hooks/use-presence";
import { useOverlay } from "@/hooks/use-overlay";
import { cn } from "@/lib/cn";
import { duration } from "@/lib/motion";

/**
 * Bottom sheet on mobile, centred dialog from md (DS "Sheet Header").
 * Slides up / fades in, traps focus, locks the page scroll and gives focus
 * back to the trigger. `busy` (an operation in progress) blocks every way of
 * closing so the result is never lost.
 */
export function Sheet({ open, onClose, title, children, footer, busy, className }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; busy?: boolean; className?: string }) {
  const { mounted, shown } = usePresence(open, duration.slow);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const requestClose = () => {
    if (!busy) onClose();
  };
  useOverlay(panel, { active: open, onClose: requestClose });

  if (!mounted) return null;
  // Portal: the sheet never inherits colour, stacking or transforms from where it is declared.
  return createPortal(
    <div data-state={shown ? "open" : "closed"} className={cn("group/sheet fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6", !open && "pointer-events-none")} inert={!open || undefined}>
      <div
        aria-hidden
        onClick={requestClose}
        className="motion-fade absolute inset-0 bg-overlay opacity-0 transition-opacity duration-(--duration-slow) ease-(--ease-standard) group-data-[state=open]/sheet:opacity-100"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90dvh] w-full flex-col rounded-t-2xl bg-surface text-fg shadow-e3 outline-none md:max-w-lg md:rounded-2xl",
          "motion-fade translate-y-full opacity-0 transition-[transform,opacity] duration-(--duration-slow) ease-(--ease-in) md:translate-y-2 md:scale-[0.98]",
          "group-data-[state=open]/sheet:translate-y-0 group-data-[state=open]/sheet:scale-100 group-data-[state=open]/sheet:opacity-100 group-data-[state=open]/sheet:ease-(--ease-out)",
          "motion-reduce:translate-y-0! motion-reduce:scale-100!",
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" />
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 id={titleId} className="type-h3">
            {title}
          </h2>
          <button onClick={requestClose} disabled={busy} aria-label="Fermer" className="pressable flex size-9 items-center justify-center rounded-md hover:bg-surface-sunken disabled:opacity-40">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-line-subtle px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
