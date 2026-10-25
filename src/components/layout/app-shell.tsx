"use client";

import { ArrowLeftRight, Bell, Menu, PanelLeftClose, PanelLeftOpen, Search, SlidersHorizontal, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SessionSync } from "@/components/auth/session-sync";
import { SignOutRailAction } from "@/components/auth/sign-out-button";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav, RailAction, RailTooltipProvider, SidebarNav } from "@/components/layout/sidebar-nav";
import { DESKTOP, useMediaQuery } from "@/hooks/use-media-query";
import { useOverlay } from "@/hooks/use-overlay";
import { cn } from "@/lib/cn";
import { adminNav, sellerNav } from "@/lib/nav";
import { SIDEBAR_KEY } from "@/lib/theme";

const navs = { seller: sellerNav, admin: adminNav };

interface ShellProps {
  /** Nav is resolved client-side: icon components cannot cross the server boundary. */
  navKey: keyof typeof navs;
  root: string;
  space: string;
  /** Display data of the signed-in account, resolved and authorised by the server layout. */
  user: { name: string; role: string };
  /** The account can open more than one space. */
  canSwitch?: boolean;
  notifications: { href: string; count: number };
  searchPlaceholder: string;
  /** "bottom": seller app tab bar under lg. "drawer": admin burger menu. */
  mobileNav: "bottom" | "drawer";
  children: ReactNode;
}

/** Folded state lives on <html data-sidebar> (applied before paint by the theme script). */
function subscribeSidebar(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sidebar"] });
  return () => observer.disconnect();
}
const isCollapsed = () => document.documentElement.dataset.sidebar === "collapsed";

function setCollapsed(next: boolean) {
  const d = document.documentElement;
  if (next) d.dataset.sidebar = "collapsed";
  else delete d.dataset.sidebar;
  try {
    localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
  } catch {}
}

