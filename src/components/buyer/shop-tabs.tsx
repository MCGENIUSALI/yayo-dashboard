"use client";

import { Bell, BellRing, Clapperboard, Play, Radio } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ShopProducts } from "@/components/buyer/shop-products";
import { Button } from "@/components/ui/button";
import { PostTile, ProductThumb } from "@/components/ui/media";
import { EmptyState } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import { useToast } from "@/components/ui/toast";
import { formatCompact, formatNumber } from "@/lib/format";
import type { CatalogProduct, FeedPost } from "@/lib/types";

type Tab = "boutique" | "videos" | "lives" | "collections";
type ShopLive = { id: string; title: string; state: "live" | "scheduled" | "replay"; when: string; viewers?: number; swatch: string };

const groupOf = (p: CatalogProduct) => (/casque|écouteur|earbuds/i.test(p.name) ? "Casques et écouteurs" : /enceinte|jbl/i.test(p.name) ? "Enceintes portables" : p.category === "mode" ? "Mode wax" : p.category === "beaute" ? "Beauté" : "Sélection");

/** B5 · Profil public de la boutique : onglets Boutique, Vidéos, Lives, Collections. */
export function ShopTabs({ products, shopName, posts, lives }: { products: CatalogProduct[]; shopName: string; posts: FeedPost[]; lives: ShopLive[] }) {
  const [tab, setTab] = useState<Tab>("boutique");
  const [reminders, setReminders] = useState<Set<string>>(() => new Set());
  const [collection, setCollection] = useState<string | null>(null);
  const toast = useToast();
  const collections = Object.entries(
    products.reduce<Record<string, CatalogProduct[]>>((acc, p) => {
      (acc[groupOf(p)] ??= []).push(p);
      return acc;
    }, {}),
  );
  const live = lives.find((l) => l.state === "live");

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        value={tab}
        onChange={(t) => {
          setTab(t);
          setCollection(null);
        }}
        items={[
          { value: "boutique", label: "Boutique" },
          { value: "videos", label: "Vidéos" },
          { value: "lives", label: "Lives" },
          { value: "collections", label: "Collections" },
        ]}
      />

      {tab === "boutique" && <ShopProducts products={products} shopName={shopName} />}

      {tab === "videos" &&
        (posts.length === 0 ? (
          <EmptyState icon={<Clapperboard />} title="Pas encore de vidéo">{shopName} n’a encore rien publié.</EmptyState>
        ) : (
          <ul className="grid grid-cols-3 gap-1.5">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href="/acheteur/fil" aria-label={p.caption} className="pressable block">
                  <PostTile swatch={p.swatch} caption={p.caption} kind={p.kind} views={p.likes * 4} />
                </Link>
              </li>
            ))}
          </ul>
        ))}

      {tab === "lives" && (
        <div className="flex flex-col gap-4">
          {live && (
            <section className="relative overflow-hidden rounded-xl bg-inverse text-fg-inverse">
              <ProductThumb swatch={live.swatch} name={live.title} className="absolute inset-0 size-full rounded-none opacity-40" />
              <div className="relative flex flex-col gap-2 p-4">
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-danger px-2.5 py-1 type-label-s text-white">
                  <span className="size-2 animate-pulse rounded-full bg-white" /> EN DIRECT · {formatNumber(live.viewers ?? 0)} spectateurs
                </span>
                <p className="type-h4">{live.title}</p>
                <Button variant="secondary" icon={<Play className="size-4" />} className="self-start" onClick={() => toast({ tone: "info", title: "Connexion au live…", description: "Le lecteur vidéo arrive avec l’API de streaming." })}>
                  Rejoindre le live
                </Button>
              </div>
            </section>
          )}
          {lives.some((l) => l.state === "scheduled") && (
            <section className="flex flex-col gap-2">
              <h3 className="type-h4">Prochains lives programmés</h3>
              <ul className="flex flex-col divide-y divide-line-subtle rounded-xl bg-surface">
                {lives
                  .filter((l) => l.state === "scheduled")
                  .map((l) => {
                    const on = reminders.has(l.id);
                    return (
                      <li key={l.id} className="flex items-center gap-3 p-3">
                        <ProductThumb swatch={l.swatch} name={l.title} className="size-12" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate type-label-m">{l.title}</p>
                          <p className="type-body-s text-fg-tertiary">{l.when}</p>
                        </div>
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={on ? `Rappel activé pour ${l.title}` : `Me rappeler ${l.title}`}
                          onClick={() => {
                            setReminders((r) => {
                              const n = new Set(r);
                              if (on) n.delete(l.id);
                              else n.add(l.id);
                              return n;
                            });
                            if (!on) toast({ tone: "success", title: "Rappel activé", description: "On te prévient 30 min avant." });
                          }}
                          className="pressable flex size-10 items-center justify-center rounded-full border border-line hover:bg-surface-muted aria-pressed:border-transparent aria-pressed:bg-accent aria-pressed:text-white"
                        >
                          {on ? <BellRing className="size-4" /> : <Bell className="size-4" />}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </section>
          )}
          {lives.some((l) => l.state === "replay") && (
            <section className="flex flex-col gap-2">
              <h3 className="type-h4">Replays récents</h3>
              <ul className="grid grid-cols-2 gap-3">
                {lives
                  .filter((l) => l.state === "replay")
                  .map((l) => (
                    <li key={l.id} className="flex flex-col gap-1.5">
                      <PostTile swatch={l.swatch} caption={l.title} kind="video" views={l.viewers} />
                      <p className="line-clamp-2 type-label-m">{l.title}</p>
                      <p className="type-caption text-fg-tertiary">{l.when}</p>
                    </li>
                  ))}
              </ul>
            </section>
          )}
          {lives.length === 0 && <EmptyState icon={<Radio />} title="Aucun live pour l’instant">Abonne-toi pour être prévenu du prochain live de {shopName}.</EmptyState>}
        </div>
      )}

      {tab === "collections" &&
        (collection ? (
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => setCollection(null)} className="self-start type-label-m text-fg-accent hover:underline">
              ← Toutes les collections
            </button>
            <h3 className="type-h4">{collection}</h3>
            <ShopProducts products={collections.find(([n]) => n === collection)?.[1] ?? []} shopName={shopName} />
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {collections.map(([name, items]) => (
              <li key={name}>
                <button type="button" onClick={() => setCollection(name)} className="pressable flex w-full items-center gap-3 rounded-xl bg-surface p-3 text-left hover:bg-surface-muted">
                  <span className="grid size-16 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-md">
                    {items.slice(0, 4).map((p) => (
                      <ProductThumb key={p.id} swatch={p.swatch} name={p.name} className="size-full rounded-none [&_svg]:hidden" />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate type-label-l">{name}</span>
                    <span className="block type-body-s text-fg-tertiary">
                      {items.length} produit{items.length > 1 ? "s" : ""} · dès {formatCompact(Math.min(...items.map((p) => p.price)))} FC
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
