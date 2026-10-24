"use client";

import { Package, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MasterDetail } from "@/components/admin/master-detail";
import { Overline } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { EmptyState, MoneyRow } from "@/components/ui/misc";
import { Chips } from "@/components/ui/segmented";
import { DeliveryBadge, PaymentBadge } from "@/components/ui/status";
import { Timeline, type StepState } from "@/components/ui/timeline";
import { formatFC } from "@/lib/format";
import { orderBreakdown, orderTotal } from "@/lib/orders";
import type { Order, PaymentStatus } from "@/lib/types";

type Filter = "all" | "escrow" | "delivery" | "disputes" | "failed";
const filters: Record<Filter, PaymentStatus[] | null> = {
  all: null,
  escrow: ["held", "pending", "initiated"],
  delivery: ["in_delivery", "delivered"],
  disputes: ["disputed"],
  failed: ["failed", "refunded"],
};

const flow: PaymentStatus[] = ["initiated", "pending", "held", "in_delivery", "delivered", "released"];
function state(current: PaymentStatus, step: PaymentStatus): StepState {
  const c = flow.indexOf(current);
  const s = flow.indexOf(step);
  if (c === -1) return s <= 2 ? "done" : "upcoming";
  return s < c ? "done" : s === c ? "current" : "upcoming";
}

function OrderDetail({ o }: { o: Order }) {
  const b = orderBreakdown(o);
  return (
    <div className="flex flex-col gap-5">
      <div className="hidden lg:block">
        <p className="type-h4">#{o.id}</p>
        <p className="type-body-s text-fg-tertiary">
          {o.buyer} → {o.seller} · {o.method}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <PaymentBadge status={o.payment} />
        {o.delivery && <DeliveryBadge status={o.delivery} />}
      </div>
      <div>
        <Overline className="mb-3">Paiement synchronisé avec la livraison</Overline>
        <Timeline
          steps={[
            { title: "Paiement reçu", detail: o.method, state: state(o.payment, "pending") },
            { title: "Fonds sécurisés", detail: "Séquestre YA YO", state: state(o.payment, "held") },
            { title: "En livraison", detail: o.courier ?? "Livreur à assigner", state: state(o.payment, "in_delivery") },
            { title: "Livrée", detail: "Code de réception validé", state: state(o.payment, "delivered") },
            { title: "Libéré au vendeur", detail: "48 h après livraison", state: state(o.payment, "released") },
          ]}
        />
      </div>
      <div>
        <Overline className="mb-1">Répartition</Overline>
        <MoneyRow label="Montant payé" value={formatFC(b.subtotal)} />
        <MoneyRow label={`Commission (${Math.round(o.commissionRate * 100)} %)`} value={formatFC(b.commission)} tone="success" />
        <MoneyRow label="Frais de livraison" value={formatFC(b.deliveryFee)} />
        <MoneyRow label="Net vendeur" value={formatFC(b.net)} />
      </div>
    </div>
  );
}

export function OrdersAdmin({ orders, initialId }: { orders: Order[]; initialId?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const f = filters[filter];
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => (!f || f.includes(o.payment)) && (!needle || [o.id, o.buyer, o.seller].some((v) => v.toLowerCase().includes(needle))));
  }, [orders, filter, q]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Chips
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "Toutes", count: orders.length },
            { value: "escrow", label: "En séquestre" },
            { value: "delivery", label: "Livraison" },
            { value: "disputes", label: "Litiges" },
            { value: "failed", label: "Échecs et remboursements" },
          ]}
        />
        <div className="md:w-72">
          <Input icon={<Search />} type="search" placeholder="N°, acheteur, vendeur" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher une commande" />
        </div>
      </div>
      <MasterDetail
        empty={<EmptyState icon={<Package />} title="Aucune commande trouvée">Modifie le filtre ou la recherche.</EmptyState>}
        rows={list}
        rowKey={(o) => o.id}
        initialKey={initialId}
        title={(o) => `#${o.id}`}
        detailTitle={(o) => `Commande #${o.id}`}
        actionLabel="Voir"
        columns={[
          { key: "id", header: "Commande", cell: (o) => <span className="type-label-m whitespace-nowrap">#{o.id}</span>, hideOnMobile: true },
          { key: "buyer", header: "Acheteur", cell: (o) => o.buyer },
          { key: "seller", header: "Vendeur", cell: (o) => o.seller },
          { key: "amount", header: "Montant", cell: (o) => <span className="tabular-nums whitespace-nowrap">{formatFC(orderTotal(o))}</span> },
          { key: "payment", header: "Paiement", cell: (o) => <PaymentBadge status={o.payment} /> },
        ]}
        renderDetail={(o) => <OrderDetail o={o} />}
      />
    </div>
  );
}
