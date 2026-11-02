"use client";

import { Bike, History, House, UserRound, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/livreur", label: "Accueil", icon: House },
  { href: "/livreur/missions", label: "Missions", icon: Bike },
  { href: "/livreur/revenus", label: "Revenus", icon: Wallet },
  { href: "/livreur/historique", label: "Historique", icon: History },
  { href: "/livreur/profil", label: "Profil", icon: UserRound },
];

export function CourierTabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation livreur" className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-line-subtle bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/livreur" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className="group flex flex-col items-center gap-1 py-2 outline-offset-[-2px]">
                <span className={cn("flex h-8 w-13 items-center justify-center rounded-full transition-[background-color,color,transform] duration-(--duration-fast) group-active:scale-90", active ? "bg-accent-subtle text-fg-accent" : "text-fg-secondary")}>
                  <Icon className="size-5" />
                </span>
                <span className={cn("type-caption", active ? "text-fg" : "text-fg-tertiary")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
