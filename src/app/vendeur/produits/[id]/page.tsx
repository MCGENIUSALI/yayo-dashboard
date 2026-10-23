import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/seller/product-form";
import { getProduct } from "@/lib/api";

export const metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params }: PageProps<"/vendeur/produits/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/vendeur/produits" title="Modifier le produit" />
      <ProductForm product={product} />
    </div>
  );
}
