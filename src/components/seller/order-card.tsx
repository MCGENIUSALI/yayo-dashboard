import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PaymentBadge, SellerOrderBadge } from "@/components/ui/status";
import { formatFC } from "@/lib/format";
import { orderBreakdown } from "@/lib/orders";
import type { Order } from "@/lib/types";

const cta: Record<Order["sellerStatus"], { label: string; href: (id: string) => string; variant: "primary" | "outline" }> = {
  new: { label: "Préparer la commande", href: (id) => `/vendeur/commandes/${id}`, variant: "primary" },
  preparing: { label: "Marquer prête pour collecte", href: (id) => `/vendeur/commandes/${id}`, variant: "primary" },
  ready: { label: "Remettre au livreur", href: (id) => `/vendeur/commandes/${id}/remise`, variant: "primary" },
  handed_over: { label: "Voir la mission", href: (id) => `/vendeur/commandes/${id}`, variant: "outline" },
  delivered: { label: "Voir le détail", href: (id) => `/vendeur/commandes/${id}`, variant: "outline" },
};

/** Seller order card (DS "Order Card · Seller", states New / Preparing / Ready). */
export function SellerOrderCard({ order }: { order: Order }) {
  const { net } = orderBreakdown(order);
  const action = cta[order.sellerStatus];
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line-subtle bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-fast) hover:border-line hover:shadow-e1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/vendeur/commandes/${order.id}`} className="type-label-l hover:underline">
            #{order.id}
          </Link>
          <p className="type-body-s text-fg-tertiary">
            {order.buyer} · {order.buyerArea} · {order.createdAt}
          </p>
        </div>
        <SellerOrderBadge status={order.sellerStatus} />
      </div>
      <ul className="type-body-m">
        {order.lines.map((l) => (
          <li key={l.product + l.variant}>
            {l.qty}× {l.product}
            {l.variant && ` (${l.variant})`}
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between">
        <span className="type-body-s text-fg-secondary">{order.sellerStatus === "delivered" ? "Net versé" : "Montant net estimé"}</span>
        <span className="type-price-s">{formatFC(net)}</span>
      </div>
      <div>
        <PaymentBadge status={order.payment} />
      </div>
      <ButtonLink href={action.href(order.id)} variant={action.variant} block iconRight={action.variant === "outline" ? <ArrowRight className="size-4" /> : undefined}>
        {action.label}
      </ButtonLink>
    </article>
  );
}
