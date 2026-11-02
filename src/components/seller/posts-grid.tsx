"use client";

import { Clapperboard, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { PostTile } from "@/components/ui/media";
import { EmptyState } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import type { Post, PostState } from "@/lib/types";

export function PostsGrid({ posts }: { posts: Post[] }) {
  const [tab, setTab] = useState<PostState>("published");
  const count = (s: PostState) => posts.filter((p) => p.state === s).length;
  const list = posts.filter((p) => p.state === tab);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented
          value={tab}
          onChange={setTab}
          items={[
            { value: "published", label: "Publiées", count: count("published") },
            { value: "draft", label: "Brouillons", count: count("draft") },
            { value: "scheduled", label: "Programmées" },
          ]}
        />
        <ButtonLink href="/vendeur/contenus/nouveau" icon={<Plus className="size-4" />} className="hidden md:inline-flex">
          Publier
        </ButtonLink>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Clapperboard />} title="Rien de programmé" action={<ButtonLink href="/vendeur/contenus/nouveau">Créer une publication</ButtonLink>}>
          Programme une vidéo ou des photos pour qu’elles sortent au meilleur moment.
        </EmptyState>
      ) : (
        <ul key={tab} className="grid animate-fade-in grid-cols-3 gap-1.5 md:grid-cols-4 md:gap-3 xl:grid-cols-6">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/vendeur/contenus/${p.id}`} aria-label={p.caption} className="pressable block rounded-md hover:opacity-90">
                <PostTile swatch={p.cover} caption={p.caption} kind={p.kind} views={p.state === "published" ? p.stats.views : undefined} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ButtonLink href="/vendeur/contenus/nouveau" icon={<Plus className="size-4" />} size="lg" className="fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 shadow-e3 md:hidden">
        Publier
      </ButtonLink>
    </div>
  );
}
