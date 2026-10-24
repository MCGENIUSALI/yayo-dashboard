"use client";

import { Ban, Check, EyeOff, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { ActionError } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { resolveReport } from "@/lib/actions";
import { cn } from "@/lib/cn";
import { duration } from "@/lib/motion";
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
        <ReportCard key={c.id} c={c} onResolved={() => resolve(c.id)} />
      ))}
    </ul>
  );
}

type Decision = "restore" | "delete" | "suspend";
const done: Record<Decision, string> = { restore: "Commentaire rétabli", delete: "Commentaire supprimé", suspend: "Auteur suspendu" };

/** Card leaves the queue only after the server confirmed, with a short fade-out. */
function ReportCard({ c, onResolved }: { c: Item; onResolved: () => void }) {
  const toast = useToast();
  const [leaving, setLeaving] = useState(false);
  const act = useAsyncAction(async (d: Decision) => {
    await resolveReport(c.id, d);
    toast({ tone: "success", title: done[d], description: `${c.author} · ${c.shop}` });
    setLeaving(true);
    window.setTimeout(onResolved, duration.base);
  });
  const running = (d: Decision) => act.busy && act.args?.[0] === d;
  const locked = act.busy;
  return (
    <li className={cn("flex flex-col gap-3 rounded-lg border border-line-subtle bg-surface p-4 transition-[opacity,transform] duration-(--duration-base) ease-(--ease-in)", leaving && "scale-[0.98] opacity-0")}>
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
      <ActionError error={act.error} onRetry={() => act.args && act.run(...act.args)} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" icon={<Check className="size-3.5" />} loading={running("restore")} disabled={locked && !running("restore")} onClick={() => act.run("restore")}>
          Rétablir
        </Button>
        <Button size="sm" variant="secondary" icon={<EyeOff className="size-3.5" />} loading={running("delete")} disabled={locked && !running("delete")} onClick={() => act.run("delete")}>
          Supprimer le commentaire
        </Button>
        <Button size="sm" variant="danger" icon={<Ban className="size-3.5" />} loading={running("suspend")} disabled={locked && !running("suspend")} onClick={() => act.run("suspend")}>
          Suspendre l’auteur
        </Button>
      </div>
    </li>
  );
}
