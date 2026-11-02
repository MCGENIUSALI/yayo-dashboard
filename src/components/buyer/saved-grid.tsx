"use client";

import { Bell, Heart, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { ProductThumb } from "@/components/ui/media";
import { EmptyState } from "@/components/ui/misc";
import { Chips, Segmented } from "@/components/ui/segmented";
import { formatCompact } from "@/lib/format";
import { Bookmark } from "lucide-react";

type Tile = { key: string; id: string; kind: "video" | "photo"; swatch: string; likes: number; productId: string; name: string; category: string };
type Tab = "saved" | "reposted" | "liked";

export function SavedGrid({ tabs, collections, initialTab }: { tabs: Record<Tab, Tile[]>; collections: string[]; initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [col, setCol] = useState(collections[0]);
  const tiles = tabs[tab].filter((t) => col === "Tout" || (col === "Audio" ? t.category === "audio" : col === "Cadeaux" ? t.category !== "audio" : true));
  return (
    <div className="flex flex-col gap-4 p-5">
      <Segmented
        value={tab}
        onChange={setTab}
        items={[
          { value: "saved", label: "Enregistrés", count: tabs.saved.length },
          { value: "reposted", label: "Republiés", count: tabs.reposted.length },
          { value: "liked", label: "Aimés" },
        ]}
      />
      <Chips items={collections.map((c) => ({ value: c, label: c }))} value={col} onChange={setCol} />
      {tiles.length ? (
        <ul className="grid grid-cols-3 gap-2">
          {tiles.map((t) => (
            <li key={t.key}>
              <Link href={t.kind === "video" ? `/acheteur/fil?video=${t.id}` : `/acheteur/produits/${t.productId}`} className="relative block aspect-[3/4] overflow-hidden rounded-md">
                <ProductThumb swatch={t.swatch} name={t.name} className="size-full rounded-none" />
                {t.kind === "video" && <Play className="absolute top-2 left-2 size-4 text-white" />}
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 type-label-s text-white drop-shadow">
                  <Heart className="size-3.5" /> {formatCompact(t.likes)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={<Bookmark />} title="Rien d’enregistré ici">
          Enregistre une vidéo ou une photo pour la retrouver plus tard.
        </EmptyState>
      )}
      <Alert tone="info" icon={<Bell />} title="Prix et stock à jour">
        Si un produit enregistré baisse de prix ou revient en stock, tu es notifié.
      </Alert>
    </div>
  );
}
