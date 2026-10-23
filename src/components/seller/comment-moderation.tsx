"use client";

import { EyeOff, Flag, Heart, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import type { Comment } from "@/lib/types";

/** US-25: reply, hide or report public comments. */
export function CommentModeration({ initial }: { initial: Comment[] }) {
  const [comments, setComments] = useState(initial);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [text, setText] = useState("");

  const update = (id: string, patch: Partial<Comment>) => setComments((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const pending = comments.filter((c) => !c.hidden && !c.sellerReply).length;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-h4">Commentaires à modérer ({pending})</h2>
      <ul className="flex flex-col divide-y divide-line-subtle rounded-lg border border-line-subtle bg-surface">
        {comments.map((c) => (
          <li key={c.id} className={c.hidden ? "p-4 opacity-50" : "p-4"}>
            <div className="flex gap-3">
              <Avatar name={c.author} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="type-label-m">
                  {c.author} <span className="type-body-s font-normal text-fg-tertiary">· {c.at}</span>
                </p>
                <p className="mt-0.5 type-body-m">{c.body}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {c.masked && <Badge tone="warning">Masqué automatiquement</Badge>}
                  {c.hidden && <Badge>Masqué</Badge>}
                  {c.reported && <Badge tone="danger">Signalé aux administrateurs</Badge>}
                </div>
                {c.sellerReply && (
                  <div className="mt-2 rounded-md bg-surface-muted p-3">
                    <Badge tone="inverse">Vendeur</Badge>
                    <p className="mt-1 type-body-m">{c.sellerReply}</p>
                  </div>
                )}
                {replyTo === c.id && (
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!text.trim()) return;
                      update(c.id, { sellerReply: text.trim() });
                      setReplyTo(null);
                      setText("");
                    }}
                  >
                    <Input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Ta réponse publique…" aria-label="Réponse" className="h-10" />
                    <Button type="submit" size="sm" className="h-10">
                      Envoyer
                    </Button>
                  </form>
                )}
                {!c.hidden && replyTo !== c.id && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!c.sellerReply && (
                      <Button variant="secondary" size="sm" onClick={() => setReplyTo(c.id)}>
                        Répondre
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" icon={<EyeOff className="size-3.5" />} onClick={() => update(c.id, { hidden: true })}>
                      Masquer
                    </Button>
                    {!c.reported && (
                      <Button variant="ghost" size="sm" icon={<Flag className="size-3.5" />} onClick={() => update(c.id, { reported: true })}>
                        Signaler
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <span className="flex flex-col items-center type-caption text-fg-tertiary">
                <Heart className="size-4.5" />
                {c.likes}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <Alert tone="info" icon={<ShieldCheck />} title="Modération YA YO">
        Les commentaires avec numéro, lien ou demande de paiement hors application sont masqués et signalés aux administrateurs.
      </Alert>
    </section>
  );
}
