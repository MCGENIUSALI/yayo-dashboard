"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isActive, type NavItem } from "@/lib/nav";

/** Item height + gap: the active indicator moves by this step. Keep in sync with h-11 / gap-1. */
const ROW = 48;

/**
 * Tooltips of the folded rail. One fixed element for the whole rail, so it is
 * never clipped by the scrolling nav, and only when the rail is folded.
 */
type TipBind = (label: string) => { onPointerEnter: (e: React.PointerEvent<HTMLElement>) => void; onPointerLeave: () => void; onFocus: (e: React.FocusEvent<HTMLElement>) => void; onBlur: () => void };
const TipContext = createContext<TipBind | null>(null);

export function RailTooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<{ label: string; top: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const visible = useRef(false);

  const bind = useCallback<TipBind>((label) => {
    const show = (el: HTMLElement, delay: number) => {
      if (document.documentElement.dataset.sidebar !== "collapsed") return;
      window.clearTimeout(timer.current);
      const r = el.getBoundingClientRect();
      // Moving from one item to the next keeps the tooltip without waiting again.
      timer.current = window.setTimeout(
        () => {
          visible.current = true;
          setTip({ label, top: r.top + r.height / 2 });
        },
        visible.current ? 0 : delay,
      );
    };
    const hide = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        visible.current = false;
        setTip(null);
      }, 60);
    };
    return {
      onPointerEnter: (e) => e.pointerType === "mouse" && show(e.currentTarget, 250),
      onPointerLeave: hide,
      onFocus: (e) => e.currentTarget.matches(":focus-visible") && show(e.currentTarget, 0),
      onBlur: hide,
    };
  }, []);

  return (
    <TipContext.Provider value={bind}>
      {children}
      {tip && (
        <span
          aria-hidden
          key={tip.label}
          style={{ top: tip.top }}
          className="pointer-events-none fixed left-[calc(var(--sidebar-w)+8px)] z-50 hidden -translate-y-1/2 animate-fade-in rounded-sm bg-inverse px-2.5 py-1.5 type-label-s whitespace-nowrap text-fg-inverse shadow-e2 lg:block"
        >
          {tip.label}
        </span>
      )}
    </TipContext.Provider>
  );
}

const noTip = () => ({});
function useTip(label: string) {
  const bind = useContext(TipContext);
  return bind ? bind(label) : noTip();
}

/** Shows that the clicked route is loading (only noticeable on slow navigations). */
function PendingDot() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={cn("absolute top-1/2 right-2 size-1.5 -translate-y-1/2 rounded-full bg-accent opacity-0 transition-opacity duration-(--duration-fast)", pending && "animate-pulse opacity-100 delay-150")} />;
}

/** Row of the rail: icon, label that fades when folded, optional badge. Shared by nav links and footer actions. */
export function RailRow({ icon, label, badge, className }: { icon: ReactNode; label: string; badge?: number; className?: string }) {
  return (
    <span className={cn("relative flex h-11 w-full items-center gap-3 px-2.5", className)}>
      <span className="relative flex size-5 shrink-0 items-center justify-center [&_svg]:size-5">
        {icon}
        {badge ? <span aria-hidden className="absolute -top-1 -right-1 hidden size-2 rounded-full bg-accent ring-2 ring-surface collapsed:block" /> : null}
      </span>
      <span className="flex-1 truncate transition-opacity duration-(--duration-fast) ease-(--ease-standard) collapsed:opacity-0">{label}</span>
      {badge ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 type-caption text-fg-on-accent transition-opacity duration-(--duration-fast) collapsed:opacity-0">
          {badge}
          <span className="sr-only"> en attente</span>
        </span>
      ) : null}
    </span>
  );
}

export const railItemClass = "pressable group relative flex rounded-md type-label-m outline-offset-0 overflow-hidden";

export function SidebarNav({ items, root, onNavigate }: { items: NavItem[]; root: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeIndex = items.findIndex((item) => isActive(pathname, item, root));
  return (
    <nav aria-label="Navigation principale" className="relative flex flex-col gap-1">
      {/* Active indicator: one element that slides between rows (transform only). */}
      <span
        aria-hidden
        style={{ transform: `translateY(${Math.max(activeIndex, 0) * ROW}px)` }}
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-11 rounded-md bg-brand transition-[transform,opacity] duration-(--duration-base) ease-(--ease-out)",
          activeIndex === -1 && "opacity-0",
        )}
      />
      {items.map((item, i) => (
        <SidebarLink key={item.href} item={item} active={i === activeIndex} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function SidebarLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  const tip = useTip(item.label);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      {...tip}
      className={cn(
        railItemClass,
        "transition-[color,background-color,transform] duration-(--duration-base)",
        active ? "font-semibold text-fg-inverse" : "text-fg-secondary hover:bg-surface-sunken hover:text-fg",
      )}
    >
      <RailRow icon={<Icon />} label={item.label} badge={item.badge} />
      <PendingDot />
    </Link>
  );
}

/** Rail action that is not a route (fold toggle, space switch) with the same row layout and tooltip. */
export function RailAction({ label, icon, href, onClick, ...aria }: { label: string; icon: ReactNode; href?: string; onClick?: () => void; "aria-expanded"?: boolean; "aria-controls"?: string }) {
  const tip = useTip(label);
  const cls = cn(railItemClass, "text-fg-secondary hover:bg-surface-sunken hover:text-fg");
  if (href)
    return (
      <Link href={href} className={cls} {...tip}>
        <RailRow icon={icon} label={label} />
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cn(cls, "text-left")} {...aria} {...tip}>
      <RailRow icon={icon} label={label} />
    </button>
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
              <Link href={item.href} aria-current={active ? "page" : undefined} className="group flex flex-col items-center gap-1 py-2 outline-offset-[-2px]">
                <span
                  className={cn(
                    "relative flex h-8 w-12 items-center justify-center rounded-full transition-[background-color,color,transform] duration-(--duration-fast) ease-(--ease-standard) group-active:scale-90",
                    active ? "bg-accent-subtle text-fg-accent" : "text-fg-secondary",
                  )}
                >
                  <Icon className="size-5" />
                  {item.badge ? <span className="absolute top-0.5 right-2 size-2 rounded-full bg-accent" /> : null}
                </span>
                <span className={cn("type-caption transition-colors duration-(--duration-fast)", active ? "text-fg" : "text-fg-tertiary")}>{item.short ?? item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
