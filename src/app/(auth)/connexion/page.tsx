import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { errors, messages, one, reasons } from "@/app/(auth)/notices";
import { FormAlert } from "@/components/auth/form-alert";
import { SignInForm } from "@/components/auth/sign-in-form";
import { tryGetConfig } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/server";
import { safeNext } from "@/lib/redirect";

export const metadata: Metadata = { title: "Connexion" };

export default async function SignInPage({ searchParams }: PageProps<"/connexion">) {
  const q = await searchParams;
  const next = safeNext(one(q.suite));
  const session = await getSession();
  if (session.state === "valid") redirect(next);

  const config = tryGetConfig();
  const error = errors[one(q.erreur) ?? ""] ?? (config ? undefined : errors.indisponible);
  const reason = reasons[one(q.raison) ?? ""];
  const message = messages[one(q.message) ?? ""];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-h2">Se connecter</h1>
        <p className="mt-1 type-body-l text-fg-secondary">Accède à ton espace vendeur ou à l’administration YA YO!.</p>
      </div>
      {reason && (
        <FormAlert tone="warning" title={reason.title}>
          {reason.body}
        </FormAlert>
      )}
      {message && (
        <FormAlert tone="success" title={message.title}>
          {message.body}
        </FormAlert>
      )}
      {error && (
        <FormAlert tone={error.tone ?? "danger"} title={error.title}>
          {error.body}
        </FormAlert>
      )}
      <SignInForm next={next === "/" ? undefined : next} googleEnabled={Boolean(config?.googleEnabled)} />
    </div>
  );
}
