"use client";

import { CircleCheck, MailQuestion } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { useStripToken } from "@/components/auth/strip-token";
import { TokenProblem } from "@/components/auth/token-problem";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { confirmEmailAction, resendVerificationAction } from "@/lib/auth/actions";
import { emailSchema } from "@/lib/auth/validation";

type Status = "expired" | "used" | "invalid";

/**
 * The link only opens this page; the address is confirmed by an explicit
 * click (POST). Mail scanners that prefetch links therefore cannot consume
 * the token on the user's behalf.
 */
export function VerifyEmail({ token, initial }: { token: string | null; initial: { status: "valid" } | { status: Status; message: string } }) {
  useStripToken();
  const [state, setState] = useState<"ready" | "done" | { status: Status; message: string }>(initial.status === "valid" ? "ready" : initial);
  const form = useAuthForm<Awaited<ReturnType<typeof confirmEmailAction>>>();
  const doneRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  if (state === "done")
    return (
      <div className="flex flex-col gap-5">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-subtle text-fg-success">
          <CircleCheck className="size-7" />
        </span>
        <div role="status">
          <h1 ref={doneRef} tabIndex={-1} className="type-h2 outline-none">
            Adresse confirmée
          </h1>
          <p className="mt-2 type-body-l text-fg-secondary">Ton compte est actif. Connecte-toi pour accéder à ton espace.</p>
        </div>
        <ButtonLink href="/connexion?message=email_verifie" size="lg">
          Se connecter
        </ButtonLink>
      </div>
    );

  if (state !== "ready")
    return (
      <TokenProblem status={state.status} message={state.message}>
        <ResendForm />
      </TokenProblem>
    );

  return (
    <div className="flex flex-col gap-5">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent-subtle text-fg-accent">
        <MailQuestion className="size-7" />
      </span>
      <div>
        <h1 className="type-h2">Confirme ton adresse</h1>
        <p className="mt-2 type-body-l text-fg-secondary">Un dernier clic pour activer ton compte YA YO!.</p>
      </div>
      {form.error && <FormAlert title="Confirmation impossible">{form.error.message}</FormAlert>}
      <Button
        size="lg"
        block
        loading={form.pending}
        onClick={async () => {
          const r = await form.submit(() => confirmEmailAction(token ?? ""));
          if (r?.ok) setState("done");
          else if (r && (r.code === "expired" || r.code === "used" || r.code === "invalid")) setState({ status: r.code, message: r.error });
        }}
      >
        Confirmer mon adresse
      </Button>
    </div>
  );
}

function ResendForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const form = useAuthForm<Awaited<ReturnType<typeof resendVerificationAction>>>();
  const invalid = !emailSchema.safeParse(email).success;
  if (sent)
    return (
      <FormAlert tone="success" title="Demande envoyée">
        Si cette adresse attend une confirmation, un nouveau lien vient de partir.
      </FormAlert>
    );
  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setTouched(true);
        if (invalid) return;
        const r = await form.submit(() => resendVerificationAction(email));
        if (r?.ok) setSent(true);
      }}
    >
      {form.error && form.error.code !== "invalid" && <FormAlert title="Envoi impossible">{form.error.message}</FormAlert>}
      <Field label="Recevoir un nouveau lien" error={form.serverFields.email || (touched && invalid ? "Adresse e-mail invalide." : undefined)}>
        {(id) => <Input id={id} name="email" type="email" autoComplete="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} disabled={form.pending} placeholder="toi@exemple.com" />}
      </Field>
      <Button type="submit" variant="outline" loading={form.pending}>
        Envoyer un nouveau lien
      </Button>
    </form>
  );
}
