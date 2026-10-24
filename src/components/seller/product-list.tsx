"use client";

import { Pencil, Plus, Search, Star, Tag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { ProductThumb } from "@/components/ui/media";
import { EmptyState } from "@/components/ui/misc";
import { Price } from "@/components/ui/price";
import { Chips } from "@/components/ui/segmented";
import type { Product } from "@/lib/types";

type Filter = "all" | "online" | "out" | "draft";

export function ProductList({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = {
    all: products.length,
    online: products.filter((p) => p.online && p.stock > 0).length,
    out: products.filter((p) => p.stock === 0).length,
    draft: products.filter((p) => !p.online).length,
  };

  const list = useMemo(
    () =>
      products
        .filter((p) => (filter === "online" ? p.online && p.stock > 0 : filter === "out" ? p.stock === 0 : filter === "draft" ? !p.online : true))
        .filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())),
    [products, filter, q],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="md:w-80">
          <Input icon={<Search />} type="search" placeholder="Rechercher dans mon catalogue" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher un produit" />
        </div>
        <ButtonLink href="/vendeur/produits/nouveau" icon={<Plus className="size-4" />} className="hidden md:inline-flex">
          Ajouter un produit
        </ButtonLink>
      </div>
      <Chips
        value={filter}
        onChange={setFilter}
        items={[
          { value: "all", label: "Tous", count: counts.all },
          { value: "online", label: "En ligne", count: counts.online },
          { value: "out", label: "Rupture", count: counts.out },
          { value: "draft", label: "Brouillons", count: counts.draft },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState icon={<Tag />} title="Aucun produit">
          Modifie ta recherche ou ajoute un nouveau produit.
        </EmptyState>
      ) : (
        <ul key={filter} className="grid animate-fade-in gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-lg border border-line-subtle bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-fast) hover:border-line hover:shadow-e1">
              <div className="flex gap-3">
                <ProductThumb swatch={p.image} name={p.name} className="size-20" />
                <div className="min-w-0 flex-1">
                  <p className="type-caption text-fg-tertiary">{p.category.split(" › ")[0]}</p>
                  <Link href={`/vendeur/produits/${p.id}`} className="line-clamp-2 type-label-m hover:underline">
                    {p.name}
                  </Link>
                  <p className="mt-0.5 inline-flex items-center gap-1 type-body-s text-fg-secondary">
                    <Star className="size-3.5 fill-warning text-warning" /> {p.rating.toLocaleString("fr-FR")}
                  </p>
                  <Price amount={p.price} size="s" className="mt-1" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                {!p.online ? <Badge>Brouillon</Badge> : p.stock === 0 ? <Badge tone="danger">Rupture</Badge> : p.stock <= 3 ? <Badge tone="warning">{p.stock} en stock</Badge> : <Badge tone="success">{p.stock} en stock</Badge>}
                <Link href={`/vendeur/produits/${p.id}`} className="inline-flex items-center gap-1.5 type-label-s hover:underline">
                  <Pencil className="size-3.5" /> Modifier
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ButtonLink href="/vendeur/produits/nouveau" icon={<Plus className="size-4" />} className="fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 shadow-e3 md:hidden">
        Ajouter un produit
      </ButtonLink>
    </div>
  );
}
