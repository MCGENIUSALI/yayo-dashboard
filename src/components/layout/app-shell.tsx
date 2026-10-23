"use client";

import { Bell, Menu, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav, SidebarNav } from "@/components/layout/sidebar-nav";
import { cn } from "@/lib/cn";
import { adminNav, sellerNav } from "@/lib/nav";

const navs = { seller: sellerNav, admin: adminNav };

interface ShellProps {
  /** Nav is resolved client-side: icon components cannot cross the server boundary. */
  navKey: keyof typeof navs;
  root: string;
  space: string;
  user: { name: string; role: string };
  notifications: { href: string; count: number };
  searchPlaceholder: string;
  /** "bottom": seller app tab bar under lg. "drawer": admin burger menu. */
  mobileNav: "bottom" | "drawer";
  children: ReactNode;
}

export function AppShell({ navKey, root, space, user, notifications, searchPlaceholder, mobileNav, children }: ShellProps) {
  const nav = navs[navKey];
  const [drawer, setDrawer] = useState(false);

  const sidebar = (
    <>
      <div className="flex items-center justify-between px-2 pt-6 pb-6">
        <Link href={root} aria-label="Accueil">
          <Logo />
        </Link>
        <span className="rounded-full bg-surface-sunken px-2 py-1 type-caption text-fg-secondary">{space}</span>
      </div>
      <SidebarNav items={nav} root={root} onNavigate={() => setDrawer(false)} />
      <div className="mt-auto flex items-center gap-3 border-t border-line-subtle px-2 py-4">
        <Avatar name={user.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate type-label-m">{user.name}</p>
          <p className="truncate type-body-s text-fg-tertiary">{user.role}</p>
        </div>
        <Link href="/" className="type-label-s text-fg-secondary hover:text-fg">
          Changer
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh lg:pl-64">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        Aller au contenu
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line-subtle bg-surface px-4 lg:flex">{sidebar}</aside>

      {mobileNav === "drawer" && drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Fermer le menu" className="absolute inset-0 bg-overlay" onClick={() => setDrawer(false)} />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-surface px-4 shadow-e3">
            <button onClick={() => setDrawer(false)} aria-label="Fermer le menu" className="absolute top-6 right-3 flex size-9 items-center justify-center rounded-md hover:bg-surface-sunken">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-2 px-4 md:px-6 lg:px-8">
          {mobileNav === "drawer" && (
            <button onClick={() => setDrawer(true)} aria-label="Ouvrir le menu" className="-ml-2 flex size-10 items-center justify-center rounded-md hover:bg-surface-sunken lg:hidden">
              <Menu className="size-5" />
            </button>
          )}
          <Link href={root} className="lg:hidden" aria-label="Accueil">
            <Logo size="sm" />
          </Link>
          <form role="search" className="relative ml-auto hidden w-full max-w-sm md:block lg:ml-0" onSubmit={(e) => e.preventDefault()}>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-fg-secondary" />
            <input type="search" placeholder={searchPlaceholder} aria-label="Rechercher" className="h-11 w-full rounded-full bg-surface-sunken pr-12 pl-10 type-body-m placeholder:text-fg-tertiary focus:bg-surface focus:shadow-focus focus:outline-none" />
            <span className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-fg-inverse">
              <SlidersHorizontal className="size-4" />
            </span>
          </form>
          <div className={cn("ml-auto flex items-center gap-1", "md:ml-2 lg:ml-auto")}>
            <button aria-label="Rechercher" className="flex size-10 items-center justify-center rounded-md hover:bg-surface-sunken md:hidden">
              <Search className="size-5" />
            </button>
            <ThemeToggle />
            <Link href={notifications.href} aria-label={`Notifications (${notifications.count} non lues)`} className="relative flex size-10 items-center justify-center rounded-md hover:bg-surface-sunken">
              <Bell className="size-5" />
              {notifications.count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 type-caption text-fg-on-accent">{notifications.count}</span>
              )}
            </Link>
            <Avatar name={user.name} size="sm" className="ml-1 hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      <main id="main" className={cn("mx-auto max-w-[1280px] px-4 pt-5 md:px-6 md:pt-8 lg:px-8", mobileNav === "bottom" ? "pb-28 lg:pb-12" : "pb-12")}>
        {children}
      </main>

      {mobileNav === "bottom" && <BottomNav items={nav.filter((n) => n.mobile)} root={root} />}
    </div>
  );
}
