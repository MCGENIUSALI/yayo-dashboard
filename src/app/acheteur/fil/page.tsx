import { Search } from "lucide-react";
import Link from "next/link";
import { FeedTabs } from "@/components/buyer/feed-tabs";
import { VideoSlide } from "@/components/buyer/social";
import { TabBar } from "@/components/buyer/tab-bar";
import { getCatalog, getFeed, getFeedComments, getShops } from "@/lib/api";

export const metadata = { title: "Pour toi" };

/** SC1 · Fil vidéo « Pour toi » + SC2 achat rapide, SC4 commentaires, SC5 partage (US-20, US-22). */
export default async function VideoFeed({ searchParams }: { searchParams: Promise<{ video?: string }> }) {
  const [feed, shops, catalog, comments, { video }] = await Promise.all([getFeed(), getShops(), getCatalog(), getFeedComments(), searchParams]);
  const videos = feed.filter((p) => p.kind === "video");
  const start = Math.max(0, videos.findIndex((v) => v.id === video));
  const ordered = [...videos.slice(start), ...videos.slice(0, start)];
  return (
    <div className="relative h-dvh bg-neutral-950" data-theme="dark">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-center px-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <FeedTabs active="pour-toi" dark />
        <Link href="/acheteur/recherche" aria-label="Rechercher" className="absolute right-4 flex size-10 items-center justify-center text-white">
          <Search className="size-6" />
        </Link>
      </div>
      <div className="h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom))] snap-y snap-mandatory overflow-y-auto scrollbar-none">
        {ordered.map((post) => (
          <VideoSlide key={post.id} post={post} shop={shops.find((s) => s.id === post.shopId)!} product={catalog.find((p) => p.id === post.productId)!} comments={comments} />
        ))}
      </div>
      <TabBar dark />
    </div>
  );
}
