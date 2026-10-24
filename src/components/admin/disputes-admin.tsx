"use client";

import { useState } from "react";
import { MasterDetail } from "@/components/admin/master-detail";
import { ActionError, Alert } from "@/components/ui/alert";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/card";
import { ProductThumb } from "@/components/ui/media";
import { PaymentBadge } from "@/components/ui/status";
import { Timeline } from "@/components/ui/timeline";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { decideDispute } from "@/lib/actions";
import { formatFC } from "@/lib/format";
import type { Dispute, DisputeReason } from "@/lib/types";

const reasons: Record<DisputeReason, { label: string; tone: Tone }> = {
  non_conforme: { label: "Non conforme", tone: "warning" },
  non_recu: { label: "Non reçu", tone: "danger" },
  article_manquant: { label: "Article manquant", tone: "info" },
  endommage: { label: "Endommagé", tone: "danger" },
};

type Decision = "refund" | "exchange" | "reject";
const decisionText: Record<Decision, string> = {
  refund: "Acheteur remboursé, fonds débloqués vers l’acheteur.",
  exchange: "Échange lancé : retour au vendeur, fonds toujours bloqués.",
  reject: "Litige rejeté : paiement libéré au vendeur.",
};

const decisionLabel: Record<Decision, string> = {
  refund: "Rembourser l’acheteur",
  exchange: "Lancer un échange",
  reject: "Rejeter et payer le vendeur",
};

/** Money moves on every decision: each one goes through an explicit confirmation step. */
function DisputeDetail({ d, decided, onDecide }: { d: Dispute; decided?: Decision; onDecide: (x: Decision) => void }) {
  const toast = useToast();
  const [confirming, setConfirming] = useState<Decision | null>(null);
  const decide = useAsyncAction(async (x: Decision) => {
    await decideDispute(d.id, x);
    onDecide(x);
    setConfirming(null);
    toast({ tone: "success", title: "Décision enregistrée", description: `Litige #${d.id}` });
  });
  return (
    <div className="flex flex-col gap-5">
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <p className="type-h4">
          #{d.id} · #{d.orderId}
        </p>
        <PaymentBadge status="disputed" />
      </div>
      <p className="type-body-m text-fg-secondary">« {d.quote} »</p>
      <ProductThumb swatch="slate" name="Photo jointe par l’acheteur" className="size-24" />
      <Timeline
        steps={[
          { title: `Livrée par ${d.courier}`, detail: "Code de réception validé", state: "done" },
          { title: "Signalement acheteur", detail: `Il y a ${d.openedAgo} · photo jointe`, state: "done" },
          { title: "Réponse du vendeur", detail: `Attendue avant ${d.deadline}`, state: "current" },
        ]}
      />
      <div className="flex flex-col gap-2">
        <Overline>Décision</Overline>
        {decided ? (
          <Alert className="animate-fade-in" tone="success" title="Décision enregistrée">
            {decisionText[decided]}
          </Alert>
        ) : confirming ? (
          <div className="flex animate-page-in flex-col gap-3 rounded-lg border border-line p-4">
            <p className="type-label-l">{decisionLabel[confirming]} ?</p>
            <p className="type-body-m text-fg-secondary">{decisionText[confirming]} Cette décision est définitive.</p>
            <ActionError error={decide.error} />
            <div className="flex gap-2">
              <Button variant="outline" block disabled={decide.pending} onClick={() => setConfirming(null)}>
                Annuler
              </Button>
              <Button variant={confirming === "refund" ? "danger" : "primary"} block loading={decide.pending} onClick={() => decide.run(confirming)}>
                {decide.error ? "Réessayer" : "Confirmer"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button size="lg" block onClick={() => setConfirming("refund")}>
              Rembourser l’acheteur ({formatFC(d.amount)})
            </Button>
            <Button size="lg" variant="outline" block onClick={() => setConfirming("exchange")}>
              Échange : retour au vendeur
            </Button>
            <Button size="lg" variant="ghost" block onClick={() => setConfirming("reject")}>
              Rejeter et payer le vendeur
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function DisputesAdmin({ disputes }: { disputes: Dispute[] }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  return (
    <MasterDetail
      rows={disputes}
      rowKey={(d) => d.id}
      title={(d) => `#${d.id}`}
      detailTitle={(d) => `#${d.id} · #${d.orderId}`}
      columns={[
        { key: "id", header: "Litige", cell: (d) => <span className="type-label-m whitespace-nowrap">#{d.id}</span>, hideOnMobile: true },
        { key: "buyer", header: "Acheteur", cell: (d) => d.buyer },
        { key: "seller", header: "Vendeur", cell: (d) => d.seller },
        { key: "amount", header: "Montant bloqué", cell: (d) => <span className="tabular-nums whitespace-nowrap">{formatFC(d.amount)}</span> },
        { key: "reason", header: "Motif", cell: (d) => (decisions[d.id] ? <Badge tone="success">Tranché</Badge> : <Badge tone={reasons[d.reason].tone}>{reasons[d.reason].label}</Badge>) },
        { key: "opened", header: "Ouvert", cell: (d) => d.openedAgo },
      ]}
      renderDetail={(d) => <DisputeDetail d={d} decided={decisions[d.id]} onDecide={(x) => setDecisions((s) => ({ ...s, [d.id]: x }))} />}
    />
  );
}
