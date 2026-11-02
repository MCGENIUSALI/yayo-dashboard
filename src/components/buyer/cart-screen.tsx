"use client";

import { ShoppingCart, Trash2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QtyStepper } from "@/components/buyer/qty-stepper";
import { useBuyer } from "@/components/buyer/store";
import { TabBar } from "@/components/buyer/tab-bar";
import { TopBar } from "@/components/buyer/top-bar";
import { BottomBar, EscrowNote, ShopLine, StatusCircle } from "@/components/buyer/ui";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProductThumb } from "@/components/ui/media";
import { MoneyRow } from "@/components/ui/misc";
import { catalog, PROMO } from "@/lib/data/buyer";
import { groupByShop } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { formatFC, formatUSD } from "@/lib/format";
import type { Shop } from "@/lib/types";

export function CartScreen({ shops }: { shops: Shop[] }) {
  const { lines, totals, setQty, remove, issues, acceptAdjustments } = useBuyer();
  const router = useRouter();
  const [review, setReview] = useState(false);

  if (!lines.length) {
    return (
      <>
        <TopBar title="Mon panier" fallback="/acheteur" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-24 text-center">
          <StatusCircle tone="neutral" size="md">
            <ShoppingCart />
          </StatusCircle>
          <p className="mt-2 type-h4">Ton panier est vide</p>
          <p className="type-body-m text-fg-secondary">Découvre les produits des boutiques vérifiées de Kinshasa.</p>
          <ButtonLink href="/acheteur/explorer">Explorer</ButtonLink>
        </div>
        <TabBar />
      </>
    );
  }

  const groups = groupByShop(lines, catalog);
  const issueOf = (id: string) => issues.find((i) => i.productId === id);
  const outOfStock = issues.filter((i) => i.kind === "out_of_stock").map((i) => catalog.find((p) => p.id === i.productId)!.short);
  const priceChanges = issues.flatMap((i) => (i.kind === "price" ? [`le prix de ${catalog.find((p) => p.id === i.productId)!.short.split(" –")[0]} est passé de ${formatFC(i.from)} à ${formatFC(i.to)}`] : []));

  function checkout() {
    if (issues.length) setReview(true);
    else router.push("/acheteur/commander/livraison");
  }

  return (
    <>
      <TopBar title={`Mon panier (${totals.items})`} fallback="/acheteur" />
      <div className="flex flex-col gap-4 p-5">
        {review && (
          <div role="alert" className="animate-fade-in">
            <Alert tone="warning" title="Ton panier a changé">
              {[outOfStock.length ? `${outOfStock.join(", ")} n’${outOfStock.length > 1 ? "sont" : "est"} plus en stock` : "", ...priceChanges].filter(Boolean).join(" et ")}.
            </Alert>
          </div>
        )}
        {groups.map((g) => {
          const shop = shops.find((s) => s.id === g.shopId)!;
          return (
            <section key={g.shopId} aria-label={`Colis ${shop.name}`} className="rounded-xl bg-surface p-4">
              <ShopLine shop={shop} trailing={<Badge icon={<Truck />}>{shop.delivery}</Badge>} />
              <ul className="mt-3 divide-y divide-line-subtle border-t border-line-subtle">
                {g.lines.map((l) => {
                  const issue = review ? issueOf(l.productId) : undefined;
                  const gone = issue?.kind === "out_of_stock";
                  return (
                    <li key={l.productId} className={cn("flex gap-3 py-4", gone && "opacity-50")}>
                      <ProductThumb swatch={l.product.swatch} name={l.product.name} className="size-20 rounded-lg" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 truncate type-label-m">{l.product.short}</p>
                          <button type="button" aria-label={`Retirer ${l.product.short}`} onClick={() => remove(l.productId)} className="pressable -m-1 p-1 text-fg-secondary hover:text-fg-danger">
                            <Trash2 className="size-4.5" />
                          </button>
                        </div>
                        <p className="type-body-s text-fg-tertiary">
                          {gone ? "Retiré · plus en stock" : `${l.color ? `${l.color} · ` : ""}Qté ${l.qty}${issue?.kind === "price" ? " · prix mis à jour" : ""}`}
                        </p>
                        <div className="mt-auto flex items-end justify-between gap-2">
                          <span>
                            <span className="block type-price-s">{formatFC(issue?.kind === "price" ? issue.to : l.unitPrice)}</span>
                            <span className="block type-caption text-fg-tertiary">{formatUSD(l.unitPrice)}</span>
                          </span>
                          <QtyStepper size="sm" value={l.qty} onChange={(v) => setQty(l.productId, v)} max={Math.max(1, l.product.stock)} label={`Quantité de ${l.product.short}`} disabled={gone} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {!review && (
          <>
            <section aria-label="Récapitulatif" className="rounded-xl bg-surface p-4">
              <MoneyRow label={`Sous-total (${totals.items} article${totals.items > 1 ? "s" : ""})`} value={formatFC(totals.subtotal)} />
              <MoneyRow label={`Livraison (${totals.shops} vendeur${totals.shops > 1 ? "s" : ""})`} value={formatFC(totals.delivery)} />
              {totals.promo > 0 && <MoneyRow label={`Code promo ${PROMO.code}`} value={`− ${formatFC(totals.promo)}`} tone="success" />}
              <div className="mt-2 border-t border-line-subtle">
                <MoneyRow strong label="Total à payer" value={formatFC(totals.total)} />
              </div>
              <p className="text-right type-body-s text-fg-tertiary">{formatUSD(totals.total)} · taux indicatif du jour</p>
            </section>
            <EscrowNote />
          </>
        )}
      </div>
      <BottomBar>
        {review ? (
          <Button
            size="lg"
            block
            onClick={() => {
              acceptAdjustments();
              router.push("/acheteur/commander/livraison");
            }}
          >
            Accepter et continuer
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="type-body-s text-fg-secondary">Total</p>
              <p className="type-price-l">{formatFC(totals.total)}</p>
              <p className="type-caption text-fg-tertiary">{formatUSD(totals.total)}</p>
            </div>
            <Button size="lg" onClick={checkout} className="px-8">
              Commander
            </Button>
          </div>
        )}
      </BottomBar>
    </>
  );
}
