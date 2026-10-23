"use client";

import { Info, Plus, Tag, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoPicker } from "@/components/seller/photo-picker";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, SwitchRow, Textarea } from "@/components/ui/form";
import { MoneyRow } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { formatFC } from "@/lib/format";
import type { Product } from "@/lib/types";

const COMMISSION = 0.1;
const categories = ["Électronique › Audio", "Électronique › Téléphones", "Mode › Femme", "Mode › Homme", "Beauté", "Maison"];

function Steps({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 type-body-s text-fg-secondary">
      <span className="flex gap-1">
        {[1, 2].map((s) => (
          <span key={s} className={cn("h-1.5 rounded-full", s === step ? "w-5 bg-accent" : "w-1.5 bg-line-strong")} />
        ))}
      </span>
      Étape {step} sur 2 · {step === 1 ? "Photos et description" : "Prix, stock et variantes"}
    </div>
  );
}

/** V9/V10 (création en 2 étapes) and V14/V15 (modification + suppression). */
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const editing = Boolean(product);
  const [step, setStep] = useState<1 | 2>(1);
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 1);
  const [online, setOnline] = useState(product?.online ?? true);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [newColor, setNewColor] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const showStep1 = editing || step === 1;
  const showStep2 = editing || step === 2;

  function submit(kind: "draft" | "publish" | "save") {
    setSaved(kind === "draft" ? "Brouillon enregistré" : kind === "publish" ? "Produit publié" : "Modifications enregistrées");
    setTimeout(() => router.push("/vendeur/produits"), 700);
  }

  return (
    <form className="flex flex-col gap-5 pb-24 lg:pb-0" onSubmit={(e) => e.preventDefault()}>
      {!editing && <Steps step={step} />}

      <div className={cn("grid gap-5", editing && "lg:grid-cols-2 lg:items-start")}>
        {showStep1 && (
          <Card className="flex flex-col gap-5 p-4 md:p-5">
            {editing && <SwitchRow label="Produit en ligne" hint="Visible par les acheteurs" checked={online} onChange={setOnline} />}
            <div className="flex flex-col gap-2">
              <p className="type-label-m">Photos (jusqu’à 6, la première est la couverture)</p>
              <PhotoPicker label="Photos du produit" initial={product ? [product.image] : ["slate", "slate"]} />
            </div>
            <Field label="Nom du produit">{(id) => <Input id={id} defaultValue={product?.name} placeholder="Ex. JBL Go 3 – Enceinte portable" required />}</Field>
            <Field label="Catégorie">
              {(id) => (
                <Select id={id} icon={<Tag />} defaultValue={product?.category ?? categories[0]}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Description" hint="Décris l’état, les dimensions et ce qui est inclus.">
              {(id) => <Textarea id={id} defaultValue={product?.description} placeholder="Son JBL Pro, 5 h d’autonomie, étanche…" />}
            </Field>
          </Card>
        )}

        {showStep2 && (
          <Card className="flex flex-col gap-5 p-4 md:p-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prix de vente (FC)">{(id) => <Input id={id} inputMode="numeric" value={price || ""} onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, "")))} placeholder="95 000" />}</Field>
              <Field label="Prix barré (facultatif)">{(id) => <Input id={id} inputMode="numeric" defaultValue={product?.compareAt} placeholder="118 000" />}</Field>
            </div>
            <div className="rounded-md bg-surface-muted p-4">
              <MoneyRow label="Prix de vente" value={formatFC(price)} />
              <MoneyRow label={`Commission YA YO (${COMMISSION * 100} %)`} value={`− ${formatFC(price * COMMISSION)}`} tone="success" />
              <div className="flex items-baseline justify-between gap-3 border-t border-line-subtle pt-2">
                <span className="type-label-m">Tu reçois (hors livraison)</span>
                <span className="type-h3 tabular-nums">{formatFC(price * (1 - COMMISSION))}</span>
              </div>
            </div>
            <Field label="Quantité en stock" hint="Le produit passe en rupture automatiquement à 0.">
              {(id) => <Input id={id} inputMode="numeric" value={stock} onChange={(e) => setStock(Number(e.target.value.replace(/\D/g, "")))} />}
            </Field>
            {stock > 0 && stock <= 3 && (
              <Alert tone="warning" icon={<TriangleAlert />} title="Stock faible">
                À 0, le produit passe automatiquement en rupture.
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <p className="type-label-m">Couleurs disponibles</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button key={c} type="button" onClick={() => setColors((cs) => cs.filter((x) => x !== c))} className="h-9 rounded-full bg-brand px-3.5 type-label-m text-fg-inverse" aria-label={`Retirer ${c}`}>
                    {c} ×
                  </button>
                ))}
                <span className="flex h-9 items-center gap-1 rounded-full border border-line pr-1 pl-3">
                  <input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Ajouter" aria-label="Nouvelle couleur" className="w-20 bg-transparent type-body-m outline-none" />
                  <button
                    type="button"
                    aria-label="Ajouter la couleur"
                    onClick={() => {
                      if (newColor.trim()) setColors((cs) => [...cs, newColor.trim()]);
                      setNewColor("");
                    }}
                    className="flex size-7 items-center justify-center rounded-full hover:bg-surface-sunken"
                  >
                    <Plus className="size-4" />
                  </button>
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {saved && (
        <Alert tone="success" title={saved}>
          Retour au catalogue…
        </Alert>
      )}

      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line-subtle bg-surface p-4 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto flex max-w-xl flex-col gap-2 lg:mx-0 lg:max-w-none lg:flex-row-reverse lg:justify-start">
          {!editing && step === 1 && (
            <Button size="lg" block className="lg:w-auto" onClick={() => setStep(2)}>
              Continuer
            </Button>
          )}
          {!editing && step === 2 && (
            <div className="flex gap-2 lg:flex-row-reverse">
              <Button size="lg" className="flex-1 lg:flex-none" onClick={() => submit("publish")}>
                Publier le produit
              </Button>
              <Button size="lg" variant="outline" onClick={() => submit("draft")}>
                Brouillon
              </Button>
              <Button size="lg" variant="ghost" className="hidden lg:inline-flex" onClick={() => setStep(1)}>
                Retour
              </Button>
            </div>
          )}
          {editing && (
            <>
              <Button size="lg" block className="lg:w-auto" onClick={() => submit("save")}>
                Enregistrer les modifications
              </Button>
              <Button variant="ghost" icon={<Trash2 className="size-4" />} onClick={() => setConfirmDelete(true)}>
                Supprimer le produit
              </Button>
            </>
          )}
        </div>
      </div>

      <Sheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Supprimer ce produit ?"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="lg" block onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
            <Button variant="danger" size="lg" block onClick={() => router.push("/vendeur/produits")}>
              Supprimer
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-body-m text-fg-secondary">« {product?.name} » sera retiré du catalogue. Les commandes en cours ne sont pas annulées et restent à préparer.</p>
          <Alert tone="info" icon={<Info />} title="Alternative">
            Tu peux aussi le mettre hors ligne pour le republier plus tard.
          </Alert>
        </div>
      </Sheet>
    </form>
  );
}
