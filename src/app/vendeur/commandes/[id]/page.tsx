import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { OrderActions } from "@/components/seller/order-actions";
import { Avatar } from "@/components/ui/avatar";
import { Card, Overline } from "@/components/ui/card";
import { MoneyRow } from "@/components/ui/misc";
import { DeliveryBadge, PaymentBadge } from "@/components/ui/status";
import { Timeline, type StepState } from "@/components/ui/timeline";
import { getSellerOrder } from "@/lib/api";
import { formatFC } from "@/lib/format";
import { orderBreakdown } from "@/lib/orders";
import type { SellerOrderStatus } from "@/lib/types";

const flow: SellerOrderStatus[] = ["new", "preparing", "ready", "handed_over", "delivered"];

function stepState(current: SellerOrderStatus, step: number): StepState {
  // step 0 = payée (always done), 1 = à préparer, 2 = prête, 3 = remise
  const idx = flow.indexOf(current); // new=0, preparing=1, ready=2, handed=3, delivered=4
  const reached = idx === 0 ? 1 : idx;
  if (step < reached) return "done";
  if (step === reached) return "current";
  return "upcoming";
}

export async function generateMetadata({ params }: PageProps<"/vendeur/commandes/[id]">) {
  const { id } = await params;
  return { title: `Commande #${id}` };
}

export default async function SellerOrderPage({ params }: PageProps<"/vendeur/commandes/[id]">) {
  const { id } = await params;
  const order = await getSellerOrder(id);
  if (!order) notFound();
  const b = orderBreakdown(order);

  return (
    <div className="flex flex-col gap-5 pb-36 lg:pb-0">
      <PageHeader back="/vendeur/commandes" title={`Commande #${order.id}`} actions={<PaymentBadge status={order.payment} />} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="type-body-m text-fg-secondary">Reçue à {order.createdAt}</span>
              {order.delivery && <DeliveryBadge status={order.delivery} />}
            </div>
            <Timeline
              steps={[
                { title: "Payée", detail: "Fonds bloqués par YA YO", state: stepState(order.sellerStatus, 0) },
                { title: "À préparer", detail: "Emballe les articles", state: stepState(order.sellerStatus, 1) },
                { title: "Prête pour collecte", detail: order.courier ? `${order.courier} est assigné` : "Un livreur est assigné", state: stepState(order.sellerStatus, 2) },
                { title: "Remise au livreur", detail: "Avec le code de remise", state: stepState(order.sellerStatus, 3) },
              ]}
            />
          </Card>

          <Card className="p-4 md:p-5">
            <Overline>Client</Overline>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={order.buyer} size="sm" />
              <p className="type-label-l">
                {order.buyer} · {order.buyerArea}, Kinshasa
              </p>
            </div>
            <p className="mt-3 type-body-s text-fg-tertiary">Coordonnées masquées : la livraison passe par YA YO.</p>
          </Card>

          <Card className="p-4 md:p-5">
            <Overline>Articles</Overline>
            <ul className="mt-2">
              {order.lines.map((l) => (
                <li key={l.product + l.variant} className="flex justify-between gap-3 py-1.5 type-body-m">
                  <span className="text-fg-secondary">
                    {l.qty}× {l.product}
                    {l.variant && ` · ${l.variant}`}
                  </span>
                  <span className="type-label-m">{formatFC(l.qty * l.unitPrice)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4 md:p-5">
            <Overline>Ce que tu recevras</Overline>
            <div className="mt-2">
              <MoneyRow label="Montant de la commande" value={formatFC(b.subtotal)} />
              <MoneyRow label={`Commission YA YO (${Math.round(order.commissionRate * 100)} %)`} value={`− ${formatFC(b.commission)}`} tone="success" />
              <MoneyRow label="Frais de livraison" value={`− ${formatFC(b.deliveryFee)}`} tone="success" />
              <div className="mt-2 border-t border-line-subtle">
                <MoneyRow label="Net vendeur" value={formatFC(b.net)} strong />
              </div>
              <p className="mt-2 type-body-s text-fg-tertiary">Versé après confirmation de la livraison.</p>
            </div>
          </Card>
          <OrderActions order={order} />
        </div>
      </div>
    </div>
  );
}
