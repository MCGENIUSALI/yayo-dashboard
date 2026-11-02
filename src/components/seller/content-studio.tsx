"use client";

import { Bell, CalendarClock, Camera, CircleDot, Clapperboard, Eye, FolderPlus, Image as ImageIcon, Play, Plus, Radio, Timer, Upload, Video, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ActionError } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, Overline } from "@/components/ui/card";
import { Checkbox, Field, Input, SwitchRow, Textarea } from "@/components/ui/form";
import { KpiCard } from "@/components/ui/kpi-card";
import { PostTile, ProductThumb } from "@/components/ui/media";
import { EmptyState, MoneyRow } from "@/components/ui/misc";
import { Chips } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { publishStory, saveCollection, scheduleLive, startLive } from "@/lib/actions";
import { cn } from "@/lib/cn";
import type { Live, ProductCollection, Story } from "@/lib/data/seller";
import { formatCompact, formatFC, formatNumber } from "@/lib/format";
import type { Post, Product } from "@/lib/types";

/* ---------- Navigation inside "Contenus" ---------- */

const studioTabs = [
  { href: "/vendeur/contenus", label: "Publications", exact: true },
  { href: "/vendeur/contenus/stories", label: "Stories" },
  { href: "/vendeur/contenus/lives", label: "Lives" },
  { href: "/vendeur/contenus/collections", label: "Collections" },
  { href: "/vendeur/contenus/performances", label: "Performances" },
];

/** Sub-navigation of the content studio (publications, stories, lives, collections, analytics). */
export function ContentTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Gestion de contenu" className="-mx-4 flex gap-2 overflow-x-auto border-b border-line-subtle px-4 scrollbar-none md:mx-0 md:px-0">
      {studioTabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-1 pt-1 pb-2.5 type-label-m whitespace-nowrap transition-colors duration-(--duration-fast)",
              active ? "border-accent text-fg" : "border-transparent text-fg-secondary hover:text-fg",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ---------- "+ Contenu" sheet (seller-add-content-sheet) ---------- */

const addOptions = [
  {
    href: "/vendeur/contenus/nouveau?type=video",
    icon: <Video />,
    title: "Vidéo produit",
    hint: "Montre ton produit en action, liens d’achat inclus",
  },
  {
    href: "/vendeur/contenus/nouveau?type=photo",
    icon: <ImageIcon />,
    title: "Photo produit",
    hint: "Jusqu’à 10 photos avec produits liés",
  },
  {
    href: "/vendeur/contenus/stories/nouvelle",
    icon: <CircleDot />,
    title: "Story",
    hint: "Visible 24 h par tes abonnés",
  },
  {
    href: "/vendeur/contenus/lives/nouveau",
    icon: <Radio />,
    title: "Programmer un live",
    hint: "Vends en direct, tes abonnés sont prévenus",
  },
];

export function AddContentButton({
  label = "Contenu",
  fab,
  variant = "primary",
  size,
  className,
}: {
  label?: string;
  fab?: boolean;
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <Button
        variant={variant}
        size={fab ? "lg" : (size ?? "md")}
        icon={<Plus className="size-4" />}
        onClick={() => setOpen(true)}
        className={cn(fab && "fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 shadow-e3 md:hidden", className)}
      >
        {label}
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Ajouter du contenu"
        footer={
          <Button variant="secondary" block onClick={() => setOpen(false)}>
            Annuler
          </Button>
        }
      >
        <ul className="flex flex-col gap-2">
          {addOptions.map((o) => (
            <li key={o.href}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(o.href);
                }}
                className="pressable flex w-full items-center gap-3 rounded-lg border border-line-subtle p-3 text-left hover:bg-surface-muted"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-fg-accent [&_svg]:size-5">{o.icon}</span>
                <span className="min-w-0">
                  <span className="block type-label-l">{o.title}</span>
                  <span className="block type-body-s text-fg-tertiary">{o.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}

/* ---------- Product picker shared by stories, lives and collections ---------- */

function ProductPicker({ products, selected, onChange, max }: { products: Product[]; selected: string[]; onChange: (ids: string[]) => void; max?: number }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : max && selected.length >= max ? selected : [...selected, id]);
  return (
    <ul className="flex flex-col divide-y divide-line-subtle">
      {products.map((p) => (
        <li key={p.id} className="flex items-center gap-3 py-2.5">
          <ProductThumb swatch={p.image} name={p.name} className="size-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate type-label-m">{p.name}</p>
            <p className="type-body-s text-fg-tertiary">
              {formatFC(p.price)} · {p.stock > 0 ? `${p.stock} en stock` : "Rupture"}
            </p>
          </div>
          <Checkbox checked={selected.includes(p.id)} onChange={() => toggle(p.id)} label={`Lier ${p.name}`} />
        </li>
      ))}
    </ul>
  );
}

function LinkedChips({ products, ids, onRemove, onAdd }: { products: Product[]; ids: string[]; onRemove: (id: string) => void; onAdd: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const p = products.find((x) => x.id === id);
        if (!p) return null;
        return (
          <span key={id} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface pr-1 pl-1 type-label-m">
            <ProductThumb swatch={p.image} name={p.name} className="size-7 rounded-full" />
            <span className="max-w-36 truncate">{p.name.split(" – ")[0]}</span>
            <button type="button" aria-label={`Retirer ${p.name}`} onClick={() => onRemove(id)} className="pressable flex size-7 items-center justify-center rounded-full hover:bg-surface-muted">
              <X className="size-3.5" />
            </button>
          </span>
        );
      })}
      <button type="button" onClick={onAdd} className="pressable inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-line-strong px-3 type-label-m text-fg-secondary hover:text-fg">
        <Plus className="size-4" /> Ajouter
      </button>
    </div>
  );
}

