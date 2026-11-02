import type { CatalogProduct } from "@/lib/types";

export interface Filters {
  categorie?: string;
  min?: string;
  max?: string;
  note?: string;
  certifies?: boolean;
  rapide?: boolean;
  cash?: boolean;
  tri?: string;
}

/** Category, price, rating and option filters + sort (B2/B3). Pure: runs on the server and in the filter sheet. */
export function applyFilters(products: CatalogProduct[], f: Filters, verifiedShops: string[]) {
  const min = Number(f.min || 0);
  const max = Number(f.max || 0);
  const note = Number(f.note || 0);
  const out = products.filter((p) => {
    if (f.categorie && f.categorie !== "tout") {
      if (f.categorie === "promos" ? !p.compareAt : f.categorie === "electronique" ? !["electronique", "audio"].includes(p.category) : p.category !== f.categorie) return false;
    }
    if (min && p.price < min) return false;
    if (max && p.price > max) return false;
    if (note && p.rating < note) return false;
    if (f.certifies && !verifiedShops.includes(p.shopId)) return false;
    if (f.rapide && !p.fast) return false;
    if (f.cash && !p.cod) return false;
    return true;
  });
  if (f.tri === "prix-asc") out.sort((a, b) => a.price - b.price);
  else if (f.tri === "prix-desc") out.sort((a, b) => b.price - a.price);
  else if (f.tri === "note") out.sort((a, b) => b.rating - a.rating);
  return out;
}
