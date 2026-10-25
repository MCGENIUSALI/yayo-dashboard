import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { one } from "@/app/(auth)/notices";
import { SignedOutBroadcast } from "@/components/auth/session-sync";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Déconnexion" };

export default async function SignedOutPage({ searchParams }: PageProps<"/deconnexion">) {
  const everywhere = one((await searchParams).partout) === "1";
  return (
    <div className="flex flex-col gap-5">
      <SignedOutBroadcast />
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-sunken text-fg-secondary">
        <LogOut className="size-7" />
      </span>
      <div role="status">
        <h1 className="type-h2">Tu es déconnecté</h1>
        <p className="mt-2 type-body-l text-fg-secondary">
          {everywhere ? "Toutes tes sessions ont été fermées, sur tous tes appareils." : "Ta session est fermée sur cet appareil."} Pense à fermer le navigateur si l’appareil est partagé.
        </p>
      </div>
      <ButtonLink href="/connexion" size="lg">
        Se reconnecter
      </ButtonLink>
    </div>
  );
}