function usePicker(initial: string[]) {
  const [ids, setIds] = useState<string[]>(initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(initial);
  return {
    ids,
    setIds,
    open,
    draft,
    setDraft,
    show: () => {
      setDraft(ids);
      setOpen(true);
    },
    close: () => setOpen(false),
    apply: () => {
      setIds(draft);
      setOpen(false);
    },
  };
}

function CoverUpload({ label, cover, onPick }: { label: string; cover: string | null; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="pressable flex w-full items-center gap-3 rounded-lg border border-dashed border-line-strong p-3 text-left hover:bg-surface-muted">
      {cover ? (
        <ProductThumb swatch={cover} name={label} className="size-16" />
      ) : (
        <span className="flex size-16 items-center justify-center rounded-md bg-surface-sunken text-fg-tertiary">
          <Upload className="size-5" />
        </span>
      )}
      <span>
        <span className="block type-label-m">{cover ? "Changer l’image" : label}</span>
        <span className="block type-body-s text-fg-tertiary">JPG ou PNG, format portrait conseillé</span>
      </span>
    </button>
  );
}

/* ---------- Stories ---------- */

export function StoriesBoard({ stories, products }: { stories: Story[]; products: Product[] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="type-body-m text-fg-secondary">Tes stories restent visibles 24 h dans le fil de tes abonnés.</p>
        <ButtonLink href="/vendeur/contenus/stories/nouvelle" icon={<Plus className="size-4" />} className="hidden md:inline-flex">
          Nouvelle story
        </ButtonLink>
      </div>
      {stories.length === 0 ? (
        <EmptyState icon={<CircleDot />} title="Aucune story en cours" action={<ButtonLink href="/vendeur/contenus/stories/nouvelle">Publier une story</ButtonLink>}>
          Partage un arrivage ou les coulisses de ta boutique.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
          {stories.map((s) => {
            const linked = products.filter((p) => s.productIds.includes(p.id));
            return (
              <li key={s.id}>
                <Card className="overflow-hidden">
                  <div className="relative">
                    <PostTile swatch={s.cover} caption={s.caption} kind="photo" className="rounded-none" />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 type-caption text-white">
                      <Timer className="size-3" /> {s.expiresIn}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <p className="line-clamp-2 type-label-m">{s.caption}</p>
                    <p className="type-caption text-fg-tertiary">{s.postedAgo}</p>
                    <p className="inline-flex items-center gap-3 type-body-s text-fg-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3.5" /> {formatCompact(s.views)}
                      </span>
                      <span>{s.replies} réponses</span>
                    </p>
                    {linked.length > 0 && <Badge className="self-start">{linked.length} produit lié</Badge>}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <ButtonLink href="/vendeur/contenus/stories/nouvelle" icon={<Plus className="size-4" />} size="lg" className="fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 shadow-e3 md:hidden">
        Story
      </ButtonLink>
    </div>
  );
}

export function StoryComposer({ products }: { products: Product[] }) {
  const router = useRouter();
  const toast = useToast();
  const [cover, setCover] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [allowReplies, setAllowReplies] = useState(true);
  const picker = usePicker([]);
  const linkable = products.filter((p) => p.online);
  const publish = useAsyncAction(async () => {
    await publishStory();
    toast({
      tone: "success",
      title: "Story publiée",
      description: "Visible 24 h par tes abonnés",
    });
    router.push("/vendeur/contenus/stories");
  });
  return (
    <div className="flex flex-col gap-5 lg:max-w-2xl">
      <Card className="flex flex-col gap-5 p-4 md:p-5">
        <CoverUpload label="Ajouter une photo ou une vidéo" cover={cover} onPick={() => setCover((c) => (c === "sun" ? "teal" : "sun"))} />
        <Field label="Texte (facultatif)" hint={`${caption.length}/120`}>
          {(id) => <Input id={id} value={caption} maxLength={120} onChange={(e) => setCaption(e.target.value)} placeholder="Ex. Arrivage du jour !" />}
        </Field>
        <div className="flex flex-col gap-2">
          <Overline>Produit lié</Overline>
          <LinkedChips products={linkable} ids={picker.ids} onRemove={(id) => picker.setIds(picker.ids.filter((x) => x !== id))} onAdd={picker.show} />
        </div>
        <SwitchRow icon={<Camera />} label="Autoriser les réponses" hint="Les réponses arrivent dans tes notifications" checked={allowReplies} onChange={setAllowReplies} />
      </Card>
      <ActionError error={publish.error} onRetry={() => publish.run()} />
      <Button size="lg" block loading={publish.pending} disabled={!cover || publish.busy} onClick={() => publish.run()}>
        Publier la story
      </Button>
      {!cover && <p className="-mt-3 text-center type-body-s text-fg-tertiary">Ajoute une image pour publier.</p>}
      <Sheet
        open={picker.open}
        onClose={picker.close}
        title="Lier un produit"
        footer={
          <Button block onClick={picker.apply}>
            Valider ({picker.draft.length})
          </Button>
        }
      >
        <ProductPicker products={linkable} selected={picker.draft} onChange={picker.setDraft} max={1} />
      </Sheet>
    </div>
  );
}

/* ---------- Lives ---------- */

export function LivesBoard({ lives, products }: { lives: Live[]; products: Product[] }) {
  const toast = useToast();
  const current = lives.find((l) => l.state === "live");
  const scheduled = lives.filter((l) => l.state === "scheduled");
  const replays = lives.filter((l) => l.state === "replay");
  const start = useAsyncAction(async (id: string) => {
    await startLive(id);
    toast({
      tone: "success",
      title: "Tu es en direct",
      description: "Tes abonnés viennent d’être prévenus",
    });
  });
  const names = (ids: string[]) => products.filter((p) => ids.includes(p.id)).map((p) => p.name.split(" – ")[0]);

  return (
    <div className="flex flex-col gap-6">
      {current && (
        <section aria-label="Live en cours" className="relative overflow-hidden rounded-xl bg-inverse text-fg-inverse">
          <ProductThumb swatch={current.cover} name={current.title} className="absolute inset-0 size-full rounded-none opacity-40" />
          <div className="relative flex flex-col gap-3 p-5">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-danger px-2.5 py-1 type-label-s text-white">
              <span className="size-2 animate-pulse rounded-full bg-white" /> EN DIRECT · {formatNumber(current.viewers ?? 0)} spectateurs
            </span>
            <p className="type-h3">{current.title}</p>
            <p className="type-body-s opacity-80">
              {current.when} · {current.sales} ventes pendant le live · {names(current.productIds).join(", ")}
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/vendeur/contenus/performances" variant="secondary" icon={<Play className="size-4" />}>
                Suivre les ventes du live
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="type-h4">Prochains lives programmés</h2>
          <ButtonLink href="/vendeur/contenus/lives/nouveau" icon={<Plus className="size-4" />} variant="outline" size="sm">
            Programmer
          </ButtonLink>
        </div>
        {scheduled.length === 0 ? (
          <EmptyState icon={<CalendarClock />} title="Aucun live programmé" action={<ButtonLink href="/vendeur/contenus/lives/nouveau">Programmer un live</ButtonLink>}>
            Annonce ton live à l’avance pour réunir plus de spectateurs.
          </EmptyState>
        ) : (
          <Card className="divide-y divide-line-subtle overflow-hidden">
            {scheduled.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-3 md:p-4">
                <ProductThumb swatch={l.cover} name={l.title} className="size-14" />
                <div className="min-w-0 flex-1">
                  <p className="truncate type-label-l">{l.title}</p>
                  <p className="type-body-s text-fg-secondary">{l.when}</p>
                  <p className="inline-flex items-center gap-1 type-caption text-fg-tertiary">
                    <Bell className="size-3" /> {formatNumber(l.reminders ?? 0)} rappels · {l.productIds.length} produit{l.productIds.length > 1 ? "s" : ""}
                  </p>
                </div>
                <Button size="sm" loading={start.pending && start.args?.[0] === l.id} disabled={start.busy} onClick={() => start.run(l.id)}>
                  Démarrer
                </Button>
              </div>
            ))}
          </Card>
        )}
        <ActionError error={start.error} onRetry={() => start.args && start.run(...start.args)} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-h4">Replays récents</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {replays.map((l) => (
            <li key={l.id} className="flex flex-col gap-2">
              <div className="relative">
                <PostTile swatch={l.cover} caption={l.title} kind="video" views={l.views} />
                <span className="absolute right-2 bottom-2 rounded-sm bg-black/60 px-1.5 type-caption text-white">{l.duration}</span>
              </div>
              <p className="line-clamp-2 type-label-m">{l.title}</p>
              <p className="type-caption text-fg-tertiary">
                {l.when} · {l.sales} ventes
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function LiveScheduleForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [description, setDescription] = useState("");
  const [notify, setNotify] = useState(true);
  const [cover, setCover] = useState<string | null>(null);
  const picker = usePicker(["p1"]);
  const linkable = products.filter((p) => p.online && p.stock > 0);
  const valid = title.trim().length >= 3 && date !== "" && picker.ids.length > 0;
  const submit = useAsyncAction(async () => {
    await scheduleLive();
    toast({
      tone: "success",
      title: "Live programmé",
      description: notify ? "Tes abonnés seront prévenus 30 min avant" : undefined,
    });
    router.push("/vendeur/contenus/lives");
  });
  return (
    <form
      className="flex flex-col gap-5 lg:max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) submit.run();
      }}
    >
      <Card className="flex flex-col gap-5 p-4 md:p-5">
        <Field label="Titre du live">{(id) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Super promo JBL en direct" maxLength={80} />}</Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">{(id) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
          <Field label="Heure">{(id) => <Input id={id} type="time" value={time} onChange={(e) => setTime(e.target.value)} />}</Field>
        </div>
        <Field label="Description" hint="Ce que tes spectateurs vont découvrir">
          {(id) => <Textarea id={id} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Présentation des nouveautés, offres exclusives…" />}
        </Field>
        <div className="flex flex-col gap-2">
          <Overline>Produits présentés</Overline>
          <LinkedChips products={linkable} ids={picker.ids} onRemove={(id) => picker.setIds(picker.ids.filter((x) => x !== id))} onAdd={picker.show} />
        </div>
        <SwitchRow icon={<Bell />} label="Notifier les abonnés" hint="Rappel envoyé 30 min avant le début" checked={notify} onChange={setNotify} />
        <div className="flex flex-col gap-2">
          <Overline>Affiche de couverture</Overline>
          <CoverUpload label="Ajouter une affiche" cover={cover} onPick={() => setCover((c) => (c === "orange" ? "teal" : "orange"))} />
        </div>
      </Card>
      <ActionError error={submit.error} onRetry={() => submit.run()} />
      <Button type="submit" size="lg" block icon={<CalendarClock className="size-4" />} loading={submit.pending} disabled={!valid || submit.busy}>
        Programmer le live
      </Button>
      {!valid && <p className="-mt-3 text-center type-body-s text-fg-tertiary">Renseigne un titre, une date et au moins un produit.</p>}
      <Sheet
        open={picker.open}
        onClose={picker.close}
        title="Produits présentés"
        footer={
          <Button block onClick={picker.apply}>
            Valider ({picker.draft.length})
          </Button>
        }
      >
        <ProductPicker products={linkable} selected={picker.draft} onChange={picker.setDraft} max={10} />
      </Sheet>
    </form>
  );
}

/* ---------- Collections ---------- */

export function CollectionsManager({ collections, products }: { collections: ProductCollection[]; products: Product[] }) {
  const toast = useToast();
  const [list, setList] = useState(collections);
  const [editing, setEditing] = useState<ProductCollection | null>(null);
  const [name, setName] = useState("");
  const [published, setPublished] = useState(true);
  const [ids, setIds] = useState<string[]>([]);
  const open = (c: ProductCollection | "new") => {
    const base = c === "new" ? { id: "", name: "", cover: "denim", productIds: [], published: true } : c;
    setEditing(base);
    setName(base.name);
    setPublished(base.published);
    setIds(base.productIds);
  };
  const save = useAsyncAction(async () => {
    await saveCollection(name);
    setList((l) => {
      if (editing?.id) return l.map((c) => (c.id === editing.id ? { ...c, name, published, productIds: ids } : c));
      return [
        ...l,
        {
          id: `k${l.length + 1}`,
          name,
          cover: "denim",
          published,
          productIds: ids,
        },
      ];
    });
    toast({
      tone: "success",
      title: editing?.id ? "Collection mise à jour" : "Collection créée",
      description: `${ids.length} produit${ids.length > 1 ? "s" : ""}`,
    });
    setEditing(null);
  });
  const valid = name.trim().length >= 2 && ids.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="type-body-m text-fg-secondary">Regroupe tes produits par thème : ils apparaissent dans l’onglet Collections de ta boutique.</p>
        <Button icon={<FolderPlus className="size-4" />} onClick={() => open("new")} className="shrink-0">
          Créer
        </Button>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const items = products.filter((p) => c.productIds.includes(p.id));
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => open(c)}
                aria-label={`Modifier ${c.name}`}
                className="pressable flex w-full items-center gap-3 rounded-lg border border-line-subtle bg-surface p-3 text-left hover:bg-surface-muted"
              >
                <span className="grid size-16 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-md">
                  {items.slice(0, 4).map((p) => (
                    <ProductThumb key={p.id} swatch={p.image} name={p.name} className="size-full rounded-none [&_svg]:hidden" />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate type-label-l">{c.name}</span>
                  <span className="block type-body-s text-fg-tertiary">{items.length} produits</span>
                </span>
                <Badge tone={c.published ? "success" : "neutral"}>{c.published ? "Visible" : "Masquée"}</Badge>
              </button>
            </li>
          );
        })}
      </ul>
      <Sheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        busy={save.busy}
        title={editing?.id ? "Modifier la collection" : "Nouvelle collection"}
        footer={
          <div className="flex flex-col gap-2">
            <ActionError error={save.error} onRetry={() => save.run()} />
            <Button block loading={save.pending} disabled={!valid || save.busy} onClick={() => save.run()}>
              Enregistrer
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nom de la collection">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Wax chic et moderne" maxLength={40} />}</Field>
          <SwitchRow label="Visible sur ma boutique" checked={published} onChange={setPublished} />
          <Overline>Produits ({ids.length})</Overline>
          <ProductPicker products={products} selected={ids} onChange={setIds} />
        </div>
      </Sheet>
    </div>
  );
}

/* ---------- Performances (seller-analytics-dashboard) ---------- */

type Period = "jour" | "semaine" | "mois" | "total";
interface PeriodStats {
  profileViews: number;
  contentViews: number;
  clicks: number;
  conversion: number;
  deltas: number[];
  followers: number[];
  revenue: { total: number; lives: number; videos: number };
}

function LineChart({ values, label }: { values: number[]; label: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 36 - ((v - min) / span) * 32] as const);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={label} className="h-32 w-full overflow-visible text-accent">
      <path d={`${path} L100,40 L0,40 Z`} className="fill-current opacity-10" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function ContentAnalytics({ stats, posts }: { stats: Record<Period, PeriodStats>; posts: Post[] }) {
  const [period, setPeriod] = useState<Period>("semaine");
  const s = stats[period];
  const delta = (i: number, pct = true) => (period === "total" ? undefined : `+${s.deltas[i].toLocaleString("fr-FR")}${pct ? " %" : " pt"}`);
  const top = useMemo(
    () =>
      [...posts]
        .filter((p) => p.state === "published")
        .sort((a, b) => b.stats.views - a.stats.views)
        .slice(0, 3),
    [posts],
  );
  const gained = s.followers[s.followers.length - 1] - s.followers[0];

  return (
    <div className="flex flex-col gap-5">
      <Chips
        value={period}
        onChange={setPeriod}
        items={[
          { value: "jour", label: "Aujourd’hui" },
          { value: "semaine", label: "Semaine" },
          { value: "mois", label: "Mois" },
          { value: "total", label: "Total" },
        ]}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={<Eye />} label="Vues profil" value={formatNumber(s.profileViews)} trend="up" trendLabel={delta(0)} />
        <KpiCard icon={<Clapperboard />} label="Vues contenu" value={formatCompact(s.contentViews)} trend="up" trendLabel={delta(1)} />
        <KpiCard icon={<Play />} label="Clics produits" value={formatNumber(s.clicks)} trend="up" trendLabel={delta(2)} />
        <KpiCard icon={<Radio />} label="Conversion" value={`${s.conversion.toLocaleString("fr-FR")} %`} trend="up" trendLabel={delta(3, false)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <Card className="flex flex-col gap-3 p-4 md:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="type-h4">Croissance des abonnés</h2>
            <span className="type-label-m text-fg-success">+{formatNumber(gained)}</span>
          </div>
          <LineChart values={s.followers} label={`Abonnés : de ${formatNumber(s.followers[0])} à ${formatNumber(s.followers[s.followers.length - 1])}`} />
          <p className="type-caption text-fg-tertiary">{formatNumber(s.followers[s.followers.length - 1])} abonnés aujourd’hui</p>
        </Card>
        <div className="flex flex-col gap-2 rounded-xl bg-inverse p-5 text-fg-inverse">
          <p className="type-body-s opacity-75">Revenus du contenu</p>
          <p className="type-h2 tabular-nums">{formatFC(s.revenue.total)}</p>
          <div className="mt-2 flex flex-col gap-1 [&_*]:text-fg-inverse">
            <MoneyRow label="Lives" value={formatFC(s.revenue.lives)} />
            <MoneyRow label="Vidéos et photos" value={formatFC(s.revenue.videos)} />
          </div>
        </div>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="type-h4">Top contenus</h2>
        <Card className="divide-y divide-line-subtle overflow-hidden">
          {top.map((p, i) => (
            <Link key={p.id} href={`/vendeur/contenus/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-surface-muted md:p-4">
              <span className="w-5 type-label-l text-fg-tertiary">{i + 1}</span>
              <PostTile swatch={p.cover} caption={p.caption} kind={p.kind} className="w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate type-label-m">{p.caption}</p>
                <p className="type-body-s text-fg-tertiary">
                  {formatCompact(p.stats.views)} vues · {p.stats.sales} ventes
                </p>
              </div>
              <span className="type-label-m whitespace-nowrap tabular-nums">{formatFC(p.stats.revenue)}</span>
            </Link>
          ))}
        </Card>
      </section>
    </div>
  );
}
