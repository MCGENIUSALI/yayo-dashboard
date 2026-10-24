import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeader({ title, href, linkLabel = "Tout voir", className }: { title: ReactNode; href?: string; linkLabel?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="type-h4">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-0.5 type-label-m text-fg-accent hover:underline">
          {linkLabel}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

/** Settings-style list row (DS "List Row · Trailing=Chevron/Value"). */
export function ListRow({ icon, title, subtitle, href, trailing, className }: { icon?: ReactNode; title: ReactNode; subtitle?: ReactNode; href?: string; trailing?: ReactNode; className?: string }) {
  const inner = (
    <>
      {icon && <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken [&_svg]:size-5">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="type-label-l">{title}</p>
        {subtitle && <p className="truncate type-body-s text-fg-tertiary">{subtitle}</p>}
      </div>
      {trailing ?? (href && <ChevronRight className="size-5 shrink-0 text-fg-tertiary" />)}
    </>
  );
  const cls = cn("flex items-center gap-3 px-4 py-3", href && "transition-colors duration-(--duration-instant) hover:bg-surface-muted active:bg-surface-sunken", className);
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-sunken text-fg-secondary [&_svg]:size-6">{icon}</span>
      <p className="type-h4">{title}</p>
      {children && <p className="max-w-sm type-body-m text-fg-secondary">{children}</p>}
      {action}
    </div>
  );
}

/** Line of a money breakdown (commande − commission − livraison = net). */
export function MoneyRow({ label, value, tone, strong }: { label: ReactNode; value: ReactNode; tone?: "success" | "danger"; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", strong ? "pt-3" : "py-1")}>
      <span className={strong ? "type-h4" : "type-body-m text-fg-secondary"}>{label}</span>
      <span className={cn("tabular-nums whitespace-nowrap", strong ? "type-h2" : "type-label-m", tone === "success" && "text-fg-success", tone === "danger" && "text-fg-danger")}>{value}</span>
    </div>
  );
}

/** Handover / reception code shown as separate boxes (DS "Delivery Code"). */
export function CodeBoxes({ code }: { code: string }) {
  return (
    <div className="flex justify-center gap-2.5" aria-label={`Code ${code.split("").join(" ")}`}>
      {code.split("").map((c, i) => (
        <span key={i} className="flex h-14 w-12 items-center justify-center rounded-md bg-surface type-h2 shadow-e1">
          {c}
        </span>
      ))}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-line-subtle", className)} />;
}
