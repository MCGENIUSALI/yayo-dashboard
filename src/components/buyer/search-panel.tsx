"use client";

import { ArrowLeft, History, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchPanel({ initial, recents: initialRecents, suggestions }: { initial: string; recents: string[]; suggestions: string[] }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [recents, setRecents] = useState(initialRecents);
  const go = (term: string) => term.trim() && router.push(`/acheteur/explorer?q=${encodeURIComponent(term.trim())}`);
  const norm = q.trim().toLowerCase();
  const shown = norm ? suggestions.filter((s) => s.toLowerCase().includes(norm)).concat(norm ? [q.trim()] : []).filter((v, i, a) => a.indexOf(v) === i) : suggestions;
  return (
    <div className="flex flex-1 flex-col bg-surface">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="sticky top-0 flex items-center gap-2 bg-surface px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3"
      >
        <button type="button" aria-label="Retour" onClick={() => router.back()} className="pressable flex size-11 shrink-0 items-center justify-center rounded-md">
          <ArrowLeft className="size-5" />
        </button>
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-line-focus pl-4">
          <Search className="size-5 shrink-0 text-fg-secondary" />
          <span className="sr-only">Rechercher</span>
          <input autoFocus enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit, une boutique…" className="min-w-0 flex-1 bg-transparent type-body-l outline-none" />
          {q && (
            <button type="button" aria-label="Effacer" onClick={() => setQ("")} className="p-1 text-fg-tertiary">
              <X className="size-4" />
            </button>
          )}
          <button type="button" aria-label="Filtres" onClick={() => router.push(`/acheteur/explorer?${q ? `q=${encodeURIComponent(q)}&` : "categorie=tout&"}filtres=1`)} className="mr-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-fg-inverse">
            <SlidersHorizontal className="size-4" />
          </button>
        </label>
      </form>
      {!norm && recents.length > 0 && (
        <section className="px-5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="type-overline text-fg-tertiary">Recherches récentes</h2>
            <button type="button" onClick={() => setRecents([])} className="type-label-s text-fg-accent">
              Effacer
            </button>
          </div>
          <ul className="mt-1">
            {recents.map((r) => (
              <li key={r}>
                <button type="button" onClick={() => go(r)} className="flex w-full items-center gap-3 py-3 text-left type-label-m">
                  <History className="size-5 text-fg-secondary" /> {r}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="px-5 pt-4">
        <h2 className="type-overline text-fg-tertiary">Suggestions</h2>
        <ul className="mt-1">
          {shown.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => go(s)} className="flex w-full items-center gap-3 py-3 text-left type-label-m">
                <Search className="size-5 text-fg-secondary" /> {s}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
