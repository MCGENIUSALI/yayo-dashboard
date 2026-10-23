"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Switch } from "@/components/ui/form";
import { MoneyRow } from "@/components/ui/misc";
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
  const [s, setS] = useState(initial);
  const [saved, setSaved] = useState(false);
  const commission = Math.round((EXAMPLE * s.defaultRate) / 100);
  const delivery = Math.round(EXAMPLE * 0.05);

  const set = (patch: Partial<Settings>) => {
    setSaved(false);
    setS((x) => ({ ...x, ...patch }));
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader title="Commission vendeur" />
          <div className="flex flex-col gap-4 p-4 md:p-5">
            <Field label="Taux par défaut (%)" hint="Prélevé sur le vendeur, jamais facturé à l’acheteur.">
              {(id) => <Input id={id} inputMode="decimal" value={s.defaultRate} onChange={(e) => set({ defaultRate: num(e.target.value) })} />}
            </Field>
            {s.categories.map((c, i) => (
              <Field key={c.name} label={`${c.name} (%)`}>
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
            <Field label="Délai de libération après livraison (heures)">
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

      {saved && <Alert tone="success" title="Paramètres enregistrés">Ils s’appliquent aux nouvelles commandes.</Alert>}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => { setS(initial); setSaved(false); }}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer les paramètres</Button>
      </div>
    </form>
  );
}
