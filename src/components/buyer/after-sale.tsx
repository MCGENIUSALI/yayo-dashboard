"use client";

import { Camera, CircleCheck, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChoiceChips, RadioCard } from "@/components/buyer/choice";
import { TopBar } from "@/components/buyer/top-bar";
import { BottomBar, InverseNote } from "@/components/buyer/ui";
import { ActionError } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { addDisputeInfo, openDispute, submitReview } from "@/lib/actions";
import { cn } from "@/lib/cn";

function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} étoile${i > 1 ? "s" : ""}`} onClick={() => onChange(i)} className="pressable p-1">
          <Star className={cn("size-9", i <= value ? "fill-warning text-warning" : "text-line-strong")} />
        </button>
      ))}
    </div>
  );
}

const tags = ["Conforme", "Bien emballé", "Rapide"];

/* ---------- D3 ---------- */

export function ReviewForm({ orderId, shopName, courier, deliveredAt }: { orderId: string; shopName: string; courier: string; deliveredAt: string }) {
  const router = useRouter();
  const toast = useToast();
  const [shopStars, setShopStars] = useState(0);
  const [courierStars, setCourierStars] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const send = useAsyncAction(async () => {
    await submitReview();
    toast({ tone: "success", title: "Merci pour ton avis !", description: `Il aide les acheteurs à choisir ${shopName}.` });
    router.push("/acheteur/commandes");
  });
  return (
    <>
      <TopBar title="Commande livrée" fallback="/acheteur/commandes" />
      <div className="flex flex-col gap-4 px-5 py-2">
        <div className="flex gap-3 rounded-lg bg-success-subtle p-4">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-fg-success" />
          <div>
            <p className="type-label-m text-fg-success">Livrée le {deliveredAt}</p>
            <p className="type-body-s text-fg-secondary">{courier} a validé la remise avec ton code. Le vendeur sera payé dans 48 h si tout est en ordre.</p>
          </div>
        </div>
        <section className="flex flex-col gap-4 rounded-xl bg-surface p-5 text-center">
          <h2 className="type-h4">Comment était ta commande chez {shopName} ?</h2>
          <StarInput value={shopStars} onChange={setShopStars} label={`Note de ${shopName}`} />
          <ChoiceChips label="Points forts" items={tags} selected={picked} onToggle={(t) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))} className="justify-center" />
          <div className="text-left">
            <Field label="Ton avis (facultatif)">{(id) => <Textarea id={id} placeholder="Très bon son, conforme à la photo." value={text} onChange={(e) => setText(e.target.value)} />}</Field>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-xl bg-surface p-5">
          <p className="flex items-center justify-center gap-3 type-h4">
            <Avatar name={courier} verified size="sm" /> Et la livraison avec {courier} ?
          </p>
          <StarInput value={courierStars} onChange={setCourierStars} label={`Note de ${courier}`} />
        </section>
        <ActionError error={send.error} onRetry={() => send.run()} />
      </div>
      <BottomBar className="flex flex-col gap-2">
        <Button size="lg" block disabled={!shopStars || !courierStars} loading={send.busy} onClick={() => send.run()}>
          Publier mon avis
        </Button>
        <ButtonLink href={`/acheteur/commandes/${orderId}/probleme`} variant="ghost" size="lg" block>
          J’ai un problème avec cette commande
        </ButtonLink>
      </BottomBar>
    </>
  );
}

/* ---------- D4 ---------- */

const reasons = ["Colis non reçu", "Produit non conforme ou abîmé", "Article manquant", "Autre problème"];

export function DisputeForm({ orderId, shopName }: { orderId: string; shopName: string }) {
  const router = useRouter();
  const [reason, setReason] = useState(reasons[1]);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const file = useRef<HTMLInputElement>(null);
  const send = useAsyncAction(async () => {
    const d = await openDispute(orderId);
    router.push(`/acheteur/litiges/${d.id}`);
  });
  const tooShort = text.trim().length < 10;
  return (
    <>
      <TopBar title="Signaler un problème" fallback={`/acheteur/commandes/${orderId}`} />
      <div className="flex flex-col gap-5 px-5 py-2">
        <p className="type-label-m text-fg-secondary">
          Commande #{orderId} · {shopName}
        </p>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-3 type-h4">Quel est le problème ?</legend>
          {reasons.map((r) => (
            <RadioCard key={r} name="reason" value={r} checked={reason === r} onChange={setReason} title={r} />
          ))}
        </fieldset>
        <Field label="Décris le problème" error={text && tooShort ? "Ajoute quelques mots (10 caractères minimum)." : undefined}>
          {(id) => <Textarea id={id} placeholder="Reçu en bleu, j’avais commandé la jaune." value={text} onChange={(e) => setText(e.target.value)} />}
        </Field>
        <div>
          <p className="mb-2 type-label-m">Photos du produit reçu</p>
          <div className="flex flex-wrap gap-3">
            {photos.map((src, i) => (
              <span key={src} className="relative size-24 overflow-hidden rounded-lg bg-surface-sunken">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                <img src={src} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                <button type="button" aria-label={`Retirer la photo ${i + 1}`} onClick={() => setPhotos(photos.filter((p) => p !== src))} className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-surface shadow-e1">
                  <X className="size-4" />
                </button>
              </span>
            ))}
            {photos.length < 4 && (
              <button type="button" onClick={() => file.current?.click()} className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line-strong type-label-s text-fg-secondary hover:bg-surface-muted">
                <Camera className="size-5" /> Ajouter
              </button>
            )}
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f))].slice(0, 4))} />
          </div>
        </div>
        <InverseNote title="Les fonds restent bloqués">Le vendeur n’est pas payé tant que YA YO n’a pas tranché le litige (sous 72 h).</InverseNote>
        <ActionError error={send.error} onRetry={() => send.run()} />
      </div>
      <BottomBar>
        <Button variant="danger" size="lg" block disabled={tooShort} loading={send.busy} onClick={() => send.run()}>
          Envoyer le signalement
        </Button>
      </BottomBar>
    </>
  );
}

/* ---------- D5 action ---------- */

export function DisputeInfo({ id }: { id: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const send = useAsyncAction(async () => {
    await addDisputeInfo(id);
    setOpen(false);
    setText("");
    toast({ tone: "success", title: "Information ajoutée", description: "L’équipe YA YO la prend en compte." });
  });
  return (
    <>
      <BottomBar>
        <Button variant="outline" size="lg" block onClick={() => setOpen(true)}>
          Ajouter une information
        </Button>
      </BottomBar>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Ajouter une information"
        busy={send.pending}
        footer={
          <Button size="lg" block disabled={!text.trim()} loading={send.busy && open} onClick={() => send.run()}>
            Envoyer
          </Button>
        }
      >
        <ActionError error={send.error} onRetry={() => send.run()} className="mb-3" />
        <Field label="Message pour l’équipe YA YO">{(id) => <Textarea id={id} value={text} onChange={(e) => setText(e.target.value)} placeholder="Le livreur m’a confirmé…" />}</Field>
      </Sheet>
    </>
  );
}
