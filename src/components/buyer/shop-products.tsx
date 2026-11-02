"use client";

import { useState } from "react";
import { ProductCard } from "@/components/buyer/product-card";
import { Chips } from "@/components/ui/segmented";
import type { CatalogProduct } from "@/lib/types";

const group = (p: CatalogProduct) => (/casque|écouteur/i.test(p.name) ? "casques" : /enceinte|jbl/i.test(p.name) ? "enceintes" : p.category);

export function ShopProducts({ products, shopName }: { products: CatalogProduct[]; shopName: string }) {
  const [tab, setTab] = useState("tous");
  const groups = [...new Set(products.map(group))];
  const labels: Record<string, string> = { enceintes: "Enceintes", casques: "Casques", mode: "Mode", beaute: "Beauté", electronique: "Électronique" };
  const items = [
    { value: "tous", label: `Tous (${products.length})` },
    ...groups.map((g) => ({ value: g, label: labels[g] ?? g })),
    ...(products.some((p) => p.compareAt) ? [{ value: "promos", label: "Promos" }] : []),
  ];
  const shown = products.filter((p) => tab === "tous" || (tab === "promos" ? p.compareAt : group(p) === tab));
  return (
    <>
      <Chips items={items} value={tab} onChange={setTab} />
      <ul className="grid grid-cols-2 gap-3">
        {shown.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} shopName={shopName} />
          </li>
        ))}
      </ul>
    </>
  );
}
