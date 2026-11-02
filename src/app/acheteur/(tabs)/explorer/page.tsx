import { Search } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/buyer/category-icon";
import { CategoryChips, FiltersSheet, SearchBar, SortSelect } from "@/components/buyer/explorer";
import { ProductCard } from "@/components/buyer/product-card";
import { ScreenHeader } from "@/components/buyer/ui";
import { buttonClass } from "@/components/ui/button";
import { getCategories, getShops, searchCatalog } from "@/lib/api";
import { applyFilters } from "@/lib/search";

export const metadata = { title: "Explorer" };

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Explorer (US-02). Without a query or a category: E3 · Catégories.
 * Otherwise B2 · Résultats with B3 · Filtres and E5 · Aucun résultat.
 */
export default async function Explorer({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const categorie = one(sp.categorie);
  const [categories, shops] = await Promise.all([getCategories(), getShops()]);
  const verified = shops.filter((s) => s.verified).map((s) => s.id);
  const filters = { min: one(sp.min), max: one(sp.max), note: one(sp.note), certifies: sp.certifies === "1", rapide: sp.rapide === "1", cash: sp.cash === "1" };

  if (!q && !categorie) {
    return (
      <>
        <ScreenHeader overline={`${categories.length} univers`} title="Catégories" />
        <div className="bg-surface pb-3">
          <SearchBar />
        </div>
        <ul className="grid grid-cols-2 gap-3 p-5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/acheteur/explorer?categorie=${c.id}`} className="pressable flex flex-col gap-3 rounded-xl bg-surface p-4">
                <span className="flex size-11 items-center justify-center rounded-md bg-accent-subtle text-fg-accent">
                  <CategoryIcon id={c.id} className="size-5.5" />
                </span>
                <span>
                  <span className="block type-label-l">{c.label}</span>
                  <span className="block type-body-s text-fg-tertiary">{c.count}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <FiltersSheet initial={filters} pool={await searchCatalog()} verifiedShops={verified} />
      </>
    );
  }

  const pool = await searchCatalog(q);
  const results = applyFilters(pool, { ...filters, categorie, tri: one(sp.tri) }, verified);
  const label = categories.find((c) => c.id === categorie)?.label;

  return (
    <>
      <div className="sticky top-0 z-20 flex flex-col gap-3 bg-surface pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <SearchBar q={q} />
        <CategoryChips active={categorie || "tout"} />
      </div>
      {results.length ? (
        <>
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <p className="type-body-m text-fg-secondary" aria-live="polite">
              {results.length} résultat{results.length > 1 ? "s" : ""} {label && !q ? `en ${label}` : ""} à Kinshasa
            </p>
            <SortSelect value={one(sp.tri) || "pertinence"} />
          </div>
          <ul className="grid grid-cols-2 gap-3 px-5 pb-6">
            {results.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} shopName={shops.find((s) => s.id === p.shopId)?.name ?? ""} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-surface-sunken text-fg-tertiary">
            <Search className="size-8" />
          </span>
          <p className="type-h4">Aucun résultat{q ? ` pour « ${q} »` : ""}</p>
          <p className="type-body-m text-fg-secondary">Vérifie l’orthographe ou retire des filtres. Voici des produits proches.</p>
          <Link href={q ? `/acheteur/explorer?q=${encodeURIComponent(q)}` : "/acheteur/explorer?categorie=tout"} className={buttonClass({ size: "md" })}>
            Retirer les filtres
          </Link>
        </div>
      )}
      <FiltersSheet initial={filters} pool={pool} verifiedShops={verified} />
    </>
  );
}
