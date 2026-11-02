import { PageHeader } from "@/components/layout/page-header";
import { ContentTabs, LivesBoard } from "@/components/seller/content-studio";
import { getLives, getProducts } from "@/lib/api";

export const metadata = { title: "Lives" };

export default async function LivesPage() {
  const [lives, products] = await Promise.all([getLives(), getProducts()]);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Gestion de contenu" title="Lives" />
      <ContentTabs />
      <LivesBoard lives={lives} products={products} />
    </div>
  );
}
