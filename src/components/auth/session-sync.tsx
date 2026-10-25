"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CHANNEL = "yayo-auth";

/**
 * Keeps open tabs in step with a sign-out: the tab that signed out
 * broadcasts it, the others re-render from the server (which redirects them
 * to the sign-in screen) and drop what they had on screen.
 */
export function SessionSync() {
  const router = useRouter();
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => e.data === "signed-out" && router.refresh();
    // Restored from the back/forward cache after a sign-out elsewhere: revalidate with the server.
    const onShow = (e: PageTransitionEvent) => e.persisted && router.refresh();
    window.addEventListener("pageshow", onShow);
    return () => {
      channel.close();
      window.removeEventListener("pageshow", onShow);
    };
  }, [router]);
  return null;
}

export function SignedOutBroadcast() {
  useEffect(() => {
    try {
      // Per-tab test switches and any other session-scoped data are cleared.
      sessionStorage.clear();
    } catch {}
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage("signed-out");
    channel.close();
  }, []);
  return null;
}
