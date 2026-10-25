"use client";

import { Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { authLink } from "@/components/auth/link-style";
import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { focusField, useFieldErrors } from "@/components/auth/use-field-errors";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { requestResetAction } from "@/lib/auth/actions";
import { emailSchema } from "@/lib/auth/validation";

export function ForgotForm({ initialEmail = "" }: { initialEmail?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState(initialEmail);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useAuthForm<Awaited<ReturnType<typeof requestResetAction>>>();
  const v = useFieldErrors({ email }, { email: (x) => (emailSchema.safeParse(x).success ? null : x.trim() ? "Adresse e-mail invalide." : "Indique ton adresse e-mail.") });

  useEffect(() => {
    if (sentTo) doneRef.current?.focus();
  }, [sentTo]);

  if (sentTo)
    return (
      <div className="flex flex-col gap-5">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-subtle text-fg-success">
          <MailCheck className="size-7" />
        </span>
        <div>
          <h1 ref={doneRef} tabIndex={-1} className="type-h2 outline-none">
            Demande envoyée
          </h1>
          <p className="mt-2 type-body-l text-fg-secondary">
            Si un compte existe pour <strong className="font-semibold text-fg break-all">{sentTo}</strong>, tu vas recevoir un lien pour choisir un nouveau mot de passe. Il est valable 30 minutes et ne sert qu’une fois.
          </p>
          <p className="mt-2 type-body-m text-fg-tertiary">Rien reçu après quelques minutes ? Vérifie les courriers indésirables ou refais une demande.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/connexion">Retour à la connexion</ButtonLink>
          <Button variant="ghost" onClick={() => setSentTo(null)}>
            Refaire une demande
          </Button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="type-h2">Mot de passe oublié</h1>
        <p className="mt-1 type-body-l text-fg-secondary">Indique l’adresse de ton compte, nous t’envoyons un lien pour en choisir un nouveau.</p>
      </div>
      <form
        ref={formRef}
        noValidate
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (v.check()) return focusField(formRef.current, "email");
          const r = await form.submit(() => requestResetAction(email));
          if (r?.ok) setSentTo(email.trim());
        }}
      >
        {form.error && form.error.code !== "invalid" && <FormAlert title="Demande impossible">{form.error.message}</FormAlert>}
        <Field label="Adresse e-mail" error={form.serverFields.email || v.visible("email")}>
          {(id) => (
            <Input id={id} name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} icon={<Mail />} value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} onBlur={v.onBlur("email")} disabled={form.pending} placeholder="toi@exemple.com" />
          )}
        </Field>
        <Button type="submit" size="lg" block loading={form.pending}>
          Envoyer le lien
        </Button>
      </form>
      <p className="text-center type-body-m">
        <Link href="/connexion" className={authLink}>
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
