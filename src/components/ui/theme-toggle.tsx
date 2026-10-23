"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.dataset.theme === "dark";

/** Switches data-theme on <html>; the choice is kept per browser. */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("yayo-theme", next);
    } catch {}
  }

  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Passer en thème clair" : "Passer en thème sombre"} className={className ?? "flex size-10 items-center justify-center rounded-md text-fg hover:bg-surface-sunken"}>
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
