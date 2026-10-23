"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { isActive, type NavItem } from "@/lib/nav";

export function SidebarNav({ items, root, onNavigate }: { items: NavItem[]; root: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item, root);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-3 rounded-md px-3 type-label-m transition-colors",
              active ? "bg-brand text-fg-inverse" : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 type-caption text-fg-on-accent">{item.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile tab bar (DS "Bottom Nav · Seller"). */
export function BottomNav({ items, root }: { items: NavItem[]; root: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line-subtle bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => {
          const active = isActive(pathname, item, root, true);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link href={item.href} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-1 py-2">
                <span className={cn("relative flex h-8 w-12 items-center justify-center rounded-full transition-colors", active ? "bg-accent-subtle text-fg-accent" : "text-fg-secondary")}>
                  <Icon className="size-5" />
                  {item.badge ? <span className="absolute top-0.5 right-2 size-2 rounded-full bg-accent" /> : null}
                </span>
                <span className={cn("type-caption", active ? "text-fg" : "text-fg-tertiary")}>{item.short ?? item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
