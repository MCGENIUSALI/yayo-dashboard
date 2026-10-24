"use client";

import { useEffect, useState } from "react";

/**
 * Keeps an element mounted while it animates out.
 * `mounted`: render it. `shown`: apply the open styles (one frame after mount,
 * so CSS transitions run from the closed state). Reopening during the exit
 * simply flips `shown` back: transitions reverse from where they are.
 */
export function usePresence(open: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    const t = window.setTimeout(() => {
      setShown(false);
      setMounted(false);
    }, exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);

  return { mounted, shown: shown && open };
}
