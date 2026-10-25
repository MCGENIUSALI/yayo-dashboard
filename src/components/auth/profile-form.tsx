"use client";

import { useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { updateNameAction } from "@/lib/auth/actions";
import { nameSchema } from "@/lib/auth/validation";

export function ProfileForm({ name: initial }: { name: string }) {
  const [name, setName] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const form = useAuthForm<Awaited<ReturnType<typeof updateNameAction>>>();
  const toast = useToast();
  const check = nameSchema.safeParse(name);
  const dirty = name.trim() !== saved;
  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!check.success || !dirty) return;
        const r = await form.submit(() => updateNameAction(name));
        if (r?.ok) {
          setSaved(r.name);
          setName(r.name);
          toast({ tone: "success", title: "Nom enregistré" });
        }
      }}
    >
      {form.error && form.error.code !== "invalid" && <FormAlert title="Enregistrement impossible">{form.error.message}</FormAlert>}
      <Field label="Nom complet" hint="Affiché dans ton espace et sur tes échanges avec l’équipe YA YO!." error={form.serverFields.name || (dirty && !check.success ? check.error.issues[0].message : undefined)}>
        {(id) => <Input id={id} name="name" autoComplete="name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} disabled={form.pending} />}
      </Field>
      <div>
        <Button type="submit" loading={form.pending} disabled={!dirty || !check.success}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
