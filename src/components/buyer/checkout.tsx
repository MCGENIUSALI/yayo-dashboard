"use client";

import { Banknote, Check, Clock, CreditCard, LoaderCircle, Lock, MapPin, Package, Plus, RotateCw, ShieldCheck, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChoiceChips, RadioCard } from "@/components/buyer/choice";
import { PhoneInput } from "@/components/buyer/phone-input";
import { methodLabel, useBuyer, type PayMethod } from "@/components/buyer/store";
import { TopBar } from "@/components/buyer/top-bar";
import { BottomBar, EscrowCard, InverseNote, StatusCircle, StepDots } from "@/components/buyer/ui";
import { ActionError, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { MoneyRow } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";
import { useAsyncAction } from "@/hooks/use-async-action";
import { awaitMobileMoney, placeOrder } from "@/lib/actions";
import { addresses as seedAddresses, PROMO, slots } from "@/lib/data/buyer";
import { formatFC, formatUSD } from "@/lib/format";
import type { Address } from "@/lib/types";

/** Sends the buyer back to the cart when there is nothing to check out (direct link, reload). */
function useRequireCart() {
  const { lines } = useBuyer();
  const router = useRouter();
  const empty = lines.length === 0;
  useEffect(() => {
    if (empty) router.replace("/acheteur/panier");
  }, [empty, router]);
  return !empty;
}

/* ---------- C2 · Livraison ---------- */

export function DeliveryStep() {
  const { checkout, setCheckout, totals } = useBuyer();
  const router = useRouter();
  const ready = useRequireCart();
  const [addresses, setAddresses] = useState<Address[]>(seedAddresses);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: "", line: "" });
  if (!ready) return null;
  return (
    <>
      <TopBar title="Livraison" fallback="/acheteur/panier" />
      <div className="flex flex-col gap-5 px-6 pt-2 pb-6">
        <StepDots step={1} total={3} label="Adresse et créneau" />
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 type-h4">Adresse de livraison</legend>
          {addresses.map((a) => (
            <RadioCard key={a.id} name="address" value={a.id} checked={checkout.addressId === a.id} onChange={(v) => setCheckout({ addressId: v })} icon={<MapPin />} title={a.label}>
              {a.line}
              <span className="block type-caption text-fg-tertiary">{a.phone}</span>
            </RadioCard>
          ))}
          <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-2 self-start py-2 type-label-m">
            <Plus className="size-4.5" /> Ajouter une adresse
          </button>
        </fieldset>
        <div>
          <p className="mb-3 type-h4">Créneau de livraison</p>
          <ChoiceChips label="Créneau de livraison" items={slots} selected={[checkout.slot]} onToggle={(v) => setCheckout({ slot: v })} />
        </div>
        <Field label="Indication pour le livreur (facultatif)">{(id) => <Input id={id} placeholder="Portail bleu, face à la pharmacie" value={checkout.note} onChange={(e) => setCheckout({ note: e.target.value })} />}</Field>
        {totals.shops > 1 && (
          <Alert tone="info" icon={<Package />} title={`${totals.shops} colis, ${totals.shops} livraisons`}>
            Chaque vendeur expédie séparément. Tu recevras un code de réception par colis.
          </Alert>
        )}
      </div>
      <BottomBar>
        <Button size="lg" block onClick={() => router.push("/acheteur/commander/paiement")}>
          Continuer vers le paiement
        </Button>
      </BottomBar>
      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title="Nouvelle adresse"
        footer={
          <Button
            size="lg"
            block
            disabled={!draft.label.trim() || !draft.line.trim()}
            onClick={() => {
              const a: Address = { id: `a${addresses.length + 1}`, label: draft.label.trim(), line: draft.line.trim(), phone: "+243 81 234 5678", kind: "home" };
              setAddresses([...addresses, a]);
              setCheckout({ addressId: a.id });
              setDraft({ label: "", line: "" });
              setAdding(false);
            }}
          >
            Enregistrer l’adresse
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nom de l’adresse">{(id) => <Input id={id} placeholder="Chez maman" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />}</Field>
          <Field label="Adresse" hint="Numéro, avenue, quartier, commune">
            {(id) => <Textarea id={id} placeholder="8, av. de la Libération, Q. Binza, Ngaliema" value={draft.line} onChange={(e) => setDraft({ ...draft, line: e.target.value })} />}
          </Field>
        </div>
      </Sheet>
    </>
  );
}

/* ---------- C3 · Paiement ---------- */

