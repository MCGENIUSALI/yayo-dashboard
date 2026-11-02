import { Ban, MessageCircle } from "lucide-react";
import { StatusCircle } from "@/components/buyer/ui";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Compte suspendu" };

/** E9 · Compte suspendu. Orders in progress stay protected by escrow. */
export default function Page() {
  return (
    <div className="flex flex-1 flex-col bg-surface px-6 pt-[calc(env(safe-area-inset-top)+6rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <StatusCircle tone="danger" size="md">
        <Ban />
      </StatusCircle>
      <h1 className="mt-6 type-h3">Ton compte est suspendu</h1>
      <p className="mt-2 type-body-m text-fg-secondary">Suite à plusieurs litiges, ton compte est en cours d’examen. Tes commandes en cours restent protégées par le séquestre.</p>
      <ButtonLink href="mailto:support@yayo.cd" size="lg" block className="mt-auto" icon={<MessageCircle className="size-5" />}>
        Contacter le support
      </ButtonLink>
    </div>
  );
}
