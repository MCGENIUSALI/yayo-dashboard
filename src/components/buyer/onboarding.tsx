"use client";

import { ArrowRight, Bike, Info, Lock, Mail, PackageCheck, RotateCcw, ShieldCheck, ShoppingBag, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RadioCard } from "@/components/buyer/choice";
import { OtpInput } from "@/components/buyer/otp-input";
import { PhoneInput } from "@/components/buyer/phone-input";
import { TopBar } from "@/components/buyer/top-bar";
import { BottomBar } from "@/components/buyer/ui";
import { ActionError, Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Logo } from "@/components/ui/logo";
import { ProductThumb } from "@/components/ui/media";
import { Segmented } from "@/components/ui/segmented";
import { useAsyncAction } from "@/hooks/use-async-action";
import { saveProfile, sendOtp, verifyOtp } from "@/lib/actions";
import { cn } from "@/lib/cn";

/* ---------- A1 + A2–A4 ---------- */

const slides = [
  { title: "Toute la RDC dans ta poche", body: "Mode, électronique, beauté : des milliers de produits de vendeurs locaux vérifiés.", swatch: "orange", name: "Robe mode" },
  { title: "Ton argent est protégé", body: "Tu paies YA YO, pas le vendeur. Il n’est payé qu’une fois ton colis livré et vérifié.", swatch: "red", name: "Veste mode", escrow: true },
  { title: "Livré chez toi, suivi en direct", body: "Un livreur YA YO récupère ta commande et te la remet contre ton code de réception.", swatch: "denim", name: "Veste en jean", map: true },
];

