"use client";

import { Bell, ShoppingCart, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FavoriteButton } from "@/components/buyer/product-card";
import { QtyStepper } from "@/components/buyer/qty-stepper";
import { ColorPicker } from "@/components/buyer/social";
import { useBuyer } from "@/components/buyer/store";
import { TopBar } from "@/components/buyer/top-bar";
import { BottomBar, EscrowNote, ShopLine, Stars } from "@/components/buyer/ui";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProductThumb } from "@/components/ui/media";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { subscribeRestock } from "@/lib/actions";
import { formatFC, formatUSD } from "@/lib/format";
import type { CatalogProduct, Shop } from "@/lib/types";

export function ProductActions({ product, shop }: { product: CatalogProduct; shop: Shop }) {
  const { add } = useBuyer();
  const toast = useToast();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [slide, setSlide] = useState(0);
  const soldOut = product.stock === 0;
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const alert = useAsyncAction(async () => {
    await subscribeRestock(product.id);
    toast({ tone: "success", title: "Alerte activée", description: "Tu seras prévenu dès le retour en stock." });
  });

  async function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: product.short, url }).catch(() => {});
    else {
      await navigator.clipboard?.writeText(url).catch(() => {});
      toast({ tone: "success", title: "Lien copié" });
    }
  }

  return (
    <>
      <div className="relative">
        <TopBar
          overlay
          fallback="/acheteur/explorer"
          trailing={
            !soldOut && (
              <div className="flex gap-2">
                <button type="button" onClick={share} aria-label="Partager" className="pressable flex size-11 items-center justify-center rounded-md bg-surface/90 shadow-e1">
                  <Share2 className="size-5" />
                </button>
                <FavoriteButton productId={product.id} name={product.short} className="size-11" />
              </div>
            )
          }
        />
        <div className="relative aspect-[402/340] overflow-hidden">
          <ProductThumb swatch={product.swatch} name={product.name} className="size-full rounded-none" />
          {discount > 0 && <span className="absolute bottom-4 left-4 rounded-full bg-accent-subtle px-2.5 py-1 type-label-s text-fg-accent">-{discount} %</span>}
          {!soldOut && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" role="tablist" aria-label="Photos">
              {[0, 1, 2].map((i) => (
                <button key={i} type="button" role="tab" aria-selected={slide === i} aria-label={`Photo ${i + 1}`} onClick={() => setSlide(i)} className={i === slide ? "h-2 w-6 rounded-full bg-accent" : "size-2 rounded-full bg-white/80"} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 bg-surface px-6 pt-5 pb-6">
        {soldOut ? (
          <>
            <Badge tone="danger" className="self-start">
              Rupture de stock
            </Badge>
            <h1 className="type-h3">{product.name}</h1>
            <p className="type-price-l text-fg-secondary">{formatFC(product.price)}</p>
            <ShopLine shop={shop} href={`/acheteur/boutiques/${shop.id}`} />
            <div className="flex gap-3 rounded-lg bg-info-subtle p-4">
              <Bell className="mt-0.5 size-5 shrink-0 text-fg-info" />
              <div>
                <p className="type-label-m text-fg-info">Réassort prévu</p>
                <p className="type-body-s text-fg-secondary">Active l’alerte pour être prévenu dès que le vendeur remet ce produit en stock.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <ShopLine shop={shop} href={`/acheteur/boutiques/${shop.id}`} />
            <h1 className="type-h3">{product.name}</h1>
            <Stars value={product.rating} reviews={product.reviews} size="md" />
            <div>
              <p className="flex items-baseline gap-2">
                <span className="type-price-l">{formatFC(product.price)}</span>
              </p>
              <p className="flex items-baseline gap-3">
                <span className="type-body-s text-fg-tertiary">{formatUSD(product.price)} · prix indicatif</span>
                {product.compareAt && <span className="type-price-strike text-fg-tertiary">{formatFC(product.compareAt)}</span>}
              </p>
            </div>
            <div className="flex items-start justify-between gap-4">
              {product.colors.length > 0 ? <ColorPicker colors={product.colors} value={color} onChange={setColor} /> : <span />}
              <div className="flex flex-col items-end gap-2">
                <p className="type-label-m">Quantité · {product.stock} en stock</p>
                <QtyStepper value={qty} onChange={setQty} max={product.stock} label="Quantité" />
              </div>
            </div>
            <EscrowNote />
            <section>
              <h2 className="type-h4">Description</h2>
              <p className="mt-1 type-body-m text-fg-secondary">{product.description}</p>
            </section>
          </>
        )}
      </div>

      <BottomBar>
        {soldOut ? (
          <div className="flex flex-col gap-2">
            <Button size="lg" block icon={<Bell className="size-5" />} loading={alert.pending} disabled={alert.status === "success"} onClick={() => alert.run()}>
              {alert.status === "success" ? "Alerte activée" : "M’alerter du retour en stock"}
            </Button>
            {alert.error && <p role="alert" className="text-center type-body-s text-fg-danger">{alert.error}</p>}
            <ButtonLink href={`/acheteur/explorer?categorie=${product.category}`} variant="ghost" size="lg" block>
              Voir des produits similaires
            </ButtonLink>
          </div>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <Button
              variant="outline"
              size="lg"
              icon={<ShoppingCart className="size-5" />}
              onClick={() => {
                add(product.id, color, qty);
                toast({ tone: "success", title: "Ajouté au panier", description: `${qty} × ${product.short}` });
              }}
            >
              Au panier
            </Button>
            <Button
              size="lg"
              onClick={() => {
                add(product.id, color, qty);
                router.push("/acheteur/panier");
              }}
            >
              Acheter maintenant
            </Button>
          </div>
        )}
      </BottomBar>
      <p className="sr-only">
        <Link href={`/acheteur/boutiques/${shop.id}`}>Voir la boutique {shop.name}</Link>
      </p>
    </>
  );
}
