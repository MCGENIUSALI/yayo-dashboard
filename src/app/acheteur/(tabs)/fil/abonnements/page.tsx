import { FeedTabs } from "@/components/buyer/feed-tabs";
import { HeaderActions } from "@/components/buyer/header-actions";
import { PhotoPost } from "@/components/buyer/social";
import { Logo } from "@/components/ui/logo";
import { getBuyerNotifications, getCatalog, getFeed, getFeedComments, getShops } from "@/lib/api";
import { followedShops } from "@/lib/data/buyer";

export const metadata = { title: "Abonnements" };

/** SC3 · Fil photos des boutiques suivies (US-21). */
export default async function FollowingFeed() {
  const [feed, shops, catalog, comments, notifications] = await Promise.all([getFeed(), getShops(), getCatalog(), getFeedComments(), getBuyerNotifications()]);
  const posts = feed.filter((p) => followedShops.includes(p.shopId));
  return (
    <>
      <header className="sticky top-0 z-30 flex flex-col gap-3 bg-surface/95 px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <HeaderActions unread={notifications.filter((n) => n.unread).length} />
        </div>
        <FeedTabs active="abonnements" />
      </header>
      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <PhotoPost key={post.id} post={post} shop={shops.find((s) => s.id === post.shopId)!} product={catalog.find((p) => p.id === post.productId)!} comments={comments} />
        ))}
      </div>
    </>
  );
}
