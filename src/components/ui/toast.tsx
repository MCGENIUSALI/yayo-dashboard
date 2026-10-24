"use client";

import { clsx as cn } from "clsx";
import { CircleCheck, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { duration } from "@/lib/motion";

type Tone = "success" | "info";
interface Toast {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
  leaving?: boolean;
}

const VISIBLE = 3;
const LIFETIME = 4000;

const ToastContext = createContext<(t: Omit<Toast, "id" | "leaving">) => void>(() => {});

/**
 * Temporary confirmations (DS "Feedback / Toast"). Errors that need the user
 * stay inline next to the action instead, with a retry.
 */
export function useToast() {
  return useContext(ToastContext);
}

// clsx rather than cn(): this provider is in the root layout, tailwind-merge would weigh on every page.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), duration.base);
  }, []);

  const push = useCallback((t: Omit<Toast, "id" | "leaving">) => {
    const id = ++next.current;
    setToasts((ts) => [...ts.filter((x) => !x.leaving).slice(-(VISIBLE - 1)), { ...t, id }]);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 px-4 lg:top-auto lg:right-6 lg:bottom-6 lg:left-auto lg:items-end lg:px-0"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || toast.leaving) return;
    const t = window.setTimeout(() => onDismiss(toast.id), LIFETIME);
    return () => window.clearTimeout(t);
  }, [paused, toast.id, toast.leaving, onDismiss]);

  return (
    <div
      role="status"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      data-leaving={toast.leaving || undefined}
      className={cn(
        "pointer-events-auto flex w-full [--toast-from:-8px] lg:[--toast-from:8px] max-w-sm items-start gap-3 rounded-lg bg-inverse p-3.5 pr-2 text-fg-inverse shadow-e3",
        "animate-toast-in motion-reduce:animate-fade-in",
        "transition-[opacity,transform] duration-(--duration-base) ease-(--ease-in) data-leaving:-translate-y-1 data-leaving:opacity-0 lg:data-leaving:translate-x-2 lg:data-leaving:translate-y-0 motion-reduce:data-leaving:translate-0",
      )}
    >
      <span className={cn("mt-0.5 shrink-0 [&_svg]:size-5", toast.tone === "success" ? "text-success" : "text-info")}>{toast.tone === "success" ? <CircleCheck /> : <Info />}</span>
      <div className="min-w-0 flex-1">
        <p className="type-label-m">{toast.title}</p>
        {toast.description && <p className="mt-0.5 type-body-s opacity-80">{toast.description}</p>}
      </div>
      <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Fermer la notification" className="pressable -my-1 flex size-8 shrink-0 items-center justify-center rounded-md opacity-70 hover:bg-white/10 hover:opacity-100">
        <X className="size-4" />
      </button>
    </div>
  );
}
