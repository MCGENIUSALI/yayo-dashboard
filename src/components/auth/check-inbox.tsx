"use client";

import { MailCheck } from "lucide-react";
import { useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/lib/auth/actions";

/** Confirmation after sign-up. Worded the same whether or not the address already had an account. */
export function CheckInbox({ email, onChangeEmail }: { email: string; onChangeEmail?: () => void }) {
  const form = useAuthForm<Awaited<ReturnType<typeof resendVerificationAction>>>();
  const [sent, setSent] = useState(0);
  return (
    <div className="flex flex-col gap-5" aria-live="polite">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-subtle text-fg-success">
        <MailCheck className="size-7" />
      </span>
      <div>
        <h1 className="type-h2 outline-none" tabIndex={-1} data-autofocus>
          Vérifie ta boîte mail
        </h1>
        <p className="mt-2 type-body-l text-fg-secondary">
          Si l’adresse <strong className="font-semibold text-fg break-all">{email}</strong> peut être utilisée, tu vas recevoir un e-mail. Ouvre le lien qu’il contient pour activer ton compte : il est valable 24 heures.
        </p>
        <p className="mt-2 type-body-m text-fg-tertiary">Pense à regarder dans les courriers indésirables.</p>
      </div>
      {form.error && <FormAlert title="Envoi impossible">{form.error.message}</FormAlert>}
      {sent > 0 && !form.error && !form.pending && <FormAlert tone="success" title="Demande envoyée">Si un compte attend une confirmation, un nouveau lien vient de partir.</FormAlert>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          loading={form.pending}
          onClick={async () => {
            const r = await form.submit(() => resendVerificationAction(email));
            if (r?.ok) setSent((n) => n + 1);
          }}
        >
          Renvoyer le lien
        </Button>
        {onChangeEmail && (
          <Button variant="ghost" onClick={onChangeEmail} disabled={form.pending}>
            Modifier l’adresse
          </Button>
        )}
      </div>
    </div>
  );
}
