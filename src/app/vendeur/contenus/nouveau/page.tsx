import { PageHeader } from "@/components/layout/page-header";
import { PostComposer } from "@/components/seller/post-composer";
import { getProducts } from "@/lib/api";

export const metadata = { title: "Nouvelle publication" };

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [products, { type }] = await Promise.all([getProducts(), searchParams]);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/vendeur/contenus" title="Nouvelle publication" />
      <PostComposer products={products} initialKind={type === "photo" ? "photo" : "video"} />
    </div>
  );
}
