"use client";

import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

/** Pour toi / Abonnements / Lives switcher of the social feed. */
export function FeedTabs({ active, dark }: { active: "pour-toi" | "abonnements"; dark?: boolean }) {
  const toast = useToast();
  const item = (on: boolean) => cn("flex h-10 flex-1 items-center justify-center rounded-full type-label-m", on ? (dark ? "text-white" : "bg-surface text-fg shadow-e1") : dark ? "text-white/60" : "text-fg-secondary");
  if (dark)
    return (
      <nav aria-label="Fil" className="flex justify-center gap-6 type-h4">
        <Link href="/acheteur/fil/abonnements" className="text-white/60 drop-shadow">
          Abonnements
        </Link>
        <Link href="/acheteur/fil" aria-current="page" className="text-white drop-shadow">
          Pour toi
        </Link>
      </nav>
    );
  return (
    <nav aria-label="Fil" className="flex rounded-full bg-surface-sunken p-1">
      <Link href="/acheteur/fil" className={item(active === "pour-toi")} aria-current={active === "pour-toi" ? "page" : undefined}>
        Pour toi
      </Link>
      <Link href="/acheteur/fil/abonnements" className={item(active === "abonnements")} aria-current={active === "abonnements" ? "page" : undefined}>
        Abonnements
      </Link>
      <button type="button" className={item(false)} onClick={() => toast({ tone: "info", title: "Lives bientôt disponibles", description: "Les boutiques pourront vendre en direct." })}>
        Lives
      </button>
    </nav>
  );
}
