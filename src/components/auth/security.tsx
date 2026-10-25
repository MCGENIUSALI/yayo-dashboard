"use client";

import { Laptop, LogOut, Smartphone } from "lucide-react";
import { useRef, useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { focusField, useFieldErrors } from "@/components/auth/use-field-errors";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { changePasswordAction, googleLinkAction, requestResetAction, revokeSessionAction, signOutEverywhereAction, unlinkGoogleAction } from "@/lib/auth/actions";
import { passwordProblem, PASSWORD_MIN } from "@/lib/auth/validation";

export function ChangePasswordForm({ email, hasPassword }: { email: string; hasPassword: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const form = useAuthForm<Awaited<ReturnType<typeof changePasswordAction>>>();
  const reset = useAuthForm<Awaited<ReturnType<typeof requestResetAction>>>();
  const [linkSent, setLinkSent] = useState(false);
  const toast = useToast();
  const v = useFieldErrors({ current, next }, { current: (x) => (x ? null : "Indique ton mot de passe actuel."), next: (x) => passwordProblem(x, email) });

  if (!hasPassword)
    return (
      <div className="flex flex-col gap-3">
        <p className="type-body-m text-fg-secondary">Tu te connectes uniquement avec Google. Pour ajouter un mot de passe, nous t’envoyons un lien sur {email} : cela prouve que l’adresse est bien à toi.</p>
        {reset.error && <FormAlert title="Envoi impossible">{reset.error.message}</FormAlert>}
        {linkSent ? (
          <FormAlert tone="success" title="Lien envoyé">Ouvre l’e-mail reçu pour choisir ton mot de passe (lien valable 30 minutes).</FormAlert>
        ) : (
          <div>
            <Button variant="outline" loading={reset.pending} onClick={async () => (await reset.submit(() => requestResetAction(email)))?.ok && setLinkSent(true)}>
              Recevoir un lien pour créer un mot de passe
            </Button>
          </div>
        )}
      </div>
    );

  return (
    <form
      ref={formRef}
      noValidate
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const invalid = v.check();
        if (invalid) return focusField(formRef.current, invalid);
        const r = await form.submit(() => changePasswordAction({ current, next }));
        if (r?.ok) {
          setCurrent("");
          setNext("");
          formRef.current?.reset();
          toast({ tone: "success", title: "Mot de passe modifié", description: "Tes autres appareils ont été déconnectés." });
        } else if (r?.fieldErrors) focusField(formRef.current, Object.keys(r.fieldErrors)[0] ?? "current");
      }}
    >
      {form.error && form.error.code !== "invalid" && <FormAlert title="Modification impossible">{form.error.message}</FormAlert>}
      <Field label="Mot de passe actuel" error={form.serverFields.current || v.visible("current")}>
        {(id) => <PasswordInput id={id} name="current" autoComplete="current-password" value={current} maxLength={512} onChange={(e) => setCurrent(e.target.value)} onBlur={v.onBlur("current")} disabled={form.pending} />}
      </Field>
      <Field label="Nouveau mot de passe" hint={`${PASSWORD_MIN} caractères minimum. Tes autres appareils seront déconnectés.`} error={form.serverFields.next || v.visible("next")}>
        {(id) => <PasswordInput id={id} name="next" autoComplete="new-password" value={next} maxLength={512} onChange={(e) => setNext(e.target.value)} onBlur={v.onBlur("next")} disabled={form.pending} />}
      </Field>
      <div>
        <Button type="submit" loading={form.pending}>
          Modifier le mot de passe
        </Button>
      </div>
    </form>
  );
}