const methods: { value: PayMethod; title: string; body: string; icon: React.ReactNode }[] = [
  { value: "momo", title: "Mobile Money", body: "M-Pesa, Orange Money, Airtel Money", icon: <Smartphone /> },
  { value: "cash", title: "Cash à la livraison", body: "Tu paies le livreur à la réception", icon: <Banknote /> },
  { value: "card", title: "Carte bancaire", body: "Visa, Mastercard", icon: <CreditCard /> },
];

export function PaymentStep() {
  const { checkout, setCheckout, totals, confirmOrder } = useBuyer();
  const router = useRouter();
  const ready = useRequireCart();
  const phoneOk = checkout.phone.replace(/\D/g, "").length === 9;
  const place = useAsyncAction(async () => {
    const order = await placeOrder(checkout.method);
    if (checkout.method === "momo") router.push("/acheteur/commander/validation");
    else {
      confirmOrder(order.id);
      router.push("/acheteur/commander/confirmee");
    }
  });
  if (!ready) return null;
  return (
    <>
      <TopBar title="Paiement" fallback="/acheteur/commander/livraison" />
      <div className="flex flex-col gap-5 px-6 pt-2 pb-6">
        <StepDots step={2} total={3} label="Moyen de paiement" />
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 type-h4">Comment veux-tu payer ?</legend>
          {methods.map((m) => (
            <RadioCard key={m.value} name="method" value={m.value} checked={checkout.method === m.value} onChange={(v) => setCheckout({ method: v as PayMethod })} icon={m.icon} title={m.title}>
              {m.body}
            </RadioCard>
          ))}
        </fieldset>
        {checkout.method === "momo" && (
          <Field label="Numéro Mobile Money" error={checkout.phone && !phoneOk ? "Saisis les 9 chiffres après +243." : undefined}>
            {(id) => <PhoneInput id={id} value={checkout.phone} onChange={(e) => setCheckout({ phone: e.target.value })} placeholder="81 234 5678" />}
          </Field>
        )}
        {checkout.method === "cash" && (
          <Alert tone="info" title="Prépare le montant exact">
            Le livreur encaisse {formatFC(totals.total)} et YA YO garde l’argent jusqu’à ta confirmation de réception.
          </Alert>
        )}
        <section aria-label="Récapitulatif" className="rounded-xl bg-surface p-4">
          <MoneyRow label={`Articles (${totals.items})`} value={formatFC(totals.subtotal)} />
          <MoneyRow label={`Livraison (${totals.shops} vendeur${totals.shops > 1 ? "s" : ""})`} value={formatFC(totals.delivery)} />
          {totals.promo > 0 && <MoneyRow label={`Code promo ${PROMO.code}`} value={`− ${formatFC(totals.promo)}`} tone="success" />}
          <div className="mt-2 border-t border-line-subtle">
            <MoneyRow strong label="Total" value={formatFC(totals.total)} />
          </div>
          <p className="text-right type-body-s text-fg-tertiary">{formatUSD(totals.total)} · taux indicatif</p>
        </section>
        <EscrowCard />
        <ActionError error={place.error} onRetry={() => place.run()} />
      </div>
      <BottomBar>
        <Button size="lg" block icon={<Lock className="size-5" />} loading={place.busy} disabled={checkout.method === "momo" && !phoneOk} onClick={() => place.run()}>
          {checkout.method === "cash" ? `Commander · ${formatFC(totals.total)}` : `Payer ${formatFC(totals.total)}`}
        </Button>
      </BottomBar>
    </>
  );
}

/* ---------- C4 · Validation Mobile Money ---------- */

const EXPIRY = 105;

