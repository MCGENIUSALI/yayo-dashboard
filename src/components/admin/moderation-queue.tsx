"use client";

import { Ban, Check, EyeOff, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import type { Comment } from "@/lib/types";

type Item = Comment & { shop: string; reason: string };

/** Comments masked automatically or reported by sellers (US-22 / US-25). */
export function ModerationQueue({ items }: { items: Item[] }) {
  const [queue, setQueue] = useState(items);
  const resolve = (id: string) => setQueue((q) => q.filter((i) => i.id !== id));
  if (queue.length === 0)
    return (
      <EmptyState icon={<MessagesSquare />} title="File de modération vide">
        Tous les signalements ont été traités.
      </EmptyState>
    );
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {queue.map((c) => (
        <li key={c.id} className="flex flex-col gap-3 rounded-lg border border-line-subtle bg-surface p-4">
          <div className="flex items-start gap-3">
            <Avatar name={c.author} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="type-label-m">
                {c.author} <span className="type-body-s font-normal text-fg-tertiary">· sur {c.shop} · {c.at}</span>
              </p>
              <p className="mt-1 type-body-m">{c.body}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={c.masked ? "warning" : "danger"}>{c.reason}</Badge>
            {c.masked && <Badge>Masqué automatiquement</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" icon={<Check className="size-3.5" />} onClick={() => resolve(c.id)}>
              Rétablir
            </Button>
            <Button size="sm" variant="secondary" icon={<EyeOff className="size-3.5" />} onClick={() => resolve(c.id)}>
              Supprimer le commentaire
            </Button>
            <Button size="sm" variant="danger" icon={<Ban className="size-3.5" />} onClick={() => resolve(c.id)}>
              Suspendre l’auteur
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