export function GoogleLink({ linked, hasPassword, googleEnabled }: { linked: { email: string | null; linkedAt: string } | null; hasPassword: boolean; googleEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const link = useAuthForm<Awaited<ReturnType<typeof googleLinkAction>>>();
  const unlink = useAuthForm<Awaited<ReturnType<typeof unlinkGoogleAction>>>();
  const toast = useToast();

  if (linked)
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success">Associé</Badge>
          <span className="type-body-m text-fg-secondary break-all">{linked.email ?? "Compte Google"} · depuis le {linked.linkedAt}</span>
        </div>
        {unlink.error && <FormAlert title="Dissociation impossible">{unlink.error.message}</FormAlert>}
        <div>
          <Button
            variant="outline"
            loading={unlink.pending}
            disabled={!hasPassword}
            onClick={async () => {
              const r = await unlink.submit(() => unlinkGoogleAction());
              if (r?.ok) toast({ tone: "success", title: "Google dissocié" });
            }}
          >
            Dissocier Google
          </Button>
          {!hasPassword && <p className="mt-2 type-body-s text-fg-tertiary">Ajoute d’abord un mot de passe : Google est ton seul moyen de connexion.</p>}
        </div>
      </div>
    );

  const start = async () => {
    const r = await link.submit(() => googleLinkAction({ password }));
    return r && !r.ok ? r.error : null;
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="type-body-m text-fg-secondary">Connecte-toi en un clic avec ton compte Google. Nous ne recevons jamais ton mot de passe Google.</p>
      {!googleEnabled ? (
        <p className="type-body-s text-fg-tertiary">La connexion avec Google sera disponible prochainement.</p>
      ) : hasPassword ? (
        <div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Associer un compte Google
          </Button>
        </div>
      ) : null}
      <Sheet
        open={open}
        onClose={() => {
          setOpen(false);
          setPassword("");
        }}
        busy={link.pending}
        title="Confirme ton identité"
      >
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await start();
          }}
        >
          <p className="type-body-m text-fg-secondary">Pour associer Google à ton compte, saisis ton mot de passe YA YO!. Tu seras ensuite redirigé vers Google.</p>
          {link.error && link.error.code !== "invalid" && <FormAlert title="Association impossible">{link.error.message}</FormAlert>}
          <Field label="Mot de passe" error={link.serverFields.password || undefined}>
            {(id) => <PasswordInput id={id} name="password" autoComplete="current-password" value={password} maxLength={512} onChange={(e) => setPassword(e.target.value)} disabled={link.pending} autoFocus />}
          </Field>
          <GoogleButton label="Continuer avec Google" onStart={start} disabled={!password} />
        </form>
      </Sheet>
    </div>
  );
}

export interface SessionView {
  publicId: string;
  device: string;
  mobile: boolean;
  createdAt: string;
  lastSeenAt: string;
  method: string;
  persistent: boolean;
  current: boolean;
}

export function SessionList({ sessions }: { sessions: SessionView[] }) {
  const revoke = useAuthForm<Awaited<ReturnType<typeof revokeSessionAction>>>();
  const all = useAuthForm<Awaited<ReturnType<typeof signOutEverywhereAction>>>();
  const [target, setTarget] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const toast = useToast();
  return (
    <div className="flex flex-col gap-4">
      {revoke.error && <FormAlert title="Déconnexion impossible">{revoke.error.message}</FormAlert>}
      <ul className="divide-y divide-line-subtle rounded-lg border border-line-subtle" aria-label="Sessions actives">
        {sessions.map((s) => (
          <li key={s.publicId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken [&_svg]:size-5">{s.mobile ? <Smartphone /> : <Laptop />}</span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 type-label-m">
                {s.device}
                {s.current && <Badge tone="accent">Cet appareil</Badge>}
              </p>
              <p className="type-body-s text-fg-tertiary">
                {s.method} · {s.persistent ? "session mémorisée" : "session standard"} · ouverte le {s.createdAt} · active le {s.lastSeenAt}
              </p>
            </div>
            <Button
              size="sm"
              variant={s.current ? "outline" : "secondary"}
              loading={revoke.pending && target === s.publicId}
              disabled={revoke.pending && target !== s.publicId}
              aria-label={s.current ? "Déconnecter cet appareil" : `Déconnecter ${s.device}`}
              onClick={async () => {
                setTarget(s.publicId);
                const r = await revoke.submit(() => revokeSessionAction(s.publicId));
                if (r?.ok) toast({ tone: "success", title: "Appareil déconnecté" });
              }}
            >
              Déconnecter
            </Button>
          </li>
        ))}
      </ul>
      <div>
        <Button variant="danger" icon={<LogOut className="size-4.5" />} onClick={() => setConfirmAll(true)}>
          Se déconnecter de tous les appareils
        </Button>
      </div>
      <Sheet
        open={confirmAll}
        onClose={() => setConfirmAll(false)}
        busy={all.pending}
        title="Se déconnecter partout ?"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmAll(false)} disabled={all.pending}>
              Annuler
            </Button>
            <Button variant="danger" loading={all.pending} onClick={() => all.submit(() => signOutEverywhereAction())}>
              Tout déconnecter
            </Button>
          </div>
        }
      >
        <p className="type-body-m text-fg-secondary">Toutes les sessions seront fermées, y compris celle-ci. Tu devras te reconnecter sur chaque appareil.</p>
        {all.error && <FormAlert className="mt-4" title="Déconnexion impossible">{all.error.message}</FormAlert>}
      </Sheet>
    </div>
  );
}
