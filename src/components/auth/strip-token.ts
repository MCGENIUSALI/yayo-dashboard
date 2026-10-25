"use client";

import { useEffect } from "react";

/** Removes ?token= from the address bar and history once the page has it (no leak via history, screenshots or shared URLs). */
export function useStripToken() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
}