export function AppShell({ navKey, root, space, user, canSwitch, notifications, searchPlaceholder, mobileNav, children }: ShellProps) {
  const nav = navs[navKey];
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeSidebar, isCollapsed, () => false);
  const desktop = useMediaQuery(DESKTOP);
  const [drawer, setDrawer] = useState(false);
  const [drawerPath, setDrawerPath] = useState(pathname);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Any route change (link, back button, programmatic) closes the drawer.
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    if (drawer) setDrawer(false);
  }
  const drawerOpen = drawer && !desktop;
  useOverlay(drawerRef, { active: drawerOpen, onClose: () => setDrawer(false), initialFocus: closeRef });

  // Crossing the lg breakpoint with the drawer open: the rail takes over, the drawer state is dropped.
  if (desktop && drawer) setDrawer(false);

  const [search, setSearch] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (search) searchInput.current?.focus();
  }, [search]);

  const header = (
    <div className="relative flex h-[76px] shrink-0 items-center px-1">
      <Link href={root} aria-label="Accueil" className="flex items-center rounded-sm transition-opacity duration-(--duration-fast) collapsed:pointer-events-none collapsed:opacity-0">
        <Logo />
      </Link>
      <span className="ml-auto rounded-full bg-surface-sunken px-2 py-1 type-caption text-fg-secondary transition-opacity duration-(--duration-fast) collapsed:opacity-0">{space}</span>
      {/* Compact mark shown when the rail is folded. */}
      <Link
        href={root}
        aria-label="Accueil"
        tabIndex={collapsed ? 0 : -1}
        aria-hidden={!collapsed}
        className="pointer-events-none absolute top-1/2 left-1 hidden h-8 w-10 -translate-y-1/2 items-center justify-center rounded-sm bg-brand text-[15px] font-extrabold text-fg-inverse opacity-0 transition-opacity duration-(--duration-fast) collapsed:pointer-events-auto collapsed:opacity-100 lg:flex"
      >
        YO!
      </Link>
    </div>
  );

  const footer = (rail: boolean) => (
    <div className="mt-auto flex flex-col gap-1 border-t border-line-subtle py-3">
      {canSwitch && <RailAction href="/" label="Changer d’espace" icon={<ArrowLeftRight />} />}
      <RailAction href="/compte" label="Mon compte" icon={<UserRound />} />
      <SignOutRailAction />
      {rail && (
        <RailAction
          label={collapsed ? "Déplier le menu" : "Réduire le menu"}
          icon={collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-controls="sidebar-rail"
        />
      )}
      <div className="flex items-center gap-3 px-1.5 pt-2">
        <Avatar name={user.name} size="sm" />
        <div className="min-w-0 flex-1 transition-opacity duration-(--duration-fast) collapsed:opacity-0">
          <p className="truncate type-label-m">{user.name}</p>
          <p className="truncate type-body-s text-fg-tertiary">{user.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh transition-[padding] duration-(--duration-slow) ease-(--ease-standard) lg:pl-(--sidebar-w)">
      <SessionSync />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        Aller au contenu
      </a>

      <RailTooltipProvider>
        <aside
          id="sidebar-rail"
          data-rail
          aria-label="Menu latéral"
          className="fixed inset-y-0 left-0 z-40 hidden w-(--sidebar-w) flex-col overflow-x-hidden border-r border-line-subtle bg-surface px-4 transition-[width] duration-(--duration-slow) ease-(--ease-standard) lg:flex"
        >
          {header}
          <div className="-mx-4 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 scrollbar-none">
            <SidebarNav items={nav} root={root} />
            {footer(true)}
          </div>
        </aside>
      </RailTooltipProvider>

      {mobileNav === "drawer" && (
        <div data-state={drawerOpen ? "open" : "closed"} inert={!drawerOpen || undefined} className="group/drawer fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden
            onClick={() => setDrawer(false)}
            className="motion-fade invisible absolute inset-0 bg-overlay opacity-0 transition-[opacity,visibility] duration-(--duration-drawer) ease-(--ease-standard) group-data-[state=open]/drawer:visible group-data-[state=open]/drawer:opacity-100 group-data-[state=open]/drawer:transition-opacity"
          />
          <aside
            ref={drawerRef}
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className={cn(
              "invisible absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] -translate-x-full flex-col bg-surface pr-4 pl-[max(1rem,env(safe-area-inset-left))] shadow-e3 outline-none",
              "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
              // Opening: visible at once (so focus can move in), then slides. Closing: slides, then hides.
              "transition-[transform,visibility] duration-(--duration-drawer) ease-(--ease-in) group-data-[state=open]/drawer:visible group-data-[state=open]/drawer:translate-x-0 group-data-[state=open]/drawer:transition-transform group-data-[state=open]/drawer:ease-(--ease-out)",
              "motion-fade motion-reduce:translate-x-0 motion-reduce:opacity-0 motion-reduce:transition-[opacity,visibility] motion-reduce:group-data-[state=open]/drawer:opacity-100 motion-reduce:group-data-[state=open]/drawer:transition-opacity",
            )}
          >
            <div className="flex items-center">
              <div className="min-w-0 flex-1">{header}</div>
              <button ref={closeRef} onClick={() => setDrawer(false)} aria-label="Fermer le menu" className="pressable -mr-1 ml-2 flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-surface-sunken">
                <X className="size-5" />
              </button>
            </div>
            <div className="-mx-4 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4">
              <SidebarNav items={nav} root={root} onNavigate={() => setDrawer(false)} />
              {footer(false)}
            </div>
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-2 px-4 md:px-6 lg:px-8">
          {mobileNav === "drawer" && (
            <button
              onClick={() => setDrawer(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className="pressable -ml-2 flex size-10 items-center justify-center rounded-md hover:bg-surface-sunken lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          )}
          <Link href={root} className="lg:hidden" aria-label="Accueil">
            <Logo size="sm" />
          </Link>
          <form role="search" className="relative ml-auto hidden w-full max-w-sm md:block lg:ml-0" onSubmit={(e) => e.preventDefault()}>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-fg-secondary" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              aria-label="Rechercher"
              className="h-11 w-full rounded-full bg-surface-sunken pr-12 pl-10 type-body-m transition-[background-color,box-shadow] duration-(--duration-instant) placeholder:text-fg-tertiary focus:bg-surface focus:shadow-focus focus:outline-none"
            />
            <span aria-hidden className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-fg-inverse">
              <SlidersHorizontal className="size-4" />
            </span>
          </form>
          <div className={cn("ml-auto flex items-center gap-1", "md:ml-2 lg:ml-auto")}>
            <button
              onClick={() => setSearch((v) => !v)}
              aria-label={search ? "Fermer la recherche" : "Rechercher"}
              aria-expanded={search}
              aria-controls="mobile-search"
              className="pressable flex size-10 items-center justify-center rounded-md hover:bg-surface-sunken md:hidden"
            >
              {search ? <X className="size-5" /> : <Search className="size-5" />}
            </button>
            <ThemeToggle />
            <Link
              href={notifications.href}
              aria-label={`Notifications (${notifications.count} non lues)`}
              className="pressable relative flex size-10 items-center justify-center rounded-md hover:bg-surface-sunken"
            >
              <Bell className="size-5" />
              {notifications.count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 type-caption text-fg-on-accent">{notifications.count}</span>
              )}
            </Link>
            <Link href="/compte" aria-label="Mon compte" className="pressable ml-1 rounded-full">
              <Avatar name={user.name} size="sm" />
            </Link>
          </div>
        </div>
        {/* Mobile search row: unfolds under the bar (grid rows 0fr → 1fr, no fixed height). */}
        <div id="mobile-search" inert={!search || undefined} className={cn("grid transition-[grid-template-rows] duration-(--duration-base) ease-(--ease-out) md:hidden", search ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <form role="search" className="overflow-hidden" onSubmit={(e) => e.preventDefault()}>
            <div className={cn("relative px-4 pt-1 pb-3 transition-opacity duration-(--duration-fast)", search ? "opacity-100" : "opacity-0")}>
              <Search className="pointer-events-none absolute top-1/2 left-7.5 size-4.5 -translate-y-[calc(50%+4px)] text-fg-secondary" />
              <input
                ref={searchInput}
                type="search"
                placeholder={searchPlaceholder}
                aria-label="Rechercher"
                onKeyDown={(e) => e.key === "Escape" && setSearch(false)}
                className="h-11 w-full rounded-full bg-surface-sunken pr-4 pl-10 type-body-m transition-[background-color,box-shadow] duration-(--duration-instant) placeholder:text-fg-tertiary focus:bg-surface focus:shadow-focus focus:outline-none"
              />
            </div>
          </form>
        </div>
      </header>

      <main id="main" tabIndex={-1} className={cn("mx-auto max-w-[1280px] px-4 pt-5 outline-none md:px-6 md:pt-8 lg:px-8", mobileNav === "bottom" ? "pb-28 lg:pb-12" : "pb-12")}>
        {children}
      </main>

      {mobileNav === "bottom" && <BottomNav items={nav.filter((n) => n.mobile)} root={root} />}
    </div>
  );
}
