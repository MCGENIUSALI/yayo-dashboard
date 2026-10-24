"use client";

import { EyeOff, Flag, Heart, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ActionError, Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { moderateComment } from "@/lib/actions";
import { cn } from "@/lib/cn";
import type { Comment } from "@/lib/types";

type Action = "reply" | "hide" | "report";

/** US-25: reply, hide or report public comments. */
export function CommentModeration({ initial }: { initial: Comment[] }) {
  const [comments, setComments] = useState(initial);
  const update = (id: string, patch: Partial<Comment>) => setComments((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const pending = comments.filter((c) => !c.hidden && !c.sellerReply).length;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-h4">Commentaires à modérer ({pending})</h2>
      <ul className="flex flex-col divide-y divide-line-subtle rounded-lg border border-line-subtle bg-surface">
        {comments.map((c) => (
          <CommentRow key={c.id} c={c} onChange={(patch) => update(c.id, patch)} />
        ))}
      </ul>
      <Alert tone="info" icon={<ShieldCheck />} title="Modération YA YO">
        Les commentaires avec numéro, lien ou demande de paiement hors application sont masqués et signalés aux administrateurs.
      </Alert>
    </section>
  );
}

/** Each comment has its own request state, so acting on one never blocks the others. */
function CommentRow({ c, onChange }: { c: Comment; onChange: (patch: Partial<Comment>) => void }) {
  const toast = useToast();
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const act = useAsyncAction(async (action: Action) => {
    await moderateComment(c.id, action);
    if (action === "reply") {
      onChange({ sellerReply: text.trim() });
      setReplying(false);
      setText("");
      toast({ tone: "success", title: "Réponse publiée" });
    } else if (action === "hide") {
      onChange({ hidden: true });
      toast({ tone: "success", title: "Commentaire masqué", description: `De ${c.author}` });
    } else {
      onChange({ reported: true });
      toast({ tone: "success", title: "Commentaire signalé", description: "L’équipe YA YO va l’examiner." });
    }
  });
  const running = (a: Action) => act.pending && act.args?.[0] === a;

  return (
    <li className={cn("p-4 transition-opacity duration-(--duration-base)", c.hidden && "opacity-50")}>
      <div className="flex gap-3">
        <Avatar name={c.author} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="type-label-m">
            {c.author} <span className="type-body-s font-normal text-fg-tertiary">· {c.at}</span>
          </p>
          <p className="mt-0.5 type-body-m">{c.body}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {c.masked && <Badge tone="warning">Masqué automatiquement</Badge>}
            {c.hidden && <Badge className="animate-fade-in">Masqué</Badge>}
            {c.reported && <Badge tone="danger" className="animate-fade-in">Signalé aux administrateurs</Badge>}
          </div>
          {c.sellerReply && (
            <div className="mt-2 animate-page-in rounded-md bg-surface-muted p-3">
              <Badge tone="inverse">Vendeur</Badge>
              <p className="mt-1 type-body-m">{c.sellerReply}</p>
            </div>
          )}
          <ActionError error={act.error} onRetry={() => act.args && act.run(...act.args)} className="mt-3" />
          {replying && (
            <form
              className="mt-3 flex animate-page-in gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) act.run("reply");
              }}
            >
              <Input
                autoFocus
                value={text}
                disabled={act.pending}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && !act.pending && setReplying(false)}
                placeholder="Ta réponse publique…"
                aria-label={`Réponse à ${c.author}`}
                className="h-10"
              />
              <Button type="submit" size="sm" className="h-10" loading={running("reply")} disabled={!text.trim()}>
                Envoyer
              </Button>
              <Button variant="ghost" size="sm" className="h-10" disabled={act.pending} onClick={() => setReplying(false)}>
                Annuler
              </Button>
            </form>
          )}
          {!c.hidden && !replying && (
            <div className="mt-3 flex flex-wrap gap-2">
              {!c.sellerReply && (
                <Button variant="secondary" size="sm" disabled={act.pending} onClick={() => setReplying(true)}>
                  Répondre
                </Button>
              )}
              <Button variant="ghost" size="sm" icon={<EyeOff className="size-3.5" />} loading={running("hide")} disabled={act.pending && !running("hide")} onClick={() => act.run("hide")}>
                Masquer
              </Button>
              {!c.reported && (
                <Button variant="ghost" size="sm" icon={<Flag className="size-3.5" />} loading={running("report")} disabled={act.pending && !running("report")} onClick={() => act.run("report")}>
                  Signaler
                </Button>
              )}
            </div>
          )}
        </div>
        <span className="flex flex-col items-center type-caption text-fg-tertiary">
          <Heart className="size-4.5" />
          {c.likes}
          <span className="sr-only"> j’aime</span>
        </span>
      </div>
    </li>
  );
}
