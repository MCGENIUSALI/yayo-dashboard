"use client";

import { useEffect } from "react";

/**
 * Asks the browser to confirm before reloading or closing the tab while a form
 * has unsaved edits. (In-app links are not intercepted: the App Router has no
 * navigation-blocking API yet.)
 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
