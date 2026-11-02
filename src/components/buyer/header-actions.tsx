"use client";

import { Bell, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useBuyer } from "@/components/buyer/store";

function Count({ n }: { n: number }) {
  if (!n) return null;
  return <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 type-caption text-fg-on-accent">{n}</span>;
}

/** Notifications + cart buttons of the home header, with live counters. */
export function HeaderActions({ unread }: { unread: number }) {
  const { count } = useBuyer();
  return (
    <div className="flex items-center gap-2">
      <Link href="/acheteur/notifications" aria-label={`Notifications, ${unread} non lues`} className="pressable relative flex size-11 items-center justify-center rounded-md bg-surface-sunken">
        <Bell className="size-5" />
        <Count n={unread} />
      </Link>
      <Link href="/acheteur/panier" aria-label={`Panier, ${count} articles`} className="pressable relative flex size-11 items-center justify-center rounded-md bg-brand text-fg-inverse">
        <ShoppingCart className="size-5" />
        <Count n={count} />
      </Link>
    </div>
  );
}
