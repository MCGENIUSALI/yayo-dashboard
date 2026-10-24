"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Shared behaviour of modal layers (sheet, dialog, mobile drawer):
 * Escape closes the topmost layer only, Tab stays inside it, the page behind
 * does not scroll, and focus returns to the trigger when it closes.
 */
const stack: symbol[] = [];
let locks = 0;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function lockScroll() {
  if (locks++ === 0) document.documentElement.style.overflow = "hidden";
}
function unlockScroll() {
  if (--locks === 0) document.documentElement.style.overflow = "";
}

export function useOverlay(ref: RefObject<HTMLElement | null>, { active, onClose, initialFocus }: { active: boolean; onClose: () => void; initialFocus?: RefObject<HTMLElement | null> }) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!active) return;
    const id = Symbol("overlay");
    stack.push(id);
    const trigger = document.activeElement as HTMLElement | null;
    lockScroll();

    // Focus once the panel is in the DOM; the panel itself is the fallback target.
    const raf = requestAnimationFrame(() => {
      const panel = ref.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const target = initialFocus?.current ?? panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel;
      target.focus({ preventScroll: true });
    });

    function onKey(e: KeyboardEvent) {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const inside = ref.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
      unlockScroll();
      if (trigger && trigger.isConnected && trigger !== document.body) trigger.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus]);
}
