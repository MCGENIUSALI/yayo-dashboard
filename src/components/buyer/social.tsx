"use client";

import { Bookmark, EyeOff, Flag, Heart, Link2, MessageCircle, MoreHorizontal, Repeat2, Send, Share2, ShieldCheck, ShoppingCart, Smile, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QtyStepper } from "@/components/buyer/qty-stepper";
import { useBuyer } from "@/components/buyer/store";
import { EscrowNote } from "@/components/buyer/ui";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/ui/media";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { postComment, repost, toggleFollow } from "@/lib/actions";
import { cn } from "@/lib/cn";
import { formatCompact, formatFC, formatUSD } from "@/lib/format";
import type { CatalogProduct, FeedComment, FeedPost, Shop } from "@/lib/types";

/* ---------- Follow ---------- */

export function FollowButton({ shop, className, size = "sm" }: { shop: Shop; className?: string; size?: "sm" | "lg" }) {
  const { following, setFollowing } = useBuyer();
  const toast = useToast();
  const on = following.has(shop.id);
  async function toggle() {
    const next = !on;
    setFollowing(shop.id, next);
    try {
      await toggleFollow(shop.id, next);
      toast({ tone: "success", title: next ? `Tu suis ${shop.name}` : `Tu ne suis plus ${shop.name}` });
    } catch (e) {
      setFollowing(shop.id, !next);
      toast({ tone: "info", title: "Action impossible", description: e instanceof Error ? e.message : undefined });
    }
  }
  if (size === "lg")
    return (
      <Button variant={on ? "outline" : "primary"} size="lg" block onClick={toggle} aria-pressed={on} className={className}>
        {on ? "Abonné" : "+ Suivre la boutique"}
      </Button>
    );
  return (
    <button type="button" aria-pressed={on} onClick={toggle} className={cn("pressable h-9 shrink-0 rounded-md border px-6 type-label-s", on ? "border-transparent bg-surface-sunken text-fg-secondary" : "border-line-strong bg-surface", className)}>
      {on ? "Abonné" : "Suivre"}
    </button>
  );
}

/* ---------- Comments (SC4) ---------- */

const PHONE = /(\+?\d[\d\s.-]{7,}\d)/g;

