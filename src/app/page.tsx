import { ArrowRight, ShieldCheck, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionSync } from "@/components/auth/session-sync";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { requireUser } from "@/lib/auth/server";

const spaces = [
  { role: "seller", href: "/vendeur", icon: Store, title: "Espace vendeur", body: "Ventes, commandes à préparer, catalogue, publications sociales, revenus et boutique." },
  { role: "admin", href: "/admin", icon: ShieldCheck, title: "Administration", body: "Séquestre, litiges, validations KYC, utilisateurs, livreurs, modération et rapports." },
] as const;

/** Lists only the spaces the account may open; with a single one, goes straight there. */
export default async function Home() {
  const { user } = await requireUser();
  const allowed = spaces.filter((s) => user.roles.includes(s.role));
  if (allowed.length === 1) redirect(allowed[0].href);
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-4 py-12 md:px-6">
      <SessionSync />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <ButtonLink href="/compte" variant="ghost" size="sm" icon={<UserRound className="size-4" />}>
              Mon compte
            </ButtonLink>
            <SignOutButton variant="ghost" className="h-9 px-3 type-label-s">
              Déconnexion
            </SignOutButton>
          </div>
        </div>
        <h1 className="type-h1 md:type-display">Bonjour {user.name.split(" ")[0]}</h1>
        <p className="type-body-l text-fg-secondary">Choisis ton espace. Les paiements restent sous séquestre jusqu’à la livraison confirmée.</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {allowed.map(({ href, icon: Icon, title, body }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full flex-col gap-4 rounded-xl border border-line-subtle bg-surface p-6 shadow-e1 transition-[box-shadow,transform,border-color] duration-(--duration-fast) ease-(--ease-standard) hover:border-line hover:shadow-e2 active:scale-[0.99]">
              <span className="flex size-12 items-center justify-center rounded-md bg-accent-subtle text-fg-accent">
                <Icon className="size-6" />
              </span>
              <div className="flex-1">
                <h2 className="type-h3">{title}</h2>
                <p className="mt-1 type-body-m text-fg-secondary">{body}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 type-label-m">
                Ouvrir <ArrowRight className="size-4 transition-transform duration-(--duration-fast) ease-(--ease-out) group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
