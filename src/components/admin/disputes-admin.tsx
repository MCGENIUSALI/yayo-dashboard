"use client";

import { useState } from "react";
import { MasterDetail } from "@/components/admin/master-detail";
import { Alert } from "@/components/ui/alert";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/card";
import { ProductThumb } from "@/components/ui/media";
import { PaymentBadge } from "@/components/ui/status";
import { Timeline } from "@/components/ui/timeline";
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

function DisputeDetail({ d, decided, onDecide }: { d: Dispute; decided?: Decision; onDecide: (x: Decision) => void }) {
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
          <Alert tone="success" title="Décision enregistrée">
            {decisionText[decided]}
          </Alert>
        ) : (
          <>
            <Button size="lg" block onClick={() => onDecide("refund")}>
              Rembourser l’acheteur ({formatFC(d.amount)})
            </Button>
            <Button size="lg" variant="outline" block onClick={() => onDecide("exchange")}>
              Échange : retour au vendeur
            </Button>
            <Button size="lg" variant="ghost" block onClick={() => onDecide("reject")}>
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
