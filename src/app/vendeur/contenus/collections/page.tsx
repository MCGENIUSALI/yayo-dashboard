import { PageHeader } from "@/components/layout/page-header";
import { CollectionsManager, ContentTabs } from "@/components/seller/content-studio";
import { getCollections, getProducts } from "@/lib/api";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([getCollections(), getProducts()]);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Gestion de contenu" title="Collections" />
      <ContentTabs />
      <CollectionsManager collections={collections} products={products} />
    </div>
  );
}
