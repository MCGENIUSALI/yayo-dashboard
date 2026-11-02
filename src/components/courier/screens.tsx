"use client";

import { ArrowRight, Banknote, Bike, Camera, Check, CircleCheck, CircleHelp, CircleX, Info, LogOut, MapPin, Navigation, PackageCheck, Phone, Power, ShieldCheck, Smartphone, Store, TrendingUp, TriangleAlert, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChoiceChips, RadioCard } from "@/components/buyer/choice";
import { OtpInput } from "@/components/buyer/otp-input";
import { PhoneInput } from "@/components/buyer/phone-input";
import { TopBar } from "@/components/buyer/top-bar";
import { BottomBar, InverseNote, ScreenHeader, StatusCircle, StepDots, Stars } from "@/components/buyer/ui";
import { MissionCard, NextMissionRow, Stop } from "@/components/courier/mission-card";
import { useCourier } from "@/components/courier/store";
import { ActionError, Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { ListRow, MoneyRow } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Timeline } from "@/components/ui/timeline";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { acceptMission, confirmDelivery, confirmPickup, reportIncident, returnCash, setAvailability, submitCourierKyc } from "@/lib/actions";
import { courier, earnings, history, type Mission } from "@/lib/data/courier";
import { cn } from "@/lib/cn";
import { formatFC } from "@/lib/format";

/* ---------- L1 + L2 · Devenir livreur ---------- */

const docs = [
  { id: "id", title: "Pièce d’identité", hint: "Carte d’électeur ou passeport" },
  { id: "license", title: "Permis de conduire", hint: "Recto et verso" },
  { id: "registration", title: "Carte grise du véhicule", hint: "Au nom du livreur ou avec procuration" },
  { id: "selfie", title: "Selfie avec la pièce", hint: "Visage et pièce bien lisibles" },
];

