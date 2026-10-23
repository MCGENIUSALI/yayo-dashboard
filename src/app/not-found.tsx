import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center px-4">
      <div className="w-full">
        <EmptyState icon={<SearchX />} title="Page introuvable" action={<ButtonLink href="/">Retour à l’accueil</ButtonLink>}>
          Ce lien n’existe pas ou a été déplacé.
        </EmptyState>
      </div>
    </main>
  );
}
