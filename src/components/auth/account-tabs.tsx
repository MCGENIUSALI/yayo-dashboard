"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/compte", label: "Profil" },
  { href: "/compte/securite", label: "Sécurité et sessions" },
];

export function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections du compte" className="flex gap-1 rounded-lg bg-surface-sunken p-1">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn("pressable flex h-10 flex-1 items-center justify-center rounded-md px-3 type-label-m transition-colors duration-(--duration-fast)", active ? "bg-surface text-fg shadow-e1" : "text-fg-secondary hover:text-fg")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
