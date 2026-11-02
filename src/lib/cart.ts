import { DELIVERY_FEE_PER_SHOP, PROMO } from "@/lib/data/buyer";
import type { CartLine, CatalogProduct } from "@/lib/types";

export interface CartGroup {
  shopId: string;
  lines: (CartLine & { product: CatalogProduct })[];
}

/** Cart lines grouped by shop: one sub-order, one parcel and one delivery fee per shop (H-01). */
export function groupByShop(lines: CartLine[], catalog: CatalogProduct[]): CartGroup[] {
  const groups = new Map<string, CartGroup>();
  for (const line of lines) {
    const product = catalog.find((p) => p.id === line.productId);
    if (!product) continue;
    const g = groups.get(product.shopId) ?? { shopId: product.shopId, lines: [] };
    g.lines.push({ ...line, product });
    groups.set(product.shopId, g);
  }
  return [...groups.values()];
}

export function cartTotals(lines: CartLine[], catalog: CatalogProduct[]) {
  const groups = groupByShop(lines, catalog);
  const items = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
  const delivery = groups.length * DELIVERY_FEE_PER_SHOP;
  const promo = subtotal >= PROMO.minimum ? PROMO.amount : 0;
  return { items, shops: groups.length, subtotal, delivery, promo, total: Math.max(0, subtotal + delivery - promo) };
}

export type CartIssue = { productId: string; kind: "out_of_stock" } | { productId: string; kind: "price"; from: number; to: number };

/** Compares the cart with the live catalogue before checkout (E7 · Panier ajusté). */
export function cartIssues(lines: CartLine[], catalog: CatalogProduct[]): CartIssue[] {
  const issues: CartIssue[] = [];
  for (const l of lines) {
    const p = catalog.find((x) => x.id === l.productId);
    if (!p) continue;
    if (p.stock === 0) issues.push({ productId: p.id, kind: "out_of_stock" });
    else if (p.price !== l.unitPrice) issues.push({ productId: p.id, kind: "price", from: l.unitPrice, to: p.price });
  }
  return issues;
}