export function Welcome() {
  const router = useRouter();
  const [splash, setSplash] = useState(true);
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setSplash(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  if (splash)
    return (
      <button type="button" onClick={() => setSplash(false)} aria-label="Passer l’écran d’accueil" className="flex flex-1 flex-col items-center justify-center gap-3 bg-neutral-950 text-white" data-theme="dark">
        <Logo className="scale-150 text-white" />
        <span className="mt-4 type-body-m opacity-80">Vendre mieux, acheter ensemble.</span>
        <span className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] type-body-s opacity-60">Paiement sécurisé · Livraison suivie</span>
      </button>
    );

  const s = slides[i];
  const last = i === slides.length - 1;
  return (
    <div className="flex flex-1 flex-col bg-surface px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        {!last && (
          <Link href="/acheteur/connexion" className="type-label-m text-fg-secondary">
            Passer
          </Link>
        )}
      </div>
      <div key={i} className="mt-6 flex flex-1 animate-page-in flex-col" aria-live="polite">
        <div className="relative aspect-[4/5] max-h-[46dvh] overflow-hidden rounded-xl">
          <ProductThumb swatch={s.swatch} name={s.name} className="size-full rounded-none" />
          {s.escrow && (
            <div className="absolute inset-x-3 bottom-3 rounded-lg bg-neutral-950/95 p-4 text-white">
              <p className="flex items-center gap-2 type-label-m">
                <ShieldCheck className="size-5 text-success" /> Protection YA YO Escrow
              </p>
              <ul className="mt-2 flex flex-col gap-1.5 type-body-s opacity-90 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-success">
                <li className="flex gap-2">
                  <Lock /> Ton argent est bloqué par YA YO, pas par le vendeur
                </li>
                <li className="flex gap-2">
                  <PackageCheck /> Le vendeur est payé après la livraison confirmée
                </li>
                <li className="flex gap-2">
                  <RotateCcw /> Remboursé si le colis n’arrive pas
                </li>
              </ul>
            </div>
          )}
          {s.map && (
            <div className="absolute inset-x-3 bottom-3 h-28 overflow-hidden rounded-lg bg-surface-sunken">
              <svg viewBox="0 0 300 110" className="size-full" aria-hidden>
                <g stroke="var(--bg-surface)" strokeWidth="10">
                  <path d="M0 30 L300 10" />
                  <path d="M0 90 L300 70" />
                  <path d="M90 0 L110 110" />
                  <path d="M210 0 L230 110" />
                </g>
                <path d="M30 100 C 90 70, 150 70, 280 20" stroke="var(--bg-accent)" strokeWidth="4" fill="none" />
                <circle cx="200" cy="45" r="7" fill="var(--bg-accent)" />
              </svg>
            </div>
          )}
        </div>
        <h1 className="mt-6 type-h2">{s.title}</h1>
        <p className="mt-2 type-body-m text-fg-secondary">{s.body}</p>
        <div className="mt-4 flex gap-1.5" aria-label={`Étape ${i + 1} sur ${slides.length}`}>
          {slides.map((_, k) => (
            <button key={k} type="button" aria-label={`Aller à l’étape ${k + 1}`} onClick={() => setI(k)} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-6 bg-accent" : "w-1.5 bg-line-strong")} />
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {last ? (
          <>
            <Button size="lg" block onClick={() => router.push("/acheteur/connexion")}>
              Commencer
            </Button>
            <ButtonLink href="/acheteur/connexion" variant="ghost" size="lg" block>
              J’ai déjà un compte
            </ButtonLink>
          </>
        ) : (
          <Button size="lg" block iconRight={<ArrowRight className="size-5" />} onClick={() => setI(i + 1)}>
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------- A5 ---------- */

export function SignIn() {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const digits = phone.replace(/\D/g, "");
  const valid = mode === "phone" ? digits.length === 9 : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [touched, setTouched] = useState(false);
  const send = useAsyncAction(async () => {
    const to = mode === "phone" ? `+243 ${digits.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3")}` : email;
    await sendOtp(to);
    router.push(`/acheteur/connexion/code?a=${encodeURIComponent(to)}`);
  });
  return (
    <form
      className="flex flex-1 flex-col bg-surface px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (valid) send.run();
      }}
    >
      <Logo />
      <h1 className="mt-6 type-h1">Connexion ou inscription</h1>
      <p className="mt-2 type-body-m text-fg-secondary">Entre ton numéro : on t’envoie un code par SMS. Pas de mot de passe à retenir.</p>
      <Segmented
        className="mt-6 md:w-full"
        value={mode}
        onChange={setMode}
        items={[
          { value: "phone", label: "Téléphone" },
          { value: "email", label: "Email" },
        ]}
      />
      <div className="mt-5">
        {mode === "phone" ? (
          <Field label="Numéro de téléphone" hint="Vodacom, Orange, Airtel et Africell" error={touched && !valid ? "Saisis les 9 chiffres après +243." : undefined}>
            {(id) => <PhoneInput id={id} autoFocus value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="81 234 5678" />}
          </Field>
        ) : (
          <Field label="Adresse e-mail" error={touched && !valid ? "Saisis une adresse e-mail valide." : undefined}>
            {(id) => <Input id={id} type="email" autoComplete="email" icon={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean.mukendi@email.cd" />}
          </Field>
        )}
      </div>
      <ActionError error={send.error} onRetry={() => send.run()} className="mt-4" />
      <Button type="submit" size="lg" block className="mt-5" loading={send.busy}>
        Recevoir le code
      </Button>
      <div className="my-5 flex items-center gap-3 type-body-s text-fg-tertiary">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>
      <Button variant="outline" size="lg" block onClick={() => router.push("/acheteur/inscription")}>
        <span aria-hidden className="font-bold text-info">G</span> Continuer avec Google
      </Button>
      <p className="mt-auto pt-8 text-center type-body-s text-fg-tertiary">En continuant, tu acceptes les Conditions d’utilisation et la Politique de confidentialité de YA YO.</p>
    </form>
  );
}

/* ---------- A6 + E8 ---------- */

export function OtpStep() {
  const router = useRouter();
  const params = useSearchParams();
  const to = params.get("a") ?? "+243 81 234 5678";
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(45);
  const [tries, setTries] = useState(3);
  useEffect(() => {
    if (!left) return;
    const t = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);
  const verify = useAsyncAction(async (c: string) => {
    await verifyOtp(c);
    router.push("/acheteur/inscription");
  });
  const resend = useAsyncAction(async () => {
    await sendOtp(to);
    setLeft(45);
    setCode("");
    verify.reset();
  });
  const wrong = verify.status === "error";

  function onChange(v: string) {
    setCode(v);
    if (wrong) verify.reset();
    if (v.length === 6) {
      verify.run(v).then((ok) => {
        if (!ok) setTries((t) => Math.max(0, t - 1));
      });
    }
  }

  return (
    <>
      <TopBar fallback="/acheteur/connexion" />
      <div className="flex flex-1 flex-col bg-surface px-6 pt-2 pb-6">
        <h1 className="type-h1">{wrong ? "Saisis le code reçu par SMS" : "Vérifie ton numéro"}</h1>
        <p className="mt-2 type-body-m text-fg-secondary">
          Code envoyé {to.includes("@") ? "à" : "par SMS au"} <strong className="text-fg">{to}</strong>.
        </p>
        <Link href="/acheteur/connexion" className="mt-1 self-start py-2 type-label-m text-fg-accent">
          Modifier le numéro
        </Link>
        <div className="mt-4">
          <OtpInput value={code} onChange={onChange} invalid={wrong} />
        </div>
        <div aria-live="polite" className="mt-3">
          {wrong ? (
            <Alert tone="danger" title="Code incorrect">
              {tries > 0 ? `Il te reste ${tries} essai${tries > 1 ? "s" : ""}.` : "Trop d’essais : attends 15 minutes avant de redemander un code."} Après 3 erreurs, attends 15 minutes avant de redemander un code.
            </Alert>
          ) : (
            <p className="flex items-center justify-center gap-1.5 type-body-s text-fg-tertiary">{left ? `Renvoyer le code dans 00:${String(left).padStart(2, "0")}` : "Tu peux demander un nouveau code."}</p>
          )}
        </div>
        {!wrong && (
          <Alert tone="info" icon={<Info />} title="Code non reçu ?" className="mt-4">
            Vérifie ton réseau. Tu pourras demander un nouveau code ou un appel vocal. Démo : n’importe quel code fonctionne, sauf 000000 qui simule une erreur.
          </Alert>
        )}
      </div>
      <BottomBar className="flex flex-col gap-2">
        {wrong || !left ? (
          <>
            <Button variant="outline" size="lg" block loading={resend.pending} disabled={tries === 0} onClick={() => resend.run()}>
              Recevoir un nouveau code
            </Button>
            <Button variant="ghost" size="lg" block onClick={() => resend.run()}>
              Recevoir le code par appel
            </Button>
          </>
        ) : (
          <Button size="lg" block disabled={code.length < 6} loading={verify.busy} onClick={() => verify.run(code)}>
            Vérifier
          </Button>
        )}
      </BottomBar>
    </>
  );
}

/* ---------- A7 ---------- */

const communes = ["Bandal", "Barumbu", "Gombe", "Kalamu", "Kasa-Vubu", "Kintambo", "Lemba", "Limete", "Lingwala", "Masina", "Matete", "Ngaliema", "Ngiri-Ngiri"];

export function ProfileStep() {
  const router = useRouter();
  const [name, setName] = useState("Jean Mukendi");
  const [city, setCity] = useState("Kinshasa");
  const [commune, setCommune] = useState("Kalamu");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState(false);
  const save = useAsyncAction(async () => {
    await saveProfile();
    router.push("/acheteur/inscription/profil");
  });
  const nameOk = name.trim().split(/\s+/).length >= 2;
  return (
    <form
      className="flex flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (nameOk && terms) save.run();
      }}
    >
      <TopBar title="Créer ton compte" fallback="/acheteur/connexion" />
      <div className="flex flex-col gap-5 bg-surface px-6 pt-2 pb-6">
        <p className="type-overline text-fg-accent">Étape 1 sur 2 · Nouveau compte</p>
        <div className="flex items-center gap-4">
          <Avatar name={name || "?"} size="xl" />
          <div>
            <p className="type-label-m">Photo de profil</p>
            <p className="type-body-s text-fg-tertiary">Optionnelle · aide les livreurs à te reconnaître</p>
          </div>
        </div>
        <Field label="Nom complet" error={touched && !nameOk ? "Saisis ton prénom et ton nom." : undefined}>
          {(id) => <Input id={id} icon={<UserRound />} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Ville">
          {(id) => (
            <Select id={id} value={city} onChange={(e) => setCity(e.target.value)}>
              {["Kinshasa", "Lubumbashi", "Goma", "Kisangani", "Matadi"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Commune">
          {(id) => (
            <Select id={id} value={commune} onChange={(e) => setCommune(e.target.value)}>
              {communes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Email (optionnel)">{(id) => <Input id={id} type="email" icon={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean.mukendi@email.cd" />}</Field>
        <label className="flex items-start gap-3 type-body-s text-fg-secondary">
          <Checkbox checked={terms} onChange={setTerms} label="J’accepte les Conditions d’utilisation et la Politique de confidentialité" />
          <span>J’accepte les Conditions d’utilisation et la Politique de confidentialité.</span>
        </label>
        {touched && !terms && (
          <p role="alert" className="-mt-3 type-body-s text-fg-danger">
            Accepte les conditions pour continuer.
          </p>
        )}
        <ActionError error={save.error} onRetry={() => save.run()} />
      </div>
      <BottomBar>
        <Button type="submit" size="lg" block loading={save.busy}>
          Continuer
        </Button>
      </BottomBar>
    </form>
  );
}

/* ---------- A8 ---------- */

const roles = [
  { value: "buyer", title: "Acheteur", body: "J’achète des produits et je suis mes livraisons.", icon: <ShoppingBag />, next: "/acheteur", cta: "Commencer mes achats" },
  { value: "seller", title: "Vendeur", body: "Je vends mes articles et je suis mes revenus.", icon: <Store />, badge: "Vérification boutique requise", next: "/vendeur/ouverture", cta: "Créer ma boutique" },
  { value: "courier", title: "Livreur", body: "Je livre des colis et je suis payé par mission.", icon: <Bike />, badge: "KYC + validation admin", next: "/livreur/inscription", cta: "Devenir livreur" },
];

export function RoleStep() {
  const router = useRouter();
  const [role, setRole] = useState("buyer");
  const r = roles.find((x) => x.value === role)!;
  return (
    <>
      <TopBar fallback="/acheteur/inscription" />
      <div className="flex flex-col gap-5 bg-surface px-6 pt-2 pb-6">
        <p className="type-overline text-fg-accent">Étape 2 sur 2</p>
        <div>
          <h1 className="type-h1">Comment veux-tu utiliser YA YO ?</h1>
          <p className="mt-2 type-body-l text-fg-secondary">Tu pourras ajouter un autre profil plus tard depuis ton compte.</p>
        </div>
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Profil</legend>
          {roles.map((x) => (
            <RadioCard key={x.value} name="role" value={x.value} checked={role === x.value} onChange={setRole} icon={x.icon} title={x.title} accent>
              {x.body}
              {x.badge && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 type-label-s text-fg-secondary">
                  <ShieldCheck className="size-3.5" /> {x.badge}
                </span>
              )}
            </RadioCard>
          ))}
        </fieldset>
      </div>
      <BottomBar>
        <Button size="lg" block onClick={() => router.push(r.next)}>
          {r.cta}
        </Button>
      </BottomBar>
    </>
  );
}
