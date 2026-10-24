"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { ActionError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Switch } from "@/components/ui/form";
import { MoneyRow } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { saveCommissionSettings } from "@/lib/actions";
import { formatFC } from "@/lib/format";

interface Settings {
  defaultRate: number;
  categories: { name: string; rate: number }[];
  deliveryFee: number;
  courierPay: string;
  releaseDelayHours: number;
  allowCash: boolean;
}

const EXAMPLE = 285_000;
const num = (v: string) => Number(v.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

/** AD5 · Commissions et frais, with a live net-vendeur example. */
export function CommissionForm({ initial }: { initial: Settings }) {
  const toast = useToast();
  // `base`: last saved values, so Annuler goes back to them and the form knows when it is dirty.
  const [base, setBase] = useState(initial);
  const [s, setS] = useState(initial);
  const dirty = JSON.stringify(s) !== JSON.stringify(base);
  const save = useAsyncAction(
    async () => {
      const saved = await saveCommissionSettings(s);
      setBase(saved);
      toast({ tone: "success", title: "Paramètres enregistrés", description: "Ils s’appliquent aux nouvelles commandes." });
    },
    { resetAfter: 2000 },
  );
  useUnsavedChanges(dirty);
  const rateError = (v: number) => (v < 0 || v > 50 ? "Taux entre 0 et 50 %." : undefined);
  const invalid = [s.defaultRate, ...s.categories.map((c) => c.rate)].some((v) => rateError(v)) || s.releaseDelayHours < 1;
  const commission = Math.round((EXAMPLE * s.defaultRate) / 100);
  const delivery = Math.round(EXAMPLE * 0.05);

  const set = (patch: Partial<Settings>) => setS((x) => ({ ...x, ...patch }));

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!invalid && dirty) save.run();
      }}
    >
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader title="Commission vendeur" />
          <div className="flex flex-col gap-4 p-4 md:p-5">
            <Field label="Taux par défaut (%)" hint="Prélevé sur le vendeur, jamais facturé à l’acheteur." error={rateError(s.defaultRate)}>
              {(id) => <Input id={id} inputMode="decimal" value={s.defaultRate} onChange={(e) => set({ defaultRate: num(e.target.value) })} />}
            </Field>
            {s.categories.map((c, i) => (
              <Field key={c.name} label={`${c.name} (%)`} error={rateError(c.rate)}>
                {(id) => <Input id={id} inputMode="decimal" value={c.rate} onChange={(e) => set({ categories: s.categories.map((x, j) => (j === i ? { ...x, rate: num(e.target.value) } : x)) })} />}
              </Field>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Livraison et séquestre" />
          <div className="flex flex-col gap-4 p-4 md:p-5">
            <Field label="Frais de livraison par colis (Kinshasa, FC)" hint="Payés par l’acheteur, déduits du net vendeur.">
              {(id) => <Input id={id} inputMode="numeric" value={s.deliveryFee} onChange={(e) => set({ deliveryFee: num(e.target.value) })} />}
            </Field>
            <Field label="Rémunération livreur par course">{(id) => <Input id={id} value={s.courierPay} onChange={(e) => set({ courierPay: e.target.value })} />}</Field>
            <Field label="Délai de libération après livraison (heures)" error={s.releaseDelayHours < 1 ? "Au moins 1 heure après la livraison." : undefined}>
              {(id) => <Input id={id} inputMode="numeric" value={s.releaseDelayHours} onChange={(e) => set({ releaseDelayHours: num(e.target.value) })} />}
            </Field>
            <div className="flex items-center justify-between gap-3">
              <span className="type-label-m">Autoriser le paiement à la livraison (cash)</span>
              <Switch label="Paiement à la livraison" checked={s.allowCash} onChange={(v) => set({ allowCash: v })} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-5">
        <h2 className="type-h4">Exemple de calcul · commande de {formatFC(EXAMPLE)}</h2>
        <div className="mt-2">
          <MoneyRow label="Montant de la commande" value={formatFC(EXAMPLE)} />
          <MoneyRow label={`Commission (${s.defaultRate.toLocaleString("fr-FR")} %)`} value={`− ${formatFC(commission)}`} tone="success" />
          <MoneyRow label="Frais de livraison" value={`− ${formatFC(delivery)}`} tone="success" />
          <div className="mt-1 border-t border-line-subtle">
            <MoneyRow label="Net vendeur" value={formatFC(EXAMPLE - commission - delivery)} strong />
          </div>
        </div>
      </Card>

      <ActionError error={save.error} onRetry={() => save.run()} />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled={!dirty || save.pending} onClick={() => setS(base)}>
          Annuler les modifications
        </Button>
        <Button type="submit" loading={save.pending} disabled={invalid || (!dirty && save.status !== "success")} icon={save.status === "success" && !dirty ? <Check className="size-4" /> : undefined}>
          {save.status === "success" && !dirty ? "Enregistré" : "Enregistrer les paramètres"}
        </Button>
        {dirty && !save.pending && <span className="animate-fade-in type-body-s text-fg-tertiary">Modifications non enregistrées</span>}
      </div>
    </form>
  );
}
