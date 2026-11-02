"use client";

import { Bell, House, Package, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/acheteur", label: "Accueil", icon: House, match: ["/acheteur/fil"] },
  { href: "/acheteur/explorer", label: "Explorer", icon: Search, match: ["/acheteur/boutiques"] },
  { href: "/acheteur/commandes", label: "Commandes", icon: Package, match: [] },
  { href: "/acheteur/notifications", label: "Alertes", icon: Bell, match: [] },
  { href: "/acheteur/compte", label: "Profil", icon: UserRound, match: [] },
];

/** Buyer app bottom navigation (5 tabs, DS "Bottom Nav"). */
export function TabBar({ dark }: { dark?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className={cn("fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t pb-[env(safe-area-inset-bottom)] backdrop-blur", dark ? "border-white/10 bg-neutral-950/95 text-white" : "border-line-subtle bg-surface/95")}>
      <ul className="flex">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = href === "/acheteur" ? pathname === href || match.some((m) => pathname.startsWith(m)) : [href, ...match].some((p) => pathname === p || pathname.startsWith(`${p}/`));
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className="group flex flex-col items-center gap-1 py-2 outline-offset-[-2px]">
                <span className={cn("flex h-8 w-13 items-center justify-center rounded-full transition-[background-color,color,transform] duration-(--duration-fast) ease-(--ease-standard) group-active:scale-90", active ? "bg-accent-subtle text-fg-accent" : dark ? "text-white/70" : "text-fg-secondary")}>
                  <Icon className="size-5" />
                </span>
                <span className={cn("type-caption", active ? (dark ? "text-white" : "text-fg") : dark ? "text-white/60" : "text-fg-tertiary")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
