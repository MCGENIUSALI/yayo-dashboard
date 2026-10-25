"use client";

import { Mail, User } from "lucide-react";
import Link from "next/link";
import { authLink } from "@/components/auth/link-style";
import { useEffect, useRef, useState } from "react";
import { CheckInbox } from "@/components/auth/check-inbox";
import { FormAlert } from "@/components/auth/form-alert";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { focusField, useFieldErrors } from "@/components/auth/use-field-errors";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { googleStartAction, signUpAction } from "@/lib/auth/actions";
import { emailSchema, nameSchema, passwordProblem, PASSWORD_MIN } from "@/lib/auth/validation";

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const form = useAuthForm<Awaited<ReturnType<typeof signUpAction>>>();
  const v = useFieldErrors(
    { name, email, password },
    {
      name: (x) => {
        const r = nameSchema.safeParse(x);
        return r.success ? null : r.error.issues[0].message;
      },
      email: (x) => (emailSchema.safeParse(x).success ? null : x.trim() ? "Adresse e-mail invalide." : "Indique ton adresse e-mail."),
      password: (x) => passwordProblem(x, email),
    },
  );

  useEffect(() => {
    if (done) document.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [done]);

  if (done) return <CheckInbox email={done} onChangeEmail={() => setDone(null)} />;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const invalid = v.check();
    if (invalid) return focusField(formRef.current, invalid);
    const r = await form.submit(() => signUpAction({ name, email, password }));
    if (r?.ok) {
      setPassword("");
      setDone(r.email);
    } else if (r?.fieldErrors) {
      const first = Object.keys(r.fieldErrors)[0];
      if (first) focusField(formRef.current, first);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="type-h2">Créer un compte</h1>
        <p className="mt-1 type-body-l text-fg-secondary">Ouvre ton espace vendeur YA YO! : commandes, catalogue et revenus au même endroit.</p>
      </div>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {form.error && form.error.code !== "invalid" && <FormAlert title="Inscription impossible">{form.error.message}</FormAlert>}
        <Field label="Nom complet" error={form.serverFields.name || v.visible("name")}>
          {(id) => <Input id={id} name="name" autoComplete="name" icon={<User />} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} onBlur={v.onBlur("name")} disabled={form.pending} placeholder="Grâce Mbala" />}
        </Field>
        <Field label="Adresse e-mail" hint="Tu recevras un lien pour la confirmer." error={form.serverFields.email || v.visible("email")}>
          {(id) => (
            <Input id={id} name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} icon={<Mail />} value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} onBlur={v.onBlur("email")} disabled={form.pending} placeholder="toi@exemple.com" />
          )}
        </Field>
        <Field label="Mot de passe" hint={`${PASSWORD_MIN} caractères minimum. Une phrase de quelques mots est plus sûre et plus facile à retenir.`} error={form.serverFields.password || v.visible("password")}>
          {(id) => <PasswordInput id={id} name="password" autoComplete="new-password" value={password} maxLength={512} onChange={(e) => setPassword(e.target.value)} onBlur={v.onBlur("password")} disabled={form.pending} />}
        </Field>
        <Button type="submit" size="lg" block loading={form.pending}>
          Créer mon compte
        </Button>
      </form>
      <OrDivider />
      <GoogleButton
        label="S’inscrire avec Google"
        onStart={async () => {
          const r = await googleStartAction({});
          if (r && !r.ok) {
            form.setError({ message: r.error, code: r.code });
            return r.error;
          }
          return null;
        }}
        disabled={form.pending || !googleEnabled}
      />
      {!googleEnabled && <p className="-mt-3 text-center type-body-s text-fg-tertiary">L’inscription avec Google sera disponible prochainement.</p>}
      <p className="text-center type-body-m text-fg-secondary">
        Déjà un compte ?{" "}
        <Link href="/connexion" className={authLink}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}
