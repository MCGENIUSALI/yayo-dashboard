import { PageHeader } from "@/components/layout/page-header";
import { ContentAnalytics, ContentTabs } from "@/components/seller/content-studio";
import { getContentAnalytics, getPosts } from "@/lib/api";

export const metadata = { title: "Mes performances" };

export default async function PerformancesPage() {
  const [stats, posts] = await Promise.all([getContentAnalytics(), getPosts()]);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Gestion de contenu" title="Mes performances" />
      <ContentTabs />
      <ContentAnalytics stats={stats} posts={posts} />
    </div>
  );
}