export function CommentsSheet({ open, onClose, initial, total }: { open: boolean; onClose: () => void; initial: FeedComment[]; total: number }) {
  const [comments, setComments] = useState(initial);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const toast = useToast();
  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await postComment("f1", body);
      const masked = PHONE.test(body);
      setComments((c) => [...c, { id: `me-${c.length}`, author: "Toi", ago: "à l’instant", body: body.replace(PHONE, "[Numéro masqué par YA YO]"), likes: 0, masked }]);
      setDraft("");
    } catch (e) {
      toast({ tone: "info", title: "Commentaire non publié", description: e instanceof Error ? e.message : undefined });
    } finally {
      setSending(false);
    }
  }
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${total + comments.length - initial.length} commentaires`}
      footer={
        <div className="flex flex-col gap-3">
          <p className="-mx-5 -mt-4 flex items-center gap-2 bg-info-subtle px-5 py-2.5 type-body-s text-fg-info">
            <ShieldCheck className="size-4.5 shrink-0" /> Commentaires publics et modérés. Les numéros et paiements hors YA YO sont masqués.
          </p>
          <form
            className="flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Avatar name="Jean Mukendi" size="sm" />
            <label className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-surface-sunken pr-3 pl-4">
              <span className="sr-only">Ajouter un commentaire</span>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ajouter un commentaire…" className="min-w-0 flex-1 bg-transparent type-body-m outline-none placeholder:text-fg-tertiary" />
              <Smile aria-hidden className="size-5 text-fg-tertiary" />
            </label>
            <button type="submit" aria-label="Publier le commentaire" disabled={!draft.trim() || sending} className="pressable flex size-11 shrink-0 items-center justify-center rounded-md bg-brand text-fg-inverse disabled:opacity-40">
              <Send className="size-5" />
            </button>
          </form>
        </div>
      }
    >
      <ul className="flex flex-col gap-5 py-2">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar name={c.author} size="md" className={c.seller ? undefined : "bg-surface-sunken text-fg-tertiary"} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 type-label-m">
                {c.author}
                {c.seller && <span className="rounded-full bg-accent px-2 py-0.5 type-caption text-fg-on-accent">Vendeur</span>}
                <span className="type-body-s text-fg-tertiary">· {c.ago}</span>
              </p>
              <p className={cn("mt-1 type-body-m", c.masked && "text-fg-secondary italic")}>{c.body}</p>
              <p className="mt-1 flex gap-4 type-label-s text-fg-tertiary">
                <button type="button" className="hover:text-fg">Répondre</button>
                <button type="button" className="hover:text-fg" onClick={() => toast({ tone: "success", title: "Commentaire signalé", description: "L’équipe YA YO va l’examiner." })}>
                  Signaler
                </button>
              </p>
            </div>
            <span className="flex flex-col items-center gap-0.5 type-caption text-fg-tertiary">
              <Heart className="size-4.5" />
              {c.likes}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/* ---------- Share (SC5) ---------- */

export function ShareSheet({ open, onClose, post, onSave }: { open: boolean; onClose: () => void; post: FeedPost; onSave: () => void }) {
  const toast = useToast();
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/acheteur/produits/${post.productId}`;
  async function doRepost() {
    onClose();
    try {
      await repost(post.id);
      toast({ tone: "success", title: "Republié sur ton profil", description: "Visible par tes abonnés, avec le produit lié." });
    } catch (e) {
      toast({ tone: "info", title: "Republication impossible", description: e instanceof Error ? e.message : undefined });
    }
  }
  const apps = [
    { label: "WhatsApp", icon: <MessageCircle />, href: `https://wa.me/?text=${encodeURIComponent(url)}` },
    { label: "Messenger", icon: <Send />, href: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}` },
  ];
  const rows = [
    { icon: <Repeat2 />, title: "Republier sur mon profil", body: "Visible par tes abonnés, avec le produit lié", onClick: doRepost },
    {
      icon: <Bookmark />,
      title: "Enregistrer pour plus tard",
      body: "Privé, dans « Mes enregistrements »",
      onClick: () => {
        onSave();
        onClose();
      },
    },
    { icon: <EyeOff />, title: "Pas intéressé", body: "Moins de vidéos de ce type", onClick: () => (onClose(), toast({ tone: "info", title: "C’est noté", description: "Tu verras moins de vidéos de ce type." })) },
    { icon: <Flag />, title: "Signaler la publication", body: "Contenu trompeur ou interdit", onClick: () => (onClose(), toast({ tone: "success", title: "Publication signalée", description: "Merci, l’équipe YA YO va l’examiner." })) },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Partager">
      <div className="grid grid-cols-4 gap-2 border-b border-line-subtle pb-4">
        {apps.map((a) => (
          <a key={a.label} href={a.href} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 type-label-s">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface-sunken [&_svg]:size-5">{a.icon}</span>
            {a.label}
          </a>
        ))}
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              toast({ tone: "success", title: "Lien copié" });
            } catch {
              toast({ tone: "info", title: "Copie impossible", description: url });
            }
          }}
          className="flex flex-col items-center gap-2 type-label-s"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-sunken">
            <Link2 className="size-5" />
          </span>
          Copier le lien
        </button>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) navigator.share({ title: "YA YO!", url }).catch(() => {});
            else toast({ tone: "info", title: "Partage non disponible sur ce navigateur" });
          }}
          className="flex flex-col items-center gap-2 type-label-s"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-sunken">
            <Share2 className="size-5" />
          </span>
          Autres
        </button>
      </div>
      <ul className="py-2">
        {rows.map((r) => (
          <li key={r.title}>
            <button type="button" onClick={r.onClick} className="flex w-full items-center gap-4 rounded-md py-3 text-left hover:bg-surface-muted">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken [&_svg]:size-5">{r.icon}</span>
              <span>
                <span className="block type-label-l">{r.title}</span>
                <span className="block type-body-s text-fg-tertiary">{r.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/* ---------- Quick buy (SC2) ---------- */

export function QuickBuySheet({ open, onClose, product }: { open: boolean; onClose: () => void; product: CatalogProduct }) {
  const { add } = useBuyer();
  const toast = useToast();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const soldOut = product.stock === 0;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Ajouter au panier"
      footer={
        <div className="flex flex-col gap-3">
          <EscrowNote />
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              disabled={soldOut}
              onClick={() => {
                add(product.id, color, qty);
                onClose();
                toast({ tone: "success", title: "Ajouté au panier", description: `${qty} × ${product.short}` });
              }}
            >
              Ajouter au panier
            </Button>
            <Button
              size="lg"
              disabled={soldOut}
              onClick={() => {
                add(product.id, color, qty);
                router.push("/acheteur/panier");
              }}
            >
              Commander
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-3 rounded-lg border border-line-subtle p-3">
        <ProductThumb swatch={product.swatch} name={product.name} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="truncate type-label-m">{product.name}</p>
          <p className="flex items-baseline gap-1.5">
            <span className="type-price-s">{formatFC(product.price)}</span>
            <span className="type-body-s text-fg-tertiary">{formatUSD(product.price)}</span>
          </p>
        </div>
        <Link href={`/acheteur/produits/${product.id}`} className="pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3 type-label-s text-fg-on-accent">
          <ShoppingCart className="size-4" /> Voir
        </Link>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        {product.colors.length > 0 && <ColorPicker colors={product.colors} value={color} onChange={setColor} />}
        <div className="flex flex-col items-end gap-2">
          <p className="type-label-m">Quantité</p>
          <QtyStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} label="Quantité" disabled={soldOut} />
        </div>
      </div>
    </Sheet>
  );
}

export function ColorPicker({ colors, value, onChange }: { colors: { name: string; hex: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="type-label-m">
        Couleur : <span className="font-normal">{value}</span>
      </legend>
      <div className="mt-2 flex gap-3">
        {colors.map((c) => (
          <label key={c.name} className="cursor-pointer">
            <input type="radio" name="color" value={c.name} checked={value === c.name} onChange={() => onChange(c.name)} className="peer sr-only" />
            <span className="sr-only">{c.name}</span>
            <span aria-hidden className="block size-10 rounded-full border-2 border-transparent p-0.5 transition-[border-color] peer-checked:border-line-focus peer-focus-visible:outline-2 peer-focus-visible:outline-line-focus">
              <span className="block size-full rounded-full border border-black/10" style={{ background: c.hex }} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ---------- Photo post (B1 feed, SC3) ---------- */

export function PhotoPost({ post, shop, product, comments }: { post: FeedPost; shop: Shop; product: CatalogProduct; comments: FeedComment[] }) {
  const { add } = useBuyer();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sheet, setSheet] = useState<"comments" | "share" | null>(null);
  return (
    <article className="bg-surface" aria-label={`Publication de ${shop.name}`}>
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href={`/acheteur/boutiques/${shop.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar name={shop.name} verified={shop.verified} />
          <span className="min-w-0">
            <span className="block truncate type-label-m">{shop.name}</span>
            <span className="block truncate type-body-s text-fg-tertiary">
              {shop.category} · {shop.area}
            </span>
          </span>
        </Link>
        <FollowButton shop={shop} />
        <button type="button" aria-label="Plus d’options" onClick={() => setSheet("share")} className="pressable flex size-9 items-center justify-center rounded-md">
          <MoreHorizontal className="size-5" />
        </button>
      </header>
      <Link href={`/acheteur/produits/${product.id}`} className="relative block aspect-[4/5]">
        <ProductThumb swatch={post.swatch} name={product.name} className="size-full rounded-none" />
        {post.media > 1 && <span className="absolute top-3 right-3 rounded-full bg-black/70 px-2 py-0.5 type-label-s text-white">1/{post.media}</span>}
      </Link>
      <div className="flex items-center gap-4 px-4 pt-3">
        <button type="button" aria-pressed={liked} aria-label="J’aime" onClick={() => setLiked(!liked)} className="pressable inline-flex items-center gap-1.5 type-label-m">
          <Heart className={cn("size-6", liked && "fill-danger text-danger")} /> {formatCompact(post.likes + (liked ? 1 : 0))}
        </button>
        <button type="button" aria-label="Commentaires" onClick={() => setSheet("comments")} className="pressable inline-flex items-center gap-1.5 type-label-m">
          <MessageCircle className="size-6" /> {post.comments}
        </button>
        <button type="button" aria-label="Partager" onClick={() => setSheet("share")} className="pressable">
          <Share2 className="size-6" />
        </button>
        <span className="inline-flex items-center gap-1.5 type-label-m">
          <Repeat2 className="size-6" /> {post.shares}
        </span>
        <span className="flex-1" />
        <button type="button" aria-pressed={saved} aria-label="Enregistrer" onClick={() => setSaved(!saved)} className="pressable">
          <Bookmark className={cn("size-6", saved && "fill-fg")} />
        </button>
        <button type="button" aria-label="Signaler" onClick={() => toast({ tone: "success", title: "Publication signalée" })} className="pressable text-fg-tertiary">
          <Flag className="size-5.5" />
        </button>
      </div>
      <p className="px-4 pt-3 type-body-m">{post.caption}</p>
      <div className="flex items-center gap-3 px-4 pt-3 pb-5">
        <div className="min-w-0 flex-1">
          <p className="type-price-m">{formatFC(product.price)}</p>
          <p className="type-body-s text-fg-tertiary">{formatUSD(product.price)}</p>
        </div>
        <Link href={`/acheteur/produits/${product.id}`} className="pressable inline-flex h-12 items-center rounded-lg bg-accent px-4 type-label-m text-fg-on-accent hover:bg-accent-pressed">
          Voir le produit
        </Link>
        <button
          type="button"
          aria-label={`Ajouter ${product.short} au panier`}
          disabled={product.stock === 0}
          onClick={() => {
            add(product.id, product.colors[0]?.name ?? "", 1);
            toast({ tone: "success", title: "Ajouté au panier", description: product.short });
          }}
          className="pressable flex size-12 items-center justify-center rounded-lg bg-brand text-fg-inverse disabled:opacity-40"
        >
          <ShoppingCart className="size-5" />
        </button>
      </div>
      <CommentsSheet open={sheet === "comments"} onClose={() => setSheet(null)} initial={comments} total={post.comments} />
      <ShareSheet open={sheet === "share"} onClose={() => setSheet(null)} post={post} onSave={() => (setSaved(true), toast({ tone: "success", title: "Enregistré", description: "Retrouve-le dans « Mes enregistrements »." }))} />
    </article>
  );
}

