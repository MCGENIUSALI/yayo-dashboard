import { PageHeader } from "@/components/layout/page-header";
import { StoryComposer } from "@/components/seller/content-studio";
import { getProducts } from "@/lib/api";

export const metadata = { title: "Nouvelle story" };

export default async function NewStoryPage() {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/vendeur/contenus/stories" title="Nouvelle story" />
      <StoryComposer products={products} />
    </div>
  );
}
