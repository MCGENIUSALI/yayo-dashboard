"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { authLink } from "@/components/auth/link-style";
import { useRef, useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { focusField, useFieldErrors } from "@/components/auth/use-field-errors";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { googleStartAction, signInAction } from "@/lib/auth/actions";
import { emailSchema } from "@/lib/auth/validation";

export function SignInForm({ next, googleEnabled, initialEmail = "" }: { next?: string; googleEnabled: boolean; initialEmail?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const form = useAuthForm<Awaited<ReturnType<typeof signInAction>>>();
  const v = useFieldErrors(
    { email, password },
    {
      email: (x) => (emailSchema.safeParse(x).success ? null : x.trim() ? "Adresse e-mail invalide." : "Indique ton adresse e-mail."),
      password: (x) => (x ? null : "Indique ton mot de passe."),
    },
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const invalid = v.check();
    if (invalid) return focusField(formRef.current, invalid);
    const result = await form.submit(() => signInAction({ email, password, remember, next }));
    // The password is cleared after a refusal; the e-mail is kept.
    if (result && !result.ok) {
      setPassword("");
      v.reset();
      focusField(formRef.current, result.fieldErrors?.email ? "email" : "password");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-4" aria-describedby={form.error ? "signin-error" : undefined}>
        {form.error && (
          <div id="signin-error">
            <FormAlert title={form.error.code === "rate_limited" ? "Connexion temporairement bloquée" : form.error.code === "unverified" ? "Adresse e-mail à confirmer" : "Connexion impossible"} tone={form.error.code === "unverified" ? "warning" : "danger"}>
              {form.error.message}
            </FormAlert>
          </div>
        )}
        <Field label="Adresse e-mail" error={form.serverFields.email || v.visible("email")}>
          {(id) => (
            <Input id={id} name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} icon={<Mail />} value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} onBlur={v.onBlur("email")} disabled={form.pending} placeholder="toi@exemple.com" />
          )}
        </Field>
        <Field
          label="Mot de passe"
          error={form.serverFields.password || v.visible("password")}
        >
          {(id) => <PasswordInput id={id} name="password" autoComplete="current-password" value={password} maxLength={512} onChange={(e) => setPassword(e.target.value)} onBlur={v.onBlur("password")} disabled={form.pending} />}
        </Field>
        <div className="-mt-1 flex justify-end">
          <Link href={email ? `/mot-de-passe-oublie?email=${encodeURIComponent(email)}` : "/mot-de-passe-oublie"} className={authLink}>
            Mot de passe oublié ?
          </Link>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-md">
          <input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={form.pending} aria-describedby="remember-hint" className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--bg-brand)]" />
          <span>
            <span className="type-label-m">Se souvenir de moi</span>
            <span id="remember-hint" className="block type-body-s text-fg-tertiary">
              Reste connecté jusqu’à 30 jours sur cet appareil. Sinon, la session se ferme avec le navigateur ou après 12 h d’inactivité (2 h pour les administrateurs).
            </span>
          </span>
        </label>
        <Button type="submit" size="lg" block loading={form.pending}>
          Se connecter
        </Button>
      </form>
      <OrDivider />
      <GoogleButton
        onStart={async () => {
          const r = await googleStartAction({ next, remember });
          if (r && !r.ok) {
            form.setError({ message: r.error, code: r.code });
            return r.error;
          }
          return null;
        }}
        disabled={form.pending || !googleEnabled}
      />
      {!googleEnabled && <p className="-mt-3 text-center type-body-s text-fg-tertiary">La connexion avec Google sera disponible prochainement.</p>}
      <p className="text-center type-body-m text-fg-secondary">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className={authLink}>
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
