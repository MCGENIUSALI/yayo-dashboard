import { PageHeader } from "@/components/layout/page-header";
import { ContentTabs, StoriesBoard } from "@/components/seller/content-studio";
import { getProducts, getStories } from "@/lib/api";

export const metadata = { title: "Stories" };

export default async function StoriesPage() {
  const [stories, products] = await Promise.all([getStories(), getProducts()]);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Gestion de contenu" title="Stories" />
      <ContentTabs />
      <StoriesBoard stories={stories} products={products} />
    </div>
  );
}
