import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const promises = [
  { icon: ShieldCheck, text: "Paiements gardés sous séquestre jusqu’à la livraison confirmée." },
  { icon: Truck, text: "Livraison confirmée par code, sans contact direct." },
  { icon: PackageCheck, text: "Commandes, catalogue et revenus au même endroit." },
];

/**
 * Authentication screens: brand panel on desktop, single column on mobile.
 * Secondary text is one step darker here than the design-system tertiary
 * (neutral-500 is 4.3:1 on white, under the WCAG AA 4.5:1 for small text).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh [--text-tertiary:var(--neutral-600)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] dark:[--text-tertiary:var(--neutral-400)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-inverse p-10 text-fg-inverse lg:flex">
        <Logo className="[&>span:last-child]:bg-(--text-inverse) [&>span:last-child]:text-(--bg-inverse)" />
        <div className="max-w-md">
          <p className="type-display">Acheter et vendre en toute confiance à Kinshasa</p>
          <ul className="mt-8 flex flex-col gap-4">
            {promises.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 type-body-l opacity-90">
                <Icon className="mt-0.5 size-5 shrink-0 text-fg-accent" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="type-body-s opacity-60">© YA YO! · Marketplace congolaise</p>
      </aside>
      <div className="flex min-w-0 flex-col bg-surface">
        <header className="flex h-16 items-center justify-between px-4 pt-[env(safe-area-inset-top)] md:px-8">
          <Link href="/connexion" aria-label="YA YO! · Connexion" className="rounded-sm lg:invisible">
            <Logo size="sm" />
          </Link>
          <ThemeToggle />
        </header>
        <main id="main" className="flex flex-1 items-start justify-center px-4 pt-6 pb-12 md:items-center md:px-8 md:pt-0">
          <div className="w-full max-w-[420px] animate-page-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
