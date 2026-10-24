"use client";

import { Clapperboard, Image as ImageIcon, Link2, MessageCircle, Repeat2, ShoppingCart, Volume2, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, Field, Input, SwitchRow } from "@/components/ui/form";
import { PostTile, ProductThumb } from "@/components/ui/media";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { publishPost } from "@/lib/actions";
import { cn } from "@/lib/cn";
import { formatFC, formatUSD } from "@/lib/format";
import type { Product } from "@/lib/types";

const MAX_LINKED = 5;
/** Phone numbers and links are masked in captions (no direct buyer-seller contact). */
const CONTACT_RE = /(\+?243[\s.-]?\d[\d\s.-]{6,}|\b0\d{9}\b|https?:\/\/\S+|wa\.me\/\S+)/i;

/** SV2 · Nouvelle publication + SV3 · Lier des produits. */
export function PostComposer({ products }: { products: Product[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"video" | "photo">("video");
  const [caption, setCaption] = useState("Le son 360° de la JBL Pulse en vrai 🔊 #kinshasa");
  const [linked, setLinked] = useState<string[]>(["p4", "p1"]);
  const [picker, setPicker] = useState(false);
  const [draft, setDraft] = useState<string[]>(linked);
  const [opts, setOpts] = useState({ comments: true, share: true, order: true });

  const linkable = products.filter((p) => p.online);
  const hasContact = CONTACT_RE.test(caption);

  const toast = useToast();
  const publish = useAsyncAction(async (scheduled: boolean) => {
    await publishPost(scheduled);
    toast({ tone: "success", title: scheduled ? "Publication programmée" : "Publication en ligne", description: `${linked.length} produit${linked.length > 1 ? "s" : ""} lié${linked.length > 1 ? "s" : ""}` });
    router.push("/vendeur/contenus");
  });
  const scheduled = publish.args?.[0] === true;

  return (
    <div className="flex flex-col gap-5 pb-24 lg:pb-0">
      <Segmented
        value={kind}
        onChange={setKind}
        items={[
          { value: "video", label: "Vidéo" },
          { value: "photo", label: "Photos" },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <Card className="flex flex-col gap-5 p-4 md:p-5">
          <div className="flex gap-3">
            <PostTile swatch="sun" caption="Aperçu" kind={kind} className="w-32 shrink-0 md:w-40" />
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" icon={kind === "video" ? <Video className="size-4" /> : <ImageIcon className="size-4" />}>
                {kind === "video" ? "Changer la vidéo" : "Ajouter des photos"}
              </Button>
              <Button variant="secondary" size="sm" icon={<Clapperboard className="size-4" />}>
                Couverture
              </Button>
              {kind === "video" && (
                <Button variant="secondary" size="sm" icon={<Volume2 className="size-4" />}>
                  Son
                </Button>
              )}
            </div>
          </div>
          <Field label="Légende" error={hasContact ? "Numéro ou lien détecté : il sera masqué à la publication." : undefined} hint="Pas de numéro ni de lien de paiement : ils seront masqués.">
            {(id) => <Input id={id} value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={220} aria-invalid={hasContact || undefined} />}
          </Field>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-4 md:p-5">
            <div className="flex items-center justify-between">
              <h2 className="type-h4">Produits liés ({linked.length})</h2>
              <button
                type="button"
                onClick={() => {
                  setDraft(linked);
                  setPicker(true);
                }}
                className="pressable inline-flex items-center gap-1.5 rounded-sm type-label-m hover:underline"
              >
                <Link2 className="size-4" /> Lier un produit
              </button>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {linked.map((id) => {
                const p = products.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <li key={id} className="flex items-center gap-3 rounded-md border border-line-subtle p-2.5">
                    <ProductThumb swatch={p.image} name={p.name} className="size-11" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate type-label-m">{p.name}</p>
                      <p className="type-price-s">
                        {formatFC(p.price)} <span className="type-body-s font-normal text-fg-tertiary">{formatUSD(p.price)}</span>
                      </p>
                    </div>
                    <Button variant="accent" size="sm" icon={<ShoppingCart className="size-3.5" />} onClick={() => setLinked((l) => l.filter((x) => x !== id))}>
                      Retirer
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="divide-y divide-line-subtle px-4 md:px-5">
            <SwitchRow icon={<MessageCircle />} label="Autoriser les commentaires" hint="Modérés automatiquement" checked={opts.comments} onChange={(v) => setOpts({ ...opts, comments: v })} />
            <SwitchRow icon={<Repeat2 />} label="Autoriser le partage et la republication" checked={opts.share} onChange={(v) => setOpts({ ...opts, share: v })} />
            <SwitchRow icon={<ShoppingCart />} label="Bouton « Commander » sur la publication" hint="Ouvre l’achat rapide sous séquestre" checked={opts.order} onChange={(v) => setOpts({ ...opts, order: v })} />
          </Card>
        </div>
      </div>

      <ActionError error={publish.error} onRetry={() => publish.run(scheduled)} />

      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line-subtle bg-surface p-4 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto flex max-w-xl gap-2 lg:mx-0">
          <Button variant="outline" size="lg" loading={publish.busy && scheduled} disabled={publish.busy && !scheduled} onClick={() => publish.run(true)}>
            Programmer
          </Button>
          <Button size="lg" className="flex-1 lg:flex-none lg:px-10" loading={publish.busy && !scheduled} disabled={publish.busy && scheduled} onClick={() => publish.run(false)}>
            Publier
          </Button>
        </div>
      </div>

      <Sheet
        open={picker}
        onClose={() => setPicker(false)}
        title="Lier des produits"
        footer={
          <Button
            size="lg"
            block
            onClick={() => {
              setLinked(draft);
              setPicker(false);
            }}
          >
            Lier {draft.length} produit{draft.length > 1 ? "s" : ""}
          </Button>
        }
      >
        <p className="mb-3 type-body-s text-fg-secondary">
          Seuls tes produits en ligne et en stock peuvent être liés ({MAX_LINKED} maximum).
        </p>
        <ul className="flex flex-col">
          {linkable.map((p) => {
            const out = p.stock === 0;
            const checked = draft.includes(p.id);
            const full = !checked && draft.length >= MAX_LINKED;
            return (
              <li key={p.id}>
                <label className={cn("-mx-2 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-(--duration-instant) hover:bg-surface-muted", (out || full) && "cursor-not-allowed opacity-50 hover:bg-transparent")}>
                  <ProductThumb swatch={p.image} name={p.name} className="size-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate type-label-m">{p.name}</span>
                    <span className="type-body-s text-fg-tertiary">
                      {formatFC(p.price)} · {out ? "Rupture" : `${p.stock} en stock`}
                    </span>
                  </span>
                  <Checkbox label={p.name} checked={checked} disabled={out || full} onChange={(v) => setDraft((d) => (v ? [...d, p.id] : d.filter((x) => x !== p.id)))} />
                </label>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </div>
  );
}
