"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { ProductThumb } from "@/components/ui/media";
import { EmptyState } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import { PaymentBadge } from "@/components/ui/status";
import { Package } from "lucide-react";
import { formatFC } from "@/lib/format";
import type { BuyerOrder, BuyerOrderTab } from "@/lib/types";

type Row = BuyerOrder & { shopName: string; products: { id: string; short: string; swatch: string; name: string }[]; total: number; items: number };

export function OrdersTabs({ orders }: { orders: Row[] }) {
  const [tab, setTab] = useState<BuyerOrderTab>("ongoing");
  const shown = orders.filter((o) => o.tab === tab);
  return (
    <div className="flex flex-col gap-4 p-5">
      <Segmented
        value={tab}
        onChange={setTab}
        items={[
          { value: "ongoing", label: "En cours" },
          { value: "delivered", label: "Livrées" },
          { value: "dispute", label: "Litiges" },
        ]}
      />
      {shown.length === 0 && (
        <EmptyState icon={<Package />} title="Rien ici pour l’instant">
          Tes commandes apparaîtront ici.
        </EmptyState>
      )}
      <ul className="flex flex-col gap-4" role="tabpanel">
        {shown.map((o) => {
          const action =
            o.tab === "dispute"
              ? { href: `/acheteur/litiges/${o.disputeId}`, label: "Voir le litige" }
              : o.tab === "delivered"
                ? o.rated
                  ? { href: `/acheteur/commandes/${o.id}`, label: "Détails" }
                  : { href: `/acheteur/commandes/${o.id}/avis`, label: "Noter" }
                : { href: `/acheteur/commandes/${o.id}`, label: "Suivre la commande" };
          return (
            <li key={o.id} className="flex flex-col gap-3 rounded-xl bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="type-label-l">Commande #{o.id}</p>
                  <p className="truncate type-body-s text-fg-tertiary">
                    {o.placedAt} · {o.items} article{o.items > 1 ? "s" : ""} · {o.shopName}
                  </p>
                </div>
                <PaymentBadge status={o.payment} />
              </div>
              <div className="flex items-center gap-2">
                {o.products.map((p) => (
                  <ProductThumb key={p.id} swatch={p.swatch} name={p.name} className="size-12" />
                ))}
                <p className="min-w-0 flex-1 truncate pl-1 type-body-m text-fg-secondary">{o.products.map((p) => p.short.split(" –")[0]).join(", ")}</p>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="type-body-s text-fg-tertiary">Total</p>
                  <p className="type-price-m">{formatFC(o.total)}</p>
                </div>
                <Link href={action.href} className={buttonClass({ size: "md" })}>
                  {action.label}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
