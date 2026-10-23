"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Catalogue / Contenus switch: both live under the "Produits" tab on mobile. */
export function CatalogTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: "/vendeur/produits", label: "Catalogue" },
    { href: "/vendeur/contenus", label: "Contenus" },
  ];
  return (
    <nav aria-label="Catalogue" className="flex gap-1 rounded-lg bg-surface-sunken p-1 md:self-start">
      {tabs.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={cn("flex h-9 flex-1 items-center justify-center rounded-md px-4 type-label-m md:flex-none", active ? "bg-surface shadow-e1" : "text-fg-secondary hover:text-fg")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