export function CourierSignup() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [vehicle, setVehicle] = useState("Moto");
  const [plate, setPlate] = useState("");
  const [zone, setZone] = useState("Gombe, Kalamu, Lingwala");
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const target = useRef("");
  const needsPlate = vehicle === "Moto" || vehicle === "Voiture";
  const step1Ok = (!needsPlate || plate.trim().length >= 4) && phone.replace(/\D/g, "").length === 9;
  const required = docs.filter((d) => needsPlate || (d.id !== "license" && d.id !== "registration"));
  const step2Ok = required.every((d) => files[d.id]);
  const send = useAsyncAction(async () => {
    await submitCourierKyc();
    router.push("/livreur/inscription/validation");
  });

  return (
    <>
      <TopBar title="Devenir livreur" fallback="/acheteur/compte" />
      {step === 1 ? (
        <form
          id="step1"
          className="flex flex-col gap-5 px-6 pt-2 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (step1Ok) {
              setTouched(false);
              setStep(2);
            }
          }}
        >
          <StepDots step={1} total={2} label="Profil et véhicule" />
          <div>
            <h1 className="type-h2">Parle-nous de toi</h1>
            <p className="mt-1 type-body-m text-fg-secondary">Ces informations servent à te proposer des missions près de chez toi.</p>
          </div>
          <div>
            <p className="mb-2 type-label-m">Moyen de transport</p>
            <ChoiceChips label="Moyen de transport" items={["Moto", "Voiture", "Vélo", "À pied"]} selected={[vehicle]} onToggle={setVehicle} />
          </div>
          {needsPlate && (
            <Field label="Plaque d’immatriculation" error={touched && plate.trim().length < 4 ? "Saisis la plaque de ton véhicule." : undefined}>
              {(id) => <Input id={id} icon={<Bike />} value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="KN 4521 BB" />}
            </Field>
          )}
          <Field label="Zone de travail">
            {(id) => (
              <Select id={id} icon={<MapPin />} value={zone} onChange={(e) => setZone(e.target.value)}>
                {["Gombe, Kalamu, Lingwala", "Lemba, Limete, Matete", "Ngaliema, Kintambo, Bandal", "Masina, N’djili, Kimbanseke"].map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Numéro Mobile Money pour tes gains" error={touched && phone.replace(/\D/g, "").length !== 9 ? "Saisis les 9 chiffres après +243." : undefined}>
            {(id) => <PhoneInput id={id} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="99 876 5432" />}
          </Field>
        </form>
      ) : (
        <div className="flex flex-col gap-5 px-6 pt-2 pb-6">
          <StepDots step={2} total={2} label="Documents" />
          <div>
            <h1 className="type-h2">Vérification d’identité</h1>
            <p className="mt-1 type-body-m text-fg-secondary">Obligatoire : l’équipe YA YO valide chaque livreur avant sa première mission.</p>
          </div>
          <ul className="flex flex-col gap-4">
            {required.map((d) => (
              <li key={d.id} className="flex items-center gap-4">
                {files[d.id] ? (
                  <span className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                    <img src={files[d.id]} alt={d.title} className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Retirer ${d.title}`}
                      onClick={() => setFiles((s) => Object.fromEntries(Object.entries(s).filter(([k]) => k !== d.id)))}
                      className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-surface shadow-e1"
                    >
                      <X className="size-4" />
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      target.current = d.id;
                      picker.current?.click();
                    }}
                    className={cn("flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed type-label-s text-fg-secondary hover:bg-surface-muted", touched ? "border-danger" : "border-line-strong")}
                  >
                    <Camera className="size-5" /> Ajouter
                  </button>
                )}
                <div className="min-w-0">
                  <p className="type-label-l">{d.title}</p>
                  <p className="type-body-s text-fg-tertiary">{d.hint}</p>
                  <Badge tone={files[d.id] ? "success" : "neutral"} className="mt-1">
                    {files[d.id] ? "Ajouté" : "À ajouter"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
          <input
            ref={picker}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFiles((s) => ({ ...s, [target.current]: URL.createObjectURL(f) }));
              e.target.value = "";
            }}
          />
          {touched && !step2Ok && <p role="alert" className="type-body-s text-fg-danger">Ajoute toutes les pièces demandées.</p>}
          <ActionError error={send.error} onRetry={() => send.run()} />
        </div>
      )}
      <BottomBar>
        {step === 1 ? (
          <Button type="submit" form="step1" size="lg" block>
            Continuer
          </Button>
        ) : (
          <Button
            size="lg"
            block
            loading={send.busy}
            onClick={() => {
              setTouched(true);
              if (step2Ok) send.run();
            }}
          >
            Envoyer pour validation
          </Button>
        )}
      </BottomBar>
    </>
  );
}

/* ---------- L3 · Validation en attente ---------- */

export function CourierPending() {
  return (
    <div className="flex flex-1 flex-col gap-5 bg-surface px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden className="flex size-28 items-center justify-center rounded-full bg-warning-subtle text-fg-warning">
          <ShieldCheck className="size-12" strokeWidth={1.5} />
        </span>
        <h1 className="mt-2 type-h2">Ton dossier est en cours de validation</h1>
        <p className="type-body-m text-fg-secondary">Un administrateur YA YO vérifie tes documents sous 48 h. Tu recevras une notification dès que tu pourras accepter des missions.</p>
      </div>
      <Timeline
        steps={[
          { title: "Dossier envoyé", detail: "Aujourd’hui · 4 documents", state: "done" },
          { title: "Vérification par un administrateur", detail: "En cours", state: "current", icon: <ShieldCheck /> },
          { title: "Compte livreur activé", detail: "Tu peux te mettre disponible", state: "upcoming" },
        ]}
      />
      <Alert tone="warning" title="Document refusé ?">
        Si une pièce est illisible, tu pourras la remplacer depuis cet écran.
      </Alert>
      <div className="mt-auto flex flex-col gap-3">
        <ButtonLink href="/livreur" size="lg" block>
          Aperçu : compte validé
        </ButtonLink>
        <ButtonLink href="mailto:support@yayo.cd" variant="outline" size="lg" block>
          Contacter le support
        </ButtonLink>
      </div>
    </div>
  );
}

/* ---------- L4 / L12 · Accueil ---------- */

export function CourierHome() {
  const { available, setAvailable, missions, setStatus, cash } = useCourier();
  const router = useRouter();
  const toast = useToast();
  const proposed = missions.find((m) => m.status === "proposed");
  const ongoing = missions.find((m) => m.status === "picking_up" || m.status === "delivering");
  const cashTotal = cash.reduce((n, c) => n + c.amount, 0);
  const toggle = useAsyncAction(async (v: boolean) => {
    await setAvailability(v);
    setAvailable(v);
  });
  const accept = useAsyncAction(async (m: Mission) => {
    await acceptMission(m.id);
    setStatus(m.id, "picking_up");
    router.push(`/livreur/missions/${m.id}`);
  });

  return (
    <>
      <ScreenHeader overline={`Livreur vérifié · ${courier.area}`} title={`Bonjour ${courier.first}`} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className={cn("flex items-center gap-4 rounded-xl p-4", available ? "bg-success-subtle" : "border border-line-subtle bg-surface")}>
          <div className="flex-1">
            <p className="type-label-l">{available ? "Tu es disponible" : "Tu es indisponible"}</p>
            <p className="type-body-s text-fg-secondary">{available ? "Tu reçois les missions autour de toi" : "Active-toi pour recevoir des missions"}</p>
          </div>
          <Switch checked={available} disabled={toggle.pending} onChange={(v) => toggle.run(v)} label="Disponibilité" />
        </div>
        <ActionError error={toggle.error} />
        {available ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface p-4 shadow-e1">
                <p className="flex items-center gap-2 type-body-s text-fg-secondary">
                  <Wallet className="size-4.5" /> Gains du jour
                </p>
                <p className="mt-2 type-h3 whitespace-nowrap tabular-nums">{formatFC(courier.todayEarnings)}</p>
              </div>
              <Link href="/livreur/cash" className="rounded-xl bg-surface p-4 shadow-e1">
                <p className="flex items-center gap-2 type-body-s text-fg-secondary">
                  <Banknote className="size-4.5" /> Cash à reverser
                </p>
                <p className="mt-2 type-h3 whitespace-nowrap tabular-nums">{formatFC(cashTotal)}</p>
              </Link>
            </div>
            {ongoing ? (
              <>
                <h2 className="type-h4">Mission en cours</h2>
                <MissionCard
                  mission={ongoing}
                  overline="Mission en cours"
                  footer={
                    <ButtonLink href={`/livreur/missions/${ongoing.id}`} block iconRight={<ArrowRight className="size-4.5" />}>
                      Ouvrir la mission
                    </ButtonLink>
                  }
                />
              </>
            ) : proposed ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="type-h4">Nouvelle mission</h2>
                  <Link href="/livreur/missions?onglet=proposees" className="type-label-m text-fg-accent">
                    Voir la carte
                  </Link>
                </div>
                <MissionCard
                  mission={proposed}
                  overline="Nouvelle mission"
                  highlight
                  footer={
                    <>
                      <ActionError error={accept.error} onRetry={() => accept.run(proposed)} />
                      <div className="grid grid-cols-[auto_1fr] gap-3">
                        <Button
                          variant="secondary"
                          disabled={accept.busy}
                          onClick={() => {
                            setStatus(proposed.id, "failed");
                            toast({ tone: "info", title: "Mission refusée", description: "Elle est proposée à un autre livreur." });
                          }}
                        >
                          Refuser
                        </Button>
                        <Button variant="accent" loading={accept.busy} onClick={() => accept.run(proposed)}>
                          Accepter la mission
                        </Button>
                      </div>
                    </>
                  }
                />
              </>
            ) : (
              <p className="rounded-xl bg-surface p-6 text-center type-body-m text-fg-secondary">Aucune mission pour l’instant. Reste disponible, on te prévient dès qu’un colis est prêt près de toi.</p>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <StatusCircle tone="neutral" size="md">
              <Power />
            </StatusCircle>
            <p className="mt-2 type-h4">Tu ne reçois pas de missions</p>
            <p className="type-body-m text-fg-secondary">
              Gains de la semaine : {formatFC(courier.weekEarnings)}. {cashTotal ? "Pense à reverser ton cash avant ce soir." : ""}
            </p>
            <Button size="lg" block className="mt-auto" loading={toggle.pending} onClick={() => toggle.run(true)}>
              Me rendre disponible
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- L13 · Mes missions ---------- */

export function CourierMissions({ initialTab }: { initialTab: "ongoing" | "proposed" | "done" }) {
  const { missions, setStatus } = useCourier();
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const ongoing = missions.filter((m) => m.status === "picking_up" || m.status === "delivering");
  const proposed = missions.filter((m) => m.status === "proposed");
  const done = missions.filter((m) => m.status === "done");
  return (
    <>
      <ScreenHeader overline={`${ongoing.length} en cours · ${proposed.length} proposée${proposed.length > 1 ? "s" : ""}`} title="Missions" />
      <div className="flex flex-col gap-4 p-5">
        <Segmented
          value={tab}
          onChange={setTab}
          items={[
            { value: "ongoing", label: "En cours" },
            { value: "proposed", label: "Proposées" },
            { value: "done", label: "Terminées" },
          ]}
        />
        {tab === "ongoing" &&
          (ongoing.length ? (
            <>
              {ongoing.map((m) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  overline="Mission en cours"
                  chips={<Badge tone={m.status === "picking_up" ? "warning" : "info"} icon={m.status === "picking_up" ? <Store /> : <Bike />}>{m.status === "picking_up" ? "En collecte" : "En livraison"}</Badge>}
                  footer={
                    <ButtonLink href={`/livreur/missions/${m.id}`} block iconRight={<ArrowRight className="size-4.5" />}>
                      Ouvrir la mission
                    </ButtonLink>
                  }
                />
              ))}
              {proposed.length > 0 && (
                <section className="rounded-xl bg-surface p-4">
                  <p className="mb-3 type-overline text-fg-tertiary">Ensuite</p>
                  <NextMissionRow mission={proposed[0]} />
                </section>
              )}
            </>
          ) : (
            <p className="rounded-xl bg-surface p-6 text-center type-body-m text-fg-secondary">Aucune mission en cours. Accepte une mission proposée pour commencer.</p>
          ))}
        {tab === "proposed" &&
          proposed.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              overline="Proposée"
              footer={
                <Button
                  variant="accent"
                  block
                  onClick={async () => {
                    await acceptMission(m.id);
                    setStatus(m.id, "picking_up");
                    router.push(`/livreur/missions/${m.id}`);
                  }}
                >
                  Accepter la mission
                </Button>
              }
            />
          ))}
        {tab === "proposed" && !proposed.length && <p className="rounded-xl bg-surface p-6 text-center type-body-m text-fg-secondary">Aucune mission proposée pour le moment.</p>}
        {tab === "done" && (
          <ul className="flex flex-col divide-y divide-line-subtle rounded-xl bg-surface">
            {done.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 p-4">
                <span className="type-label-m">
                  #{m.id} · {m.dropoff.name}
                </span>
                <span className="type-label-m text-fg-success">+ {formatFC(m.fee)}</span>
              </li>
            ))}
            {history.map((h) => (
              <HistoryRow key={h.id + h.at} h={h} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------- L5 → L8 · Collecter et livrer ---------- */

function RouteMap() {
  return (
    <div aria-hidden className="relative h-60 overflow-hidden bg-surface-sunken">
      <svg viewBox="0 0 402 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <g stroke="var(--bg-surface)" strokeWidth="14" fill="none">
          <path d="M-10 70 L420 40" />
          <path d="M-10 170 L420 140" />
          <path d="M90 -10 L130 250" />
          <path d="M260 -10 L290 250" />
        </g>
        <path d="M65 200 C 120 150, 150 140, 190 130 S 290 100, 330 60" stroke="var(--bg-accent)" strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
      <span className="absolute top-[83%] left-[16%] flex size-9 -translate-1/2 items-center justify-center rounded-full bg-brand text-fg-inverse shadow-e2">
        <Store className="size-4.5" />
      </span>
      <span className="absolute top-[54%] left-[47%] flex size-10 -translate-1/2 items-center justify-center rounded-full bg-surface text-fg-accent shadow-e2">
        <Bike className="size-5" />
      </span>
      <span className="absolute top-[25%] left-[82%] flex size-9 -translate-1/2 items-center justify-center rounded-full bg-accent text-fg-on-accent shadow-e2">
        <MapPin className="size-4.5" />
      </span>
    </div>
  );
}

export function MissionFlow({ id }: { id: string }) {
  const { missions, setStatus, addCash } = useCourier();
  const toast = useToast();
  const mission = missions.find((m) => m.id === id);
  const [phase, setPhase] = useState<"route" | "code" | "done">(mission?.status === "done" ? "done" : "route");
  const [pickupCode, setPickupCode] = useState("");
  const [code, setCode] = useState("");
  const [cashOk, setCashOk] = useState(false);
  const pickup = useAsyncAction(async () => {
    await confirmPickup(id, pickupCode, mission!.pickup.handoverCode);
    setStatus(id, "delivering");
    toast({ tone: "success", title: "Collecte confirmée", description: "Les fonds restent sous séquestre jusqu’à la livraison." });
  });
  const deliver = useAsyncAction(async () => {
    await confirmDelivery(id, code, mission!.dropoff.receptionCode);
    setStatus(id, "done");
    if (mission!.cash) addCash({ orderId: mission!.orderId, name: mission!.dropoff.name, at: "Livrée à l’instant", amount: mission!.cash });
    setPhase("done");
  });

  if (!mission)
    return (
      <>
        <TopBar title="Mission introuvable" fallback="/livreur/missions" />
        <p className="p-6 type-body-m text-fg-secondary">Cette mission n’existe pas ou n’est plus disponible.</p>
      </>
    );

  if (phase === "done")
    return (
      <div className="flex flex-1 flex-col gap-5 bg-surface px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center gap-3 text-center">
          <StatusCircle tone="success">
            <PackageCheck strokeWidth={1.5} />
          </StatusCircle>
          <h1 className="mt-2 type-h2">Colis livré !</h1>
          <p className="type-body-m text-fg-secondary">Mission #{mission.id} terminée.</p>
          <Badge tone="success" icon={<PackageCheck />}>
            Livrée
          </Badge>
        </div>
        <section className="rounded-xl bg-canvas p-4">
          <MoneyRow label="Ta rémunération" value={`+ ${formatFC(mission.fee)}`} tone="success" />
          {mission.cash > 0 && <MoneyRow label="Cash encaissé" value={formatFC(mission.cash)} />}
          {mission.cash > 0 && (
            <div className="mt-2 border-t border-line-subtle">
              <MoneyRow strong label="Cash à reverser" value={formatFC(mission.cash)} />
            </div>
          )}
        </section>
        <div className="mt-auto flex flex-col gap-3">
          <ButtonLink href="/livreur" size="lg" block>
            Voir les missions disponibles
          </ButtonLink>
          {mission.cash > 0 && (
            <ButtonLink href="/livreur/cash" variant="outline" size="lg" block>
              Reverser mon cash
            </ButtonLink>
          )}
        </div>
      </div>
    );

  if (phase === "code")
    return (
      <>
        <TopBar title="Remise du colis" fallback={`/livreur/missions/${id}`} />
        <div className="flex flex-col gap-5 px-6 pt-2 pb-6">
          <div>
            <h1 className="type-h3">Demande le code de réception au client</h1>
            <p className="mt-1 type-body-m text-fg-secondary">Le client le trouve dans le suivi de sa commande. Sans ce code, la livraison ne peut pas être validée.</p>
          </div>
          <div className="mx-auto w-64">
            <OtpInput length={4} value={code} onChange={(v) => (setCode(v), deliver.reset())} invalid={deliver.status === "error"} label="Code de réception" />
          </div>
          {mission.cash > 0 && (
            <label className="flex items-start gap-3 rounded-xl bg-surface p-4">
              <input type="checkbox" checked={cashOk} onChange={(e) => setCashOk(e.target.checked)} className="mt-0.5 size-5 accent-[var(--bg-brand)]" />
              <span>
                <span className="block type-label-m">J’ai encaissé {formatFC(mission.cash)} en espèces</span>
                <span className="block type-body-s text-fg-tertiary">Montant ajouté à ton cash à reverser</span>
              </span>
            </label>
          )}
          <InverseNote title="Ce que déclenche ta confirmation">La commande passe en « Livrée » et le paiement du vendeur est programmé par YA YO.</InverseNote>
          <ActionError error={deliver.error} onRetry={() => deliver.run()} />
          <p className="text-center type-caption text-fg-tertiary">Démo : code {mission.dropoff.receptionCode}</p>
        </div>
        <BottomBar className="flex flex-col gap-2">
          <Button size="lg" block disabled={code.length < 4 || (mission.cash > 0 && !cashOk)} loading={deliver.busy} onClick={() => deliver.run()}>
            Confirmer la livraison
          </Button>
          <ButtonLink href={`/livreur/missions/${id}/incident`} variant="ghost" size="lg" block>
            Impossible de livrer
          </ButtonLink>
        </BottomBar>
      </>
    );

  const picking = mission.status === "picking_up" || mission.status === "proposed";
  return (
    <>
      <TopBar title={`Mission #${mission.id}`} fallback="/livreur/missions" />
      <RouteMap />
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="type-h4">{picking ? `Collecte · ${mission.pickup.shop}` : `Livraison · ${mission.dropoff.name}`}</h1>
          <Badge tone={picking ? "warning" : "info"} icon={picking ? <Store /> : <Bike />}>
            {picking ? "En collecte" : "En livraison"}
          </Badge>
        </div>
        <p className="type-body-m text-fg-secondary">
          {picking ? `${mission.pickup.address} · ${mission.parcels} colis` : `${mission.dropoff.address}${mission.dropoff.note ? ` · ${mission.dropoff.note}` : ""}`}
        </p>
        {picking ? (
          <section className="flex flex-col items-center gap-3 rounded-xl bg-surface p-5">
            <p className="type-label-m">Code de remise donné par le vendeur</p>
            <div className="w-56">
              <OtpInput length={4} value={pickupCode} onChange={(v) => (setPickupCode(v.toUpperCase()), pickup.reset())} invalid={pickup.status === "error"} label="Code de remise" alphanumeric />
            </div>
            <p className="type-caption text-fg-tertiary">Démo : code {mission.pickup.handoverCode}</p>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" icon={<Phone className="size-4.5" />} onClick={() => toast({ tone: "info", title: `Appel de ${mission.dropoff.name}…`, description: "Numéro masqué : l’appel passe par YA YO." })}>
                Appeler (masqué)
              </Button>
              <ButtonLink href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${mission.dropoff.address}, Kinshasa`)}`} target="_blank" variant="secondary" icon={<Navigation className="size-4.5" />}>
                Itinéraire
              </ButtonLink>
            </div>
            {mission.cash > 0 && (
              <Alert tone="warning" icon={<Banknote />} title={`Cash à encaisser : ${formatFC(mission.cash)}`}>
                Paiement à la livraison. Encaisse le montant exact avant de remettre le colis.
              </Alert>
            )}
          </>
        )}
        <ActionError error={picking ? pickup.error : null} />
        <Stop kind={picking ? "dropoff" : "pickup"} title={picking ? `Ensuite · ${mission.dropoff.name}` : `Collecté chez ${mission.pickup.shop}`} address={picking ? mission.dropoff.address : mission.pickup.address} />
      </div>
      <BottomBar className="flex flex-col gap-2">
        {picking ? (
          <>
            <Button size="lg" block disabled={pickupCode.length < 4} loading={pickup.pending} onClick={() => pickup.run()}>
              Confirmer la collecte
            </Button>
            <ButtonLink href={`/livreur/missions/${id}/incident`} variant="ghost" size="lg" block icon={<TriangleAlert className="size-4.5" />}>
              Signaler un problème
            </ButtonLink>
          </>
        ) : (
          <Button size="lg" block onClick={() => setPhase("code")}>
            Je suis arrivé
          </Button>
        )}
      </BottomBar>
    </>
  );
}

/* ---------- L9 · Incident ---------- */

const incidents = ["Client absent ou injoignable", "Le client refuse le colis", "Adresse erronée ou introuvable", "Colis endommagé"];

export function IncidentForm({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { setStatus } = useCourier();
  const [reason, setReason] = useState(incidents[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const send = useAsyncAction(async () => {
    await reportIncident(id, reason);
    setStatus(id, "failed");
    toast({ tone: "success", title: "Échec déclaré", description: "YA YO prévient le client et te dit quoi faire du colis." });
    router.push("/livreur");
  });
  return (
    <>
      <TopBar title="Impossible de livrer" fallback={`/livreur/missions/${id}`} />
      <div className="flex flex-col gap-5 px-6 pt-2 pb-6">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-3 type-h4">Que s’est-il passé ?</legend>
          {incidents.map((r) => (
            <RadioCard key={r} name="incident" value={r} checked={reason === r} onChange={setReason} title={r} />
          ))}
        </fieldset>
        <div>
          <p className="mb-2 type-label-m">Preuve de passage (photo du lieu)</p>
          {photo ? (
            <span className="relative block size-24 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={photo} alt="Preuve de passage" className="size-full object-cover" />
              <button type="button" aria-label="Retirer la photo" onClick={() => setPhoto(null)} className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-surface shadow-e1">
                <X className="size-4" />
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => file.current?.click()} className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line-strong type-label-s text-fg-secondary">
              <Camera className="size-5" /> Ajouter
            </button>
          )}
          <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && setPhoto(URL.createObjectURL(e.target.files[0]))} />
        </div>
        <Alert tone="info" icon={<Info />} title="Et ensuite ?">
          YA YO prévient le client. Selon le cas : nouvelle tentative, retour au vendeur ou remboursement.
        </Alert>
        <ActionError error={send.error} onRetry={() => send.run()} />
      </div>
      <BottomBar>
        <Button variant="danger" size="lg" block disabled={!photo && reason !== "Colis endommagé"} loading={send.busy} onClick={() => send.run()}>
          Déclarer l’échec
        </Button>
      </BottomBar>
    </>
  );
}

/* ---------- L10 · Cash à reverser ---------- */

export function CashReturn() {
  const { cash, clearCash } = useCourier();
  const toast = useToast();
  const [channel, setChannel] = useState<"momo" | "depot" | null>(null);
  const total = cash.reduce((n, c) => n + c.amount, 0);
  const send = useAsyncAction(async () => {
    await returnCash(total, "momo");
    clearCash();
    setChannel(null);
    toast({ tone: "success", title: "Cash reversé", description: `${formatFC(total)} transférés au compte marchand YA YO.` });
  });
  return (
    <>
      <TopBar title="Cash à reverser" fallback="/livreur" />
      <div className="flex flex-col gap-5 px-5 pt-2 pb-6">
        <section className={cn("rounded-xl p-5", total ? "bg-warning-subtle" : "bg-success-subtle")}>
          <p className="type-body-s text-fg-secondary">Cash encaissé à reverser à YA YO</p>
          <p className="mt-1 type-display">{formatFC(total)}</p>
          <p className="mt-1 type-body-s text-fg-secondary">{total ? `${cash.length} livraison${cash.length > 1 ? "s" : ""} · à reverser avant ce soir 20h` : "Tout est reversé, merci !"}</p>
        </section>
        {cash.length > 0 && (
          <section>
            <h2 className="mb-2 type-h4">Détail</h2>
            <ul className="divide-y divide-line-subtle rounded-xl bg-surface">
              {cash.map((c) => (
                <li key={c.orderId} className="flex items-center gap-3 p-4">
                  <span className="flex size-10 items-center justify-center rounded-md bg-surface-sunken">
                    <Banknote className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block type-label-m">
                      #{c.orderId} · {c.name}
                    </span>
                    <span className="block type-body-s text-fg-tertiary">{c.at}</span>
                  </span>
                  <span className="type-label-m">{formatFC(c.amount)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section>
          <h2 className="mb-2 type-h4">Comment reverser ?</h2>
          <div className="divide-y divide-line-subtle overflow-hidden rounded-xl bg-surface">
            <button type="button" disabled={!total} onClick={() => setChannel("momo")} className="w-full text-left disabled:opacity-50">
              <ListRow icon={<Smartphone />} title="Dépôt Mobile Money" subtitle="Vers le compte marchand YA YO" trailing={<ArrowRight className="size-5 text-fg-tertiary" />} />
            </button>
            <button type="button" onClick={() => setChannel("depot")} className="w-full text-left">
              <ListRow icon={<MapPin />} title="Point de dépôt YA YO" subtitle="Gombe, av. des Aviateurs · 8h–20h" trailing={<ArrowRight className="size-5 text-fg-tertiary" />} />
            </button>
          </div>
        </section>
      </div>
      <BottomBar>
        <Button size="lg" block disabled={!total} onClick={() => setChannel("momo")}>
          Reverser par Mobile Money
        </Button>
      </BottomBar>
      <Sheet
        open={channel === "momo"}
        onClose={() => setChannel(null)}
        title="Reverser par Mobile Money"
        busy={send.pending}
        footer={
          <Button size="lg" block loading={send.busy && channel === "momo"} onClick={() => send.run()}>
            Envoyer {formatFC(total)}
          </Button>
        }
      >
        <ActionError error={send.error} onRetry={() => send.run()} className="mb-3" />
        <p className="type-body-m text-fg-secondary">Une demande M-Pesa sera envoyée sur ton numéro {courier.payout}. Valide-la avec ton code PIN.</p>
        <MoneyRow label="Compte marchand" value="YA YO · 50 50 50" />
        <MoneyRow label="Montant" value={formatFC(total)} />
      </Sheet>
      <Sheet open={channel === "depot"} onClose={() => setChannel(null)} title="Point de dépôt YA YO">
        <p className="type-body-m">Gombe, avenue des Aviateurs n°12 (en face de la poste). Ouvert tous les jours de 8h à 20h.</p>
        <p className="mt-2 type-body-s text-fg-tertiary">Présente ton code livreur. L’agent valide le dépôt dans l’app et ton solde passe à zéro.</p>
      </Sheet>
    </>
  );
}

/* ---------- L11 · Revenus et historique ---------- */

type H = (typeof history)[number];

function HistoryRow({ h }: { h: H }) {
  return (
    <li className="flex items-center gap-3 p-4">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", h.ok ? "bg-surface-sunken" : "bg-danger-subtle text-fg-danger")}>{h.ok ? <CircleCheck className="size-5" /> : <CircleX className="size-5" />}</span>
      <span className="min-w-0 flex-1">
        <span className="block type-label-m">
          #{h.id} · {h.route}
        </span>
        <span className="block type-body-s text-fg-tertiary">
          {h.at} · {h.status}
        </span>
      </span>
      <span className="type-label-m whitespace-nowrap">{formatFC(h.fee)}</span>
    </li>
  );
}

export function CourierEarnings() {
  const [period, setPeriod] = useState<keyof typeof earnings>("semaine");
  const e = earnings[period];
  return (
    <>
      <ScreenHeader overline={e.label} title="Revenus" />
      <div className="flex flex-col gap-4 p-5">
        <Segmented
          value={period}
          onChange={setPeriod}
          items={[
            { value: "jour", label: "Jour" },
            { value: "semaine", label: "Semaine" },
            { value: "mois", label: "Mois" },
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface p-4 shadow-e1">
            <p className="flex items-center gap-2 type-body-s text-fg-secondary">
              <Wallet className="size-4.5" /> Gains
            </p>
            <p className="mt-2 type-h3 whitespace-nowrap tabular-nums">{formatFC(e.total)}</p>
            <Badge tone="success" icon={<TrendingUp />} className="mt-2">
              +{e.delta} %
            </Badge>
          </div>
          <div className="rounded-xl bg-surface p-4 shadow-e1">
            <p className="flex items-center gap-2 type-body-s text-fg-secondary">
              <PackageCheck className="size-4.5" /> Missions
            </p>
            <p className="mt-2 type-h3 whitespace-nowrap tabular-nums">{e.missions}</p>
          </div>
        </div>
        <section className="rounded-xl bg-surface p-4">
          <MoneyRow label={`Courses (${e.missions})`} value={formatFC(e.rides)} />
          <MoneyRow label="Bonus ponctualité" value={formatFC(e.bonus)} />
          <div className="mt-2 border-t border-line-subtle">
            <MoneyRow strong label="Versé le lundi sur M-Pesa" value={formatFC(e.total)} />
          </div>
        </section>
        <div className="flex items-center justify-between">
          <h2 className="type-h4">Historique</h2>
          <Link href="/livreur/historique" className="type-label-m text-fg-accent">
            Tout voir
          </Link>
        </div>
        <ul className="divide-y divide-line-subtle rounded-xl bg-surface">
          {history.slice(0, 3).map((h) => (
            <HistoryRow key={h.id} h={h} />
          ))}
        </ul>
      </div>
    </>
  );
}

export function CourierHistory() {
  const [filter, setFilter] = useState("Toutes");
  const rows = history.filter((h) => filter === "Toutes" || (filter === "Livrées" ? h.ok : !h.ok));
  return (
    <>
      <ScreenHeader overline={`${history.length} missions`} title="Historique" />
      <div className="flex flex-col gap-4 p-5">
        <ChoiceChips label="Filtrer" items={["Toutes", "Livrées", "Échecs"]} selected={[filter]} onToggle={setFilter} />
        <ul className="divide-y divide-line-subtle rounded-xl bg-surface">
          {rows.map((h) => (
            <HistoryRow key={h.id} h={h} />
          ))}
        </ul>
      </div>
    </>
  );
}

/* ---------- L14 · Profil livreur ---------- */

export function CourierProfile() {
  const router = useRouter();
  const group = (title: string, children: React.ReactNode) => (
    <section>
      <h2 className="px-1 pb-2 type-overline text-fg-tertiary">{title}</h2>
      <div className="divide-y divide-line-subtle overflow-hidden rounded-xl bg-surface">{children}</div>
    </section>
  );
  return (
    <>
      <ScreenHeader overline="Livreur" title="Mon profil" />
      <div className="flex flex-col gap-5 p-5">
        <section className="flex items-center gap-4 rounded-xl bg-surface p-4">
          <Avatar name={courier.name} verified size="xl" />
          <div>
            <p className="type-h4">{courier.name}</p>
            <Stars value={courier.rating} />
            <span className="ml-1 type-body-s text-fg-tertiary">({courier.rides} courses)</span>
          </div>
        </section>
        {group(
          "Activité",
          <>
            <ListRow icon={<Bike />} title="Véhicule" subtitle={`${courier.vehicle} · ${courier.plate}`} href="/livreur/inscription" />
            <ListRow icon={<MapPin />} title="Zone de travail" subtitle={courier.zones} href="/livreur/inscription" />
            <ListRow icon={<Wallet />} title="Compte Mobile Money" subtitle={courier.payout} href="/livreur/inscription" />
          </>,
        )}
        {group(
          "Compte",
          <>
            <ListRow icon={<ShieldCheck />} title="Documents KYC" subtitle={`Validés le ${courier.kycValidatedAt}`} trailing={<Check className="size-5 text-fg-success" />} />
            <ListRow icon={<CircleHelp />} title="Centre d’aide livreur" href="mailto:support@yayo.cd" />
            <button type="button" onClick={() => router.push("/acheteur/bienvenue")} className="w-full text-left">
              <ListRow icon={<LogOut />} title="Se déconnecter" />
            </button>
          </>,
        )}
      </div>
    </>
  );
}
