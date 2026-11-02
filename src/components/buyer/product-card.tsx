"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { ProductThumb } from "@/components/ui/media";
import { useBuyer } from "@/components/buyer/store";
import { Stars } from "@/components/buyer/ui";
import { cn } from "@/lib/cn";
import { formatFC, formatUSD } from "@/lib/format";
import type { CatalogProduct } from "@/lib/types";

export function FavoriteButton({ productId, name, className }: { productId: string; name: string; className?: string }) {
  const { favorites, toggleFavorite } = useBuyer();
  const on = favorites.has(productId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(productId);
      }}
      className={cn("pressable flex size-9 items-center justify-center rounded-md bg-surface/95 shadow-e1", className)}
    >
      <Heart className={cn("size-5", on && "fill-danger text-danger")} />
    </button>
  );
}

/** Product grid card (DS "Product Card"): visual, discount, favourite, shop, rating, FC + USD price. */
export function ProductCard({ product, shopName }: { product: CatalogProduct; shopName: string }) {
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  return (
    <Link href={`/acheteur/produits/${product.id}`} className="group flex flex-col overflow-hidden rounded-xl bg-surface outline-offset-2">
      <span className="relative block aspect-square">
        <ProductThumb swatch={product.swatch} name={product.name} className="size-full rounded-none transition-transform duration-(--duration-slow) ease-(--ease-out) group-hover:scale-[1.02]" />
        {discount > 0 && <span className="absolute top-2.5 left-2.5 rounded-full bg-accent-subtle px-2 py-0.5 type-label-s text-fg-accent">-{discount} %</span>}
        {product.stock === 0 && <span className="absolute top-2.5 left-2.5 rounded-full bg-danger-subtle px-2 py-0.5 type-label-s text-fg-danger">Rupture</span>}
        <FavoriteButton productId={product.id} name={product.short} className="absolute top-2.5 right-2.5" />
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="truncate type-body-s text-fg-tertiary">{shopName}</span>
        <span className="line-clamp-2 type-label-m">{product.short}</span>
        <Stars value={product.rating} />
        <span className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-1">
          <span className="type-price-m whitespace-nowrap">{formatFC(product.price)}</span>
          {product.compareAt && <span className="type-price-strike text-fg-tertiary">{formatFC(product.compareAt)}</span>}
        </span>
        <span className="type-body-s text-fg-tertiary">{formatUSD(product.price)}</span>
      </span>
    </Link>
  );
}
