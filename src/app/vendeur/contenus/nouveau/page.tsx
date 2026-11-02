import { PageHeader } from "@/components/layout/page-header";
import { PostComposer } from "@/components/seller/post-composer";
import { getProducts } from "@/lib/api";

export const metadata = { title: "Nouvelle publication" };

export default async function NewPostPage() {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/vendeur/contenus" title="Nouvelle publication" />
      <PostComposer products={products} />
    </div>
  );
}
