"use client";

import { BadgeCheck, Banknote, ChevronDown, Search, SlidersHorizontal, Truck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChoiceChips } from "@/components/buyer/choice";
import { Button } from "@/components/ui/button";
import { Field, Input, SwitchRow } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { applyFilters } from "@/lib/search";
import type { CatalogProduct } from "@/lib/types";

export const sorts = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "note", label: "Mieux notés" },
] as const;

const chipCats = [
  { value: "tout", label: "Tout" },
  { value: "electronique", label: "Électronique" },
  { value: "audio", label: "Audio" },
  { value: "mode", label: "Mode" },
  { value: "beaute", label: "Beauté" },
  { value: "promos", label: "Promos" },
];

function useParamsUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
}

/** Search field that opens E4 (recherche en cours) + filter button. */
export function SearchBar({ q }: { q?: string }) {
  const update = useParamsUpdater();
  return (
    <div className="flex items-center gap-2 px-5">
      <Link href={`/acheteur/recherche${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={cn("flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full pl-4 type-body-l", q ? "border-2 border-line-focus bg-surface" : "bg-surface-sunken text-fg-tertiary")}>
        <Search className="size-5 shrink-0 text-fg-secondary" />
        <span className="truncate">{q || "Rechercher un produit, une boutique…"}</span>
      </Link>
      <button type="button" aria-label="Filtres" onClick={() => update({ filtres: "1" })} className="pressable flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-fg-inverse">
        <SlidersHorizontal className="size-5" />
      </button>
    </div>
  );
}

export function CategoryChips({ active }: { active: string }) {
  const update = useParamsUpdater();
  return (
    <div className="flex gap-2 overflow-x-auto px-5 scrollbar-none">
      {chipCats.map((c) => {
        const on = c.value === active;
        return (
          <button key={c.value} type="button" aria-pressed={on} onClick={() => update({ categorie: c.value === "tout" ? "tout" : c.value })} className={cn("pressable h-10 shrink-0 rounded-full border px-4 type-label-m", on ? "border-transparent bg-brand text-fg-inverse" : "border-line bg-surface")}>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

export function SortSelect({ value }: { value: string }) {
  const update = useParamsUpdater();
  return (
    <label className="relative inline-flex items-center gap-1 type-label-m">
      <span className="sr-only">Trier par</span>
      <select value={value} onChange={(e) => update({ tri: e.target.value })} className="appearance-none bg-transparent pr-6 outline-none">
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-0 size-4" />
    </label>
  );
}

export interface FilterState {
  min: string;
  max: string;
  note: string;
  certifies: boolean;
  rapide: boolean;
  cash: boolean;
}

/** B3 · Filtres (feuille). Applies on "Voir N résultats"; the count updates live. */
export function FiltersSheet({ initial, pool, verifiedShops }: { initial: FilterState; pool: CatalogProduct[]; verifiedShops: string[] }) {
  const params = useSearchParams();
  const update = useParamsUpdater();
  const open = params.has("filtres");
  const [f, setF] = useState(initial);
  const [cat, setCat] = useState(params.get("categorie") ?? "tout");
  const n = applyFilters(pool, { ...f, categorie: cat }, verifiedShops).length;
  const notes = [
    { v: "", l: "Toutes" },
    { v: "4", l: "4★ et +" },
    { v: "4.5", l: "4,5★ et +" },
  ];
  const close = () => update({ filtres: null });
  return (
    <Sheet
      open={open}
      onClose={close}
      title="Filtres"
      footer={
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Button variant="outline" size="lg" onClick={() => (setF({ min: "", max: "", note: "", certifies: false, rapide: false, cash: false }), setCat("tout"))}>
            Effacer
          </Button>
          <Button
            size="lg"
            onClick={() =>
              update({
                filtres: null,
                categorie: cat,
                min: f.min.replace(/\D/g, ""),
                max: f.max.replace(/\D/g, ""),
                note: f.note,
                certifies: f.certifies ? "1" : null,
                rapide: f.rapide ? "1" : null,
                cash: f.cash ? "1" : null,
              })
            }
          >
            Voir {n} résultat{n > 1 ? "s" : ""}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 type-label-l">Catégorie</p>
          <ChoiceChips label="Catégorie" items={["Tout", "Audio", "Électronique", "Mode", "Beauté"]} selected={[chipCats.find((c) => c.value === cat)?.label ?? "Tout"]} onToggle={(l) => setCat(chipCats.find((c) => c.label === l)?.value ?? "tout")} />
        </div>
        <div>
          <p className="mb-2 type-label-l">Prix (FC)</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min">{(id) => <Input id={id} inputMode="numeric" placeholder="50 000" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} />}</Field>
            <Field label="Max">{(id) => <Input id={id} inputMode="numeric" placeholder="200 000" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} />}</Field>
          </div>
        </div>
        <div>
          <p className="mb-2 type-label-l">Note minimale</p>
          <ChoiceChips label="Note minimale" items={notes.map((x) => x.l)} selected={[notes.find((x) => x.v === f.note)?.l ?? "Toutes"]} onToggle={(l) => setF({ ...f, note: notes.find((x) => x.l === l)?.v ?? "" })} />
        </div>
        <div className="divide-y divide-line-subtle">
          <SwitchRow icon={<BadgeCheck />} label="Vendeurs certifiés" hint="Boutiques vérifiées par YA YO" checked={f.certifies} onChange={(v) => setF({ ...f, certifies: v })} />
          <SwitchRow icon={<Truck />} label="Livraison en 24 h" hint="Disponible à Kinshasa" checked={f.rapide} onChange={(v) => setF({ ...f, rapide: v })} />
          <SwitchRow icon={<Banknote />} label="Paiement à la livraison" hint="Cash accepté" checked={f.cash} onChange={(v) => setF({ ...f, cash: v })} />
        </div>
      </div>
    </Sheet>
  );
}
