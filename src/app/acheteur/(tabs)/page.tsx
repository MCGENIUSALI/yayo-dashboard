import { ChevronRight, Play, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/buyer/category-icon";
import { HeaderActions } from "@/components/buyer/header-actions";
import { OfflineBanner } from "@/components/buyer/offline-banner";
import { PhotoPost } from "@/components/buyer/social";
import { Logo } from "@/components/ui/logo";
import { ProductThumb } from "@/components/ui/media";
import { getBuyerNotifications, getCatalog, getCategories, getFeed, getFeedComments, getShops } from "@/lib/api";

export const metadata = { title: "Accueil" };

const shortcuts = [
  { id: "mode", label: "Mode" },
  { id: "electronique", label: "Électro" },
  { id: "beaute", label: "Beauté" },
  { id: "maison", label: "Maison" },
  { id: "promos", label: "Promos" },
  { id: "audio", label: "Audio" },
] as const;

/** B1 · Accueil (US-02): search, categories, promo, shops feed. E1 offline banner, E2 = loading.tsx. */
export default async function BuyerHome() {
  const [feed, shops, catalog, notifications, comments] = await Promise.all([getFeed(), getShops(), getCatalog(), getBuyerNotifications(), getFeedComments(), getCategories()]);
  const unread = notifications.filter((n) => n.unread).length;
  const photos = feed.filter((p) => p.kind === "photo");
  const videos = feed.filter((p) => p.kind === "video");
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface/95 px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur">
        <Logo size="sm" />
        <HeaderActions unread={unread} />
      </header>
      <div className="flex flex-col gap-5 bg-surface pb-5">
        <div className="flex items-center gap-2 px-5">
          <Link href="/acheteur/recherche" className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-surface-sunken pl-4 type-body-l text-fg-tertiary">
            <Search className="size-5 shrink-0 text-fg-secondary" />
            <span className="truncate">Rechercher un produit, une boutique…</span>
          </Link>
          <Link href="/acheteur/explorer?filtres=1" aria-label="Filtres" className="pressable flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-fg-inverse">
            <SlidersHorizontal className="size-5" />
          </Link>
        </div>
        <nav aria-label="Catégories" className="flex gap-5 overflow-x-auto px-5 scrollbar-none">
          {shortcuts.map((c) => (
            <Link key={c.id} href={`/acheteur/explorer?categorie=${c.id}`} className="group flex w-16 shrink-0 flex-col items-center gap-2 type-label-s">
              <span className="flex size-14 items-center justify-center rounded-full bg-surface-sunken transition-colors group-hover:bg-line">
                <CategoryIcon id={c.id} className="size-6" />
              </span>
              {c.label}
            </Link>
          ))}
        </nav>
        <OfflineBanner />
        <Link href="/acheteur/explorer?categorie=promos" className="mx-5 flex overflow-hidden rounded-xl bg-neutral-950 text-white">
          <span className="flex flex-1 flex-col gap-2 p-5">
            <span className="type-overline text-orange-400">Livraison offerte</span>
            <span className="type-h3">Dès 100 000 FC à Kinshasa</span>
            <span className="mt-1 inline-flex h-10 w-fit items-center rounded-md bg-accent px-4 type-label-m">J’en profite</span>
          </span>
          <ProductThumb swatch="teal" name="JBL Go 3" className="w-32 rounded-none" />
        </Link>
      </div>

      <section aria-labelledby="videos" className="mt-2 bg-surface py-4">
        <div className="flex items-center justify-between px-5">
          <h2 id="videos" className="type-h4">
            Vidéos pour toi
          </h2>
          <Link href="/acheteur/fil" className="inline-flex items-center gap-0.5 type-label-m text-fg-accent">
            Tout voir <ChevronRight className="size-4" />
          </Link>
        </div>
        <ul className="mt-3 flex gap-3 overflow-x-auto px-5 scrollbar-none">
          {videos.map((v) => {
            const product = catalog.find((p) => p.id === v.productId)!;
            return (
              <li key={v.id} className="shrink-0">
                <Link href={`/acheteur/fil?video=${v.id}`} className="relative block h-48 w-32 overflow-hidden rounded-lg">
                  <ProductThumb swatch={v.swatch} name={product.name} className="size-full rounded-none" />
                  <Play className="absolute top-2 left-2 size-4 fill-white text-white" />
                  <span className="absolute inset-x-2 bottom-2 line-clamp-2 type-label-s text-white drop-shadow">{product.short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="feed" className="mt-2">
        <div className="flex items-center justify-between bg-surface px-5 pt-4 pb-1">
          <h2 id="feed" className="type-h4">
            Fil des boutiques
          </h2>
          <Link href="/acheteur/fil/abonnements" className="inline-flex items-center gap-0.5 type-label-m text-fg-accent">
            Abonnements <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {photos.map((post) => (
            <PhotoPost key={post.id} post={post} shop={shops.find((s) => s.id === post.shopId)!} product={catalog.find((p) => p.id === post.productId)!} comments={comments} />
          ))}
        </div>
      </section>
    </>
  );
}
