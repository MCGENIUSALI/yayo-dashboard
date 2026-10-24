"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncStatus = "idle" | "pending" | "success" | "error";

/**
 * idle → pending → success | error for one user action.
 * A second call while pending is ignored (no double submission), results that
 * arrive after unmount are dropped, and `run` resolves to the result or
 * undefined on failure so callers can chain navigation only on real success.
 */
export function useAsyncAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>, { resetAfter }: { resetAfter?: number } = {}) {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [args, setArgs] = useState<A | null>(null);
  const busy = useRef(false);
  const alive = useRef(true);
  const fnRef = useRef(fn);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      window.clearTimeout(timer.current);
    };
  }, []);

  const run = useCallback(
    async (...a: A): Promise<R | undefined> => {
      if (busy.current) return undefined;
      busy.current = true;
      window.clearTimeout(timer.current);
      setStatus("pending");
      setError(null);
      setArgs(a);
      try {
        const result = await fnRef.current(...a);
        if (!alive.current) return result;
        setStatus("success");
        if (resetAfter) timer.current = window.setTimeout(() => alive.current && setStatus("idle"), resetAfter);
        return result;
      } catch (e) {
        if (alive.current) {
          setStatus("error");
          setError(e instanceof Error ? e.message : "Une erreur est survenue.");
        }
        return undefined;
      } finally {
        busy.current = false;
      }
    },
    [resetAfter],
  );

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setStatus("idle");
    setError(null);
  }, []);

  /** `args`: arguments of the latest call, to tell which of several buttons is running. `busy`: pending, or succeeded and the screen is about to change (keeps the button locked during a redirect). */
  return { status, error, run, reset, args, pending: status === "pending", busy: status === "pending" || status === "success" };
}
