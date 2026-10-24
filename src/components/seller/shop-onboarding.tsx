"use client";

import { Clock, FileText, MapPin, Navigation, Store, Tag } from "lucide-react";
import { useState } from "react";
import { PhotoPicker } from "@/components/seller/photo-picker";
import { ActionError, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form";
import { Timeline } from "@/components/ui/timeline";
import { useAsyncAction } from "@/hooks/use-async-action";
import { submitShop } from "@/lib/actions";
import { cn } from "@/lib/cn";

const communes = ["Gombe", "Lingwala", "Kalamu", "Limete", "Lemba", "Ngaliema", "Bandal", "Kintambo", "Masina"];
const titles = ["Boutique", "Vérification", "Validation"];

/** US-10 · V1 → V3: create the shop, send KYC documents, wait for validation. */
export function ShopOnboarding() {
  const [step, setStep] = useState(0);
  const submit = useAsyncAction(async () => {
    await submitShop();
    setStep(2);
  });
  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-5 pb-24 lg:pb-0">
      <div className="flex items-center gap-2 type-body-s text-fg-secondary">
        <span className="flex gap-1">
          {titles.map((t, i) => (
            <span key={t} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-(--duration-base) ease-(--ease-out)", i === step ? "w-5 bg-accent" : i < step ? "w-1.5 bg-accent/50" : "w-1.5 bg-line-strong")} />
          ))}
        </span>
        Étape {step + 1} sur 3 · {titles[step]}
      </div>

      {step === 0 && (
        <Card key="s0" className="flex animate-page-in flex-col gap-5 p-4 md:p-6">
          <div>
            <h2 className="type-h2">Présente ta boutique</h2>
            <p className="type-body-m text-fg-secondary">Ces informations sont visibles par les acheteurs.</p>
          </div>
          <div className="flex items-center gap-4">
            <PhotoPicker max={1} label="Logo de la boutique" />
            <div>
              <p className="type-label-l">Logo de la boutique</p>
              <p className="type-body-s text-fg-tertiary">Carré, 500 × 500 px minimum</p>
            </div>
          </div>
          <Field label="Nom de la boutique">{(id) => <Input id={id} icon={<Store />} defaultValue="JBL Store Kin" />}</Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Catégorie principale">
              {(id) => (
                <Select id={id} icon={<Tag />}>
                  <option>Électronique et audio</option>
                  <option>Mode et beauté</option>
                  <option>Maison</option>
                </Select>
              )}
            </Field>
            <Field label="Commune">
              {(id) => (
                <Select id={id} icon={<MapPin />} defaultValue="Gombe">
                  {communes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <Field label="Adresse de collecte" hint="Le livreur récupère les colis à cette adresse.">
            {(id) => <Input id={id} icon={<Navigation />} defaultValue="Av. du Commerce n°18, Gombe" />}
          </Field>
        </Card>
      )}

      {step === 1 && (
        <Card key="s1" className="flex animate-page-in flex-col gap-5 p-4 md:p-6">
          <div>
            <h2 className="type-h2">Vérifie ton identité</h2>
            <p className="type-body-m text-fg-secondary">Obligatoire pour vendre sur YA YO et recevoir tes paiements.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="type-label-m">Pièce d’identité (carte d’électeur, passeport)</p>
              <PhotoPicker max={2} label="Pièce d’identité" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="type-label-m">Selfie avec la pièce</p>
              <PhotoPicker max={1} label="Selfie avec la pièce" />
            </div>
          </div>
          <Field label="N° RCCM ou patente (facultatif)">{(id) => <Input id={id} icon={<FileText />} placeholder="CD/KIN/RCCM/24-A-01234" />}</Field>
          <Field label="Numéro Mobile Money pour les virements">
            {(id) => (
              <div className="flex gap-2">
                <span className="flex h-12 items-center rounded-md bg-surface-sunken px-3 type-label-m">🇨🇩 +243</span>
                <Input id={id} inputMode="tel" placeholder="81 234 5678" />
              </div>
            )}
          </Field>
          <Alert tone="info" title="Tes documents restent privés">
            Seule l’équipe YA YO les consulte pour valider ton compte.
          </Alert>
        </Card>
      )}

      {step === 2 && (
        <Card key="s2" className="flex animate-page-in flex-col items-center gap-5 p-6 text-center md:p-10">
          <span className="flex size-24 items-center justify-center rounded-full bg-warning-subtle text-fg-warning">
            <Clock className="size-10" />
          </span>
          <div>
            <h2 className="type-h2">Ta boutique est en cours de vérification</h2>
            <p className="mx-auto mt-2 max-w-md type-body-m text-fg-secondary">Notre équipe valide ton dossier sous 24 à 48 h. Tu peux déjà préparer ton catalogue : il sera publié dès la validation.</p>
          </div>
          <Badge tone="warning">En attente de validation</Badge>
          <div className="self-stretch text-left md:mx-auto md:w-80">
            <Timeline
              steps={[
                { title: "Boutique créée", detail: "JBL Store Kin", state: "done" },
                { title: "Vérification des documents", detail: "En cours", state: "current" },
                { title: "Boutique publiée", detail: "Visible par les acheteurs", state: "upcoming" },
              ]}
            />
          </div>
        </Card>
      )}

      <ActionError error={submit.error} onRetry={() => submit.run()} />

      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line-subtle bg-surface p-4 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto flex max-w-xl gap-2 lg:mx-0">
          {step > 0 && step < 2 && (
            <Button variant="outline" size="lg" disabled={submit.pending} onClick={() => go(step - 1)}>
              Retour
            </Button>
          )}
          {step < 2 ? (
            <Button size="lg" className="flex-1 lg:flex-none lg:px-10" loading={submit.pending} onClick={() => (step === 0 ? go(1) : submit.run())}>
              {step === 0 ? "Continuer" : "Envoyer pour vérification"}
            </Button>
          ) : (
            <ButtonLink href="/vendeur/produits/nouveau" size="lg" block className="lg:w-auto">
              Ajouter mes premiers produits
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}
