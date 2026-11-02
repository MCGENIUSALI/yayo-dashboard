import { Eye, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CatalogTabs } from "@/components/seller/catalog-tabs";
import { PostsGrid } from "@/components/seller/posts-grid";
import { KpiCard } from "@/components/ui/kpi-card";
import { getPosts, getSeller } from "@/lib/api";
import { formatCompact, formatFC } from "@/lib/format";

export const metadata = { title: "Contenus" };

export default async function PostsPage() {
  const [posts, seller] = await Promise.all([getPosts(), getSeller()]);
  const views = posts.reduce((s, p) => s + p.stats.views, 0);
  const revenue = posts.reduce((s, p) => s + p.stats.revenue, 0);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow={`${seller.name} · ${formatCompact(seller.followers)} abonnés`} title="Contenus" />
      <CatalogTabs />
      <div className="grid grid-cols-2 gap-3 lg:max-w-2xl">
        <KpiCard icon={<Eye />} label="Vues (7 j)" value={formatCompact(views)} trend="up" trendLabel="+12 % vs sem. dernière" />
        <KpiCard icon={<ShoppingBag />} label="Ventes via contenus" value={formatFC(revenue)} trend="up" trendLabel="+12 % vs sem. dernière" />
      </div>
      <PostsGrid posts={posts} />
    </div>
  );
}
