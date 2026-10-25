import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Accès refusé" };

export default async function ForbiddenPage() {
  const { user } = await requireUser();
  return (
    <div className="flex flex-col gap-5">
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-subtle text-fg-danger">
        <ShieldAlert className="size-7" />
      </span>
      <div>
        <h1 className="type-h2">Accès refusé</h1>
        <p className="mt-2 type-body-l text-fg-secondary">
          Ton compte ({user.email}) n’a pas les droits nécessaires pour cette page. Si tu penses que c’est une erreur, contacte un administrateur YA YO!.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ButtonLink href="/">Retour à l’accueil</ButtonLink>
        <ButtonLink href="/compte" variant="outline">
          Mon compte
        </ButtonLink>
      </div>
    </div>
  );
}