export function MobileMoneyStep() {
  const { checkout, totals, confirmOrder } = useBuyer();
  const router = useRouter();
  const ready = useRequireCart();
  const [left, setLeft] = useState(EXPIRY);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(-1);

  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [attempt]);

  useEffect(() => {
    if (!ready || started.current === attempt) return;
    started.current = attempt;
    let alive = true;
    awaitMobileMoney()
      .then(() => {
        if (!alive) return;
        confirmOrder("YY-24880");
        router.replace("/acheteur/commander/confirmee");
      })
      .catch((e: Error) => alive && router.replace(`/acheteur/commander/echec?motif=${encodeURIComponent(e.message)}`));
    return () => {
      alive = false;
    };
  }, [ready, attempt, confirmOrder, router]);

  if (!ready) return null;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <>
      <TopBar title="Paiement en cours" fallback="/acheteur/commander/paiement" />
      <div className="flex flex-1 flex-col items-center gap-4 px-6 pt-8 pb-6 text-center">
        <StatusCircle tone="accent">
          <Smartphone strokeWidth={1.5} />
        </StatusCircle>
        <Badge tone="warning" icon={<LoaderCircle className="animate-spin" />}>
          En attente de paiement
        </Badge>
        <h1 className="type-h2">Valide le paiement sur ton téléphone</h1>
        <p className="type-body-m text-fg-secondary" aria-live="polite">
          Une demande {methodLabel.momo} de {formatFC(totals.total)} a été envoyée au +243 {checkout.phone}. Saisis ton code PIN pour confirmer.
        </p>
        <p className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 type-label-m shadow-e1" role="timer">
          <Clock className="size-5 text-fg-secondary" />
          {left ? `La demande expire dans ${mm}:${ss}` : "La demande a expiré"}
        </p>
        <InverseNote title="Ton argent est protégé" className="mt-2 w-full text-left">
          Après validation, YA YO conserve les fonds jusqu’à la livraison. Le vendeur n’est payé qu’après ta réception.
        </InverseNote>
      </div>
      <div className="flex flex-col gap-2 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button
          variant="outline"
          size="lg"
          block
          onClick={() => {
            setLeft(EXPIRY);
            setAttempt((a) => a + 1);
          }}
        >
          Renvoyer la demande
        </Button>
        <ButtonLink href="/acheteur/commander/paiement" variant="ghost" size="lg" block>
          Changer de moyen de paiement
        </ButtonLink>
      </div>
    </>
  );
}

/* ---------- C5 · Commande confirmée ---------- */

export function ConfirmedStep() {
  const { placed, clearCart } = useBuyer();
  const router = useRouter();
  useEffect(() => {
    if (!placed) router.replace("/acheteur/commandes");
    else clearCart();
  }, [placed, router, clearCart]);
  if (!placed) return null;
  const paid = placed.method !== "cash";
  return (
    <div className="flex flex-1 flex-col gap-5 px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-3 text-center">
        <StatusCircle tone="success">
          <Check strokeWidth={1.5} />
        </StatusCircle>
        <h1 className="mt-2 type-h2">Commande confirmée !</h1>
        <p className="type-body-m text-fg-secondary">
          Commande #{placed.id} · {placed.items} article{placed.items > 1 ? "s" : ""} chez {placed.shops} vendeur{placed.shops > 1 ? "s" : ""}. {placed.shops > 1 ? "Les vendeurs préparent tes colis." : "Le vendeur prépare ton colis."}
        </p>
        <Badge tone={paid ? "inverse" : "warning"} icon={<ShieldCheck />}>
          {paid ? "Fonds sécurisés" : "Paiement à la livraison"}
        </Badge>
      </div>
      <EscrowCard />
      <section className="rounded-xl bg-surface p-4">
        <MoneyRow label={paid ? `Payé via ${methodLabel[placed.method]}` : "À payer au livreur"} value={formatFC(placed.total)} />
        <MoneyRow label="Livraison estimée" value={placed.slot === slots[0] ? "Aujourd’hui" : placed.slot} />
        <MoneyRow label="Codes de réception" value="Dans le suivi" />
      </section>
      <div className="mt-auto flex flex-col gap-3">
        <ButtonLink href="/acheteur/commandes" size="lg" block>
          Suivre ma commande
        </ButtonLink>
        <ButtonLink href="/acheteur" variant="outline" size="lg" block>
          Continuer mes achats
        </ButtonLink>
      </div>
    </div>
  );
}

/* ---------- C6 · Paiement échoué ---------- */

export function FailedStep({ reason }: { reason?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-5 px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-3 text-center">
        <StatusCircle tone="danger">
          <X strokeWidth={1.5} />
        </StatusCircle>
        <h1 className="mt-2 type-h2">Le paiement n’a pas abouti</h1>
        <p className="type-body-m text-fg-secondary">Aucun montant n’a été débité. Ta commande est gardée 30 minutes, tu peux réessayer.</p>
        <Badge tone="danger">Paiement échoué</Badge>
      </div>
      <Alert tone="danger" title={(reason ?? "Solde Mobile Money insuffisant.").replace(/\s*Vérifie.*$/, "").replace(/\.$/, "")}>
        Recharge ton compte M-Pesa ou choisis le paiement à la livraison.
      </Alert>
      <div className="mt-auto flex flex-col gap-3">
        <ButtonLink href="/acheteur/commander/validation" size="lg" block icon={<RotateCw className="size-5" />}>
          Réessayer
        </ButtonLink>
        <ButtonLink href="/acheteur/commander/paiement" variant="outline" size="lg" block>
          Choisir un autre moyen
        </ButtonLink>
      </div>
      <p className="text-center type-body-s text-fg-tertiary">
        Besoin d’aide ? <Link href="/acheteur/compte" className="underline">Centre d’aide</Link>
      </p>
    </div>
  );
}
