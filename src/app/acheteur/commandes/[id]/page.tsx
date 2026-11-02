import { Bike, Lock, MapPin, Store, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallCourier } from "@/components/buyer/call-courier";
import { TopBar } from "@/components/buyer/top-bar";
import { BottomBar } from "@/components/buyer/ui";
import { ShareButton } from "@/components/buyer/share-button";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { ProductThumb } from "@/components/ui/media";
import { MoneyRow } from "@/components/ui/misc";
import { DeliveryBadge, PaymentBadge } from "@/components/ui/status";
import { Timeline } from "@/components/ui/timeline";
import { getBuyerOrder, getCatalog, getShop } from "@/lib/api";
import { formatFC } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Commande #${(await params).id}` };
}

function RouteMap() {
  return (
    <div aria-hidden className="relative h-56 overflow-hidden bg-surface-sunken">
      <svg viewBox="0 0 402 230" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <g stroke="var(--bg-surface)" strokeWidth="14" fill="none">
          <path d="M-10 60 L420 20" />
          <path d="M-10 150 L420 110" />
          <path d="M80 -10 L120 240" />
          <path d="M230 -10 L260 240" />
          <path d="M330 -10 L360 240" />
        </g>
        <path d="M55 185 C 120 150, 140 120, 190 105 S 290 70, 330 40" stroke="var(--bg-accent)" strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
      <span className="absolute top-[72%] left-[13%] flex size-9 -translate-1/2 items-center justify-center rounded-full bg-brand text-fg-inverse shadow-e2">
        <Store className="size-4.5" />
      </span>
      <span className="absolute top-[45%] left-[47%] flex size-10 -translate-1/2 animate-pulse items-center justify-center rounded-full bg-surface text-fg-accent shadow-e2">
        <Bike className="size-5" />
      </span>
      <span className="absolute top-[17%] left-[82%] flex size-9 -translate-1/2 items-center justify-center rounded-full bg-accent text-fg-on-accent shadow-e2">
        <MapPin className="size-4.5" />
      </span>
    </div>
  );
}

/** D2 · Suivi de livraison (US-06): payment and delivery statuses kept in sync, reception code, timeline. */
export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await getBuyerOrder((await params).id);
  if (!order) notFound();
  const [shop, catalog] = await Promise.all([getShop(order.shopId), getCatalog()]);
  const total = order.lines.reduce((n, l) => n + l.unitPrice * l.qty, 0) + order.deliveryFee;
  const live = order.tab === "ongoing";
  return (
    <>
      <TopBar title={`Commande #${order.id}`} fallback="/acheteur/commandes" trailing={<ShareButton title={`Commande #${order.id}`} />} />
      {order.delivery === "delivering" && <RouteMap />}
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="type-body-s text-fg-secondary">{live ? "Arrivée estimée" : "Livrée le"}</p>
            <p className="type-h3">{live ? order.eta : order.deliveredAt}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {order.delivery && <DeliveryBadge status={order.delivery} />}
            <PaymentBadge status={order.payment} />
          </div>
        </div>
        {order.courier && live && (
          <section className="rounded-xl bg-surface p-4">
            <div className="flex items-center gap-3">
              <Avatar name={order.courier.name} verified size="lg" />
              <div className="min-w-0 flex-1">
                <p className="type-label-l">{order.courier.name} · ton livreur</p>
                <p className="type-body-s text-fg-tertiary">
                  {order.courier.vehicle} · Livreur vérifié · {order.courier.rating.toLocaleString("fr-FR")} ★
                </p>
              </div>
              <CallCourier name={order.courier.name} />
            </div>
            <p className="mt-3 type-body-s text-fg-tertiary">Numéro masqué : l’appel passe par YA YO.</p>
          </section>
        )}
        {order.receptionCode && live && (
          <section aria-labelledby="code" className="rounded-xl border-2 border-dashed border-accent/60 bg-accent-subtle p-5 text-center">
            <h2 id="code" className="flex items-center justify-center gap-2 type-label-l text-fg-accent">
              <Lock className="size-5" /> Code de réception
            </h2>
            <div className="mt-4 flex justify-center gap-3" aria-label={`Code ${order.receptionCode.split("").join(" ")}`}>
              {order.receptionCode.split("").map((c, i) => (
                <span key={i} className="flex h-16 w-14 items-center justify-center rounded-md bg-surface type-display shadow-e1">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-4 type-body-s text-fg-secondary">Donne ce code au livreur seulement quand tu as vérifié ton colis. Il déclenche le paiement au vendeur.</p>
          </section>
        )}
        <section aria-labelledby="suivi">
          <h2 id="suivi" className="mb-3 type-h4">
            Suivi
          </h2>
          <Timeline steps={order.steps} />
        </section>
        <section aria-labelledby="articles" className="rounded-xl bg-surface p-4">
          <h2 id="articles" className="type-label-l">
            {shop?.name}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {order.lines.map((l) => {
              const p = catalog.find((x) => x.id === l.productId)!;
              return (
                <li key={l.productId} className="flex items-center gap-3">
                  <ProductThumb swatch={p.swatch} name={p.name} className="size-12" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate type-label-m">{p.short}</p>
                    <p className="type-body-s text-fg-tertiary">
                      {l.color} · Qté {l.qty}
                    </p>
                  </div>
                  <span className="type-price-s">{formatFC(l.unitPrice * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 border-t border-line-subtle pt-2">
            <MoneyRow label="Livraison" value={order.deliveryFee ? formatFC(order.deliveryFee) : "Offerte"} />
            <MoneyRow label={`Total · ${order.method}`} value={formatFC(total)} />
          </div>
        </section>
        {order.tab !== "dispute" && (
          <Link href={`/acheteur/commandes/${order.id}/probleme`} className="inline-flex items-center gap-2 self-start py-2 type-label-m">
            <TriangleAlert className="size-5" /> Signaler un problème
          </Link>
        )}
      </div>
      {order.tab === "delivered" && !order.rated && (
        <BottomBar>
          <ButtonLink href={`/acheteur/commandes/${order.id}/avis`} size="lg" block>
            Noter la commande
          </ButtonLink>
        </BottomBar>
      )}
      {order.tab === "dispute" && order.disputeId && (
        <BottomBar>
          <ButtonLink href={`/acheteur/litiges/${order.disputeId}`} size="lg" block>
            Voir le litige
          </ButtonLink>
        </BottomBar>
      )}
    </>
  );
}
