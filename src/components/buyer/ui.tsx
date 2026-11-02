import { Lock, PackageCheck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import type { Shop } from "@/lib/types";

/** Large screen title with its overline (D1 · Mes commandes, D6, D7). */
export function ScreenHeader({ overline, title, className }: { overline?: ReactNode; title: ReactNode; className?: string }) {
  return (
    <header className={cn("bg-surface px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-4", className)}>
      {overline && <p className="type-body-m text-fg-secondary">{overline}</p>}
      <h1 className="type-h1">{title}</h1>
    </header>
  );
}

/** Rating stars (filled to the nearest half) with the value and the number of reviews. */
export function Stars({ value, reviews, size = "sm", className }: { value: number; reviews?: number; size?: "sm" | "md"; className?: string }) {
  const s = size === "md" ? "size-5" : "size-3.5";
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Note ${value.toLocaleString("fr-FR")} sur 5${reviews ? `, ${reviews} avis` : ""}`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(s, i <= Math.round(value) ? "fill-warning text-warning" : "text-warning")} />
        ))}
      </span>
      <span className={cn(size === "md" ? "type-label-m" : "type-body-s", "text-fg")} aria-hidden>
        {value.toLocaleString("fr-FR")}
      </span>
      {reviews !== undefined && (
        <span className="type-body-s text-fg-tertiary" aria-hidden>
          ({reviews} avis)
        </span>
      )}
    </span>
  );
}

/** "Paiement 100 % sécurisé par YA YO Escrow" strip. */
export function EscrowNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center justify-center gap-2 rounded-md bg-success-subtle px-4 py-3 type-body-s text-fg-success", className)}>
      <ShieldCheck className="size-4.5 shrink-0" />
      Paiement 100 % sécurisé par YA YO Escrow
    </p>
  );
}

/** Black "Protection YA YO Escrow" card (C3, C5, A3). */
export function EscrowCard({ className }: { className?: string }) {
  const rows = [
    { icon: <Lock />, text: "Ton argent est bloqué par YA YO, pas par le vendeur" },
    { icon: <PackageCheck />, text: "Le vendeur est payé après la livraison confirmée" },
    { icon: <RotateCcw />, text: "Remboursé si le colis n’arrive pas ou n’est pas conforme" },
  ];
  return (
    <section className={cn("rounded-lg bg-inverse p-5 text-fg-inverse", className)} aria-label="Protection YA YO Escrow">
      <p className="flex items-center gap-2 type-label-l">
        <ShieldCheck className="size-6 text-success" /> Protection YA YO Escrow
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.text} className="flex gap-3 type-body-s opacity-90 [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-success">
            {r.icon}
            {r.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Dark info card used for escrow reminders ("Ton argent est protégé", "Les fonds restent bloqués"). */
export function InverseNote({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-lg bg-inverse p-4 text-fg-inverse", className)}>
      <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-success">
        <span className="h-2 w-0.5 rounded-full bg-success" />
      </span>
      <div>
        <p className="type-label-m">{title}</p>
        <p className="mt-0.5 type-body-s opacity-80">{children}</p>
      </div>
    </div>
  );
}

/** Shop avatar + name + "Vendeur certifié · Gombe". */
export function ShopLine({ shop, href, trailing, className }: { shop: Shop; href?: string; trailing?: ReactNode; className?: string }) {
  const body = (
    <>
      <Avatar name={shop.name} verified={shop.verified} />
      <span className="min-w-0 flex-1">
        <span className="block truncate type-label-m">{shop.name}</span>
        <span className="block truncate type-body-s text-fg-tertiary">
          {shop.verified ? "Vendeur certifié" : shop.category} · {shop.area}
        </span>
      </span>
      {trailing}
    </>
  );
  return href ? (
    <Link href={href} className={cn("flex items-center gap-3 rounded-md outline-offset-2", className)}>
      {body}
    </Link>
  ) : (
    <div className={cn("flex items-center gap-3", className)}>{body}</div>
  );
}

/** Checkout progress: "● ○ ○ Étape 1 sur 3 · Adresse et créneau". */
export function StepDots({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <p className="flex items-center gap-2 type-label-s text-fg-secondary">
      <span className="flex items-center gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-1.5 rounded-full", i + 1 === step ? "w-6 bg-accent" : "w-1.5 bg-line-strong")} />
        ))}
      </span>
      Étape {step} sur {total} · {label}
    </p>
  );
}

const circleTones = {
  accent: "bg-accent-subtle text-fg-accent",
  success: "bg-success-subtle text-fg-success",
  danger: "bg-danger-subtle text-fg-danger",
  neutral: "bg-surface-sunken text-fg-secondary",
} as const;

/** Big round illustration on status screens (C4, C5, C6, E9, D8). */
export function StatusCircle({ tone, children, size = "lg" }: { tone: keyof typeof circleTones; children: ReactNode; size?: "md" | "lg" }) {
  return (
    <span aria-hidden className={cn("mx-auto flex items-center justify-center rounded-full", size === "lg" ? "size-28 [&_svg]:size-12" : "size-20 [&_svg]:size-8", circleTones[tone])}>
      {children}
    </span>
  );
}

/** Footer stuck to the bottom of a screen (primary actions), above the home indicator. */
export function BottomBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("sticky bottom-0 z-30 mt-auto border-t border-line-subtle bg-surface/95 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur", className)}>
      {children}
    </div>
  );
}

/** White rounded section inside a screen. */
export function Panel({ className, children, ...props }: { className?: string; children: ReactNode } & React.ComponentProps<"section">) {
  return (
    <section className={cn("rounded-xl bg-surface p-4", className)} {...props}>
      {children}
    </section>
  );
}
