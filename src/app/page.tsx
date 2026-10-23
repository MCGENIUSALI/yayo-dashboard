import { ArrowRight, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const spaces = [
  { href: "/vendeur", icon: Store, title: "Espace vendeur", body: "Ventes, commandes à préparer, catalogue, publications sociales, revenus et boutique." },
  { href: "/admin", icon: ShieldCheck, title: "Administration", body: "Séquestre, litiges, validations KYC, utilisateurs, livreurs, modération et rapports." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-4 py-12 md:px-6">
      <div className="flex flex-col gap-4">
        <Logo />
        <h1 className="type-h1 md:type-display">Acheter et vendre en toute confiance à Kinshasa</h1>
        <p className="type-body-l text-fg-secondary">Choisis ton espace. Les paiements restent sous séquestre jusqu’à la livraison confirmée.</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {spaces.map(({ href, icon: Icon, title, body }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full flex-col gap-4 rounded-xl border border-line-subtle bg-surface p-6 shadow-e1 transition hover:shadow-e2">
              <span className="flex size-12 items-center justify-center rounded-md bg-accent-subtle text-fg-accent">
                <Icon className="size-6" />
              </span>
              <div className="flex-1">
                <h2 className="type-h3">{title}</h2>
                <p className="mt-1 type-body-m text-fg-secondary">{body}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 type-label-m">
                Ouvrir <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
