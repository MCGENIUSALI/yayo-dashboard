"use client";

import { useRef, useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { useStripToken } from "@/components/auth/strip-token";
import { TokenProblem } from "@/components/auth/token-problem";
import { focusField, useFieldErrors } from "@/components/auth/use-field-errors";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { resetPasswordAction } from "@/lib/auth/actions";
import { passwordProblem, PASSWORD_MIN } from "@/lib/auth/validation";

type Status = "expired" | "used" | "invalid";

export function ResetForm({ token }: { token: string }) {
  useStripToken();
  const formRef = useRef<HTMLFormElement>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dead, setDead] = useState<{ status: Status; message: string } | null>(null);
  const form = useAuthForm<Awaited<ReturnType<typeof resetPasswordAction>>>();
  const v = useFieldErrors({ password, confirm }, { password: (x) => passwordProblem(x), confirm: (x) => (x === password ? null : "Les deux mots de passe ne correspondent pas.") });

  if (dead)
    return (
      <TokenProblem status={dead.status} message={dead.message}>
        <ButtonLink href="/mot-de-passe-oublie">Demander un nouveau lien</ButtonLink>
      </TokenProblem>
    );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="type-h2">Nouveau mot de passe</h1>
        <p className="mt-1 type-body-l text-fg-secondary">Choisis un mot de passe que tu n’utilises nulle part ailleurs. Tous tes appareils seront déconnectés.</p>
      </div>
      <form
        ref={formRef}
        noValidate
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const invalid = v.check();
          if (invalid) return focusField(formRef.current, invalid);
          const r = await form.submit(() => resetPasswordAction({ token, password }));
          if (r && !r.ok) {
            if (r.code === "expired" || r.code === "used" || (r.code === "invalid" && !r.fieldErrors)) setDead({ status: r.code as Status, message: r.error });
            else if (r.fieldErrors?.password) focusField(formRef.current, "password");
          }
        }}
      >
        {form.error && form.error.code !== "invalid" && <FormAlert title="Modification impossible">{form.error.message}</FormAlert>}
        <Field label="Nouveau mot de passe" hint={`${PASSWORD_MIN} caractères minimum.`} error={form.serverFields.password || v.visible("password")}>
          {(id) => <PasswordInput id={id} name="password" autoComplete="new-password" value={password} maxLength={512} onChange={(e) => setPassword(e.target.value)} onBlur={v.onBlur("password")} disabled={form.pending} />}
        </Field>
        <Field label="Confirme le mot de passe" error={v.visible("confirm")}>
          {(id) => <PasswordInput id={id} name="confirm" autoComplete="new-password" value={confirm} maxLength={512} onChange={(e) => setConfirm(e.target.value)} onBlur={v.onBlur("confirm")} disabled={form.pending} />}
        </Field>
        <Button type="submit" size="lg" block loading={form.pending}>
          Enregistrer le mot de passe
        </Button>
      </form>
    </div>
  );
}