/* ---------- Video feed (SC1, SC2) ---------- */

export function VideoSlide({ post, shop, product, comments }: { post: FeedPost; shop: Shop; product: CatalogProduct; comments: FeedComment[] }) {
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sheet, setSheet] = useState<"comments" | "share" | "buy" | null>(null);
  const rail = "flex flex-col items-center gap-1 type-label-s text-white drop-shadow";
  const disc = "pressable flex size-12 items-center justify-center rounded-full bg-black/35 backdrop-blur [&_svg]:size-6";
  return (
    <section aria-label={`Vidéo de ${shop.name}`} className="relative h-full snap-start snap-always overflow-hidden">
      <ProductThumb swatch={post.swatch} name={product.name} className="absolute inset-0 size-full rounded-none" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
      <div className="absolute right-3 bottom-40 flex flex-col items-center gap-4">
        <Link href={`/acheteur/boutiques/${shop.id}`} aria-label={`Boutique ${shop.name}`}>
          <Avatar name={shop.name} verified size="md" className="size-12" />
        </Link>
        <span className={rail}>
          <button type="button" aria-pressed={liked} aria-label="J’aime" onClick={() => setLiked(!liked)} className={disc}>
            <Heart className={cn(liked && "fill-danger text-danger")} />
          </button>
          {formatCompact(post.likes + (liked ? 1 : 0))}
        </span>
        <span className={rail}>
          <button type="button" aria-label="Commentaires" onClick={() => setSheet("comments")} className={disc}>
            <MessageCircle />
          </button>
          {post.comments}
        </span>
        <span className={rail}>
          <button type="button" aria-pressed={saved} aria-label="Enregistrer" onClick={() => setSaved(!saved)} className={disc}>
            <Bookmark className={cn(saved && "fill-white")} />
          </button>
          {formatCompact(post.saves + (saved ? 1 : 0))}
        </span>
        <span className={rail}>
          <button type="button" aria-label="Republier ou partager" onClick={() => setSheet("share")} className={disc}>
            <Repeat2 />
          </button>
          {post.shares}
        </span>
        <span className={rail}>
          <button type="button" aria-label="Partager" onClick={() => setSheet("share")} className={disc}>
            <Share2 />
          </button>
          Partager
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 text-white">
        <p className="flex items-center gap-2 type-label-l drop-shadow">
          @{shop.name.toLowerCase().replace(/\s+/g, "")}
          <FollowPill shop={shop} />
        </p>
        <p className="max-w-[80%] type-body-m drop-shadow">{post.caption}</p>
        {post.sound && (
          <p className="flex items-center gap-1.5 type-body-s opacity-90">
            <Volume2 className="size-4" /> {post.sound}
          </p>
        )}
        <div className="flex items-center gap-3 rounded-lg bg-black/55 p-2 backdrop-blur">
          <ProductThumb swatch={product.swatch} name={product.name} className="size-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate type-label-m">{product.short}</p>
            <p className="type-price-s">
              {formatFC(product.price)} <span className="type-body-s font-normal opacity-75">{formatUSD(product.price)}</span>
            </p>
          </div>
          <button type="button" onClick={() => setSheet("buy")} className="pressable inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-3 type-label-s text-fg-on-accent">
            <ShoppingCart className="size-4" /> Ajouter
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/acheteur/produits/${product.id}`} className="pressable flex h-12 items-center justify-center rounded-lg bg-white/90 type-label-m text-neutral-950">
            Voir le produit
          </Link>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => setSheet("buy")}
            className="pressable flex h-12 items-center justify-center rounded-lg bg-accent type-label-m text-fg-on-accent disabled:opacity-50"
          >
            Commander
          </button>
        </div>
      </div>
      <QuickBuySheet open={sheet === "buy"} onClose={() => setSheet(null)} product={product} />
      <CommentsSheet open={sheet === "comments"} onClose={() => setSheet(null)} initial={comments} total={post.comments} />
      <ShareSheet open={sheet === "share"} onClose={() => setSheet(null)} post={post} onSave={() => (setSaved(true), toast({ tone: "success", title: "Enregistré pour plus tard" }))} />
    </section>
  );
}

function FollowPill({ shop }: { shop: Shop }) {
  const { following, setFollowing } = useBuyer();
  const on = following.has(shop.id);
  return (
    <button type="button" aria-pressed={on} onClick={() => setFollowing(shop.id, !on)} className="pressable rounded-md border border-accent bg-accent-subtle/90 px-2 py-0.5 type-label-s text-fg-accent">
      {on ? "Abonné" : "Suivre"}
    </button>
  );
}
