import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/seller/product-form";

export const metadata = { title: "Nouveau produit" };

export default function NewProductPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PageHeader back="/vendeur/produits" title="Nouveau produit" />
      <ProductForm />
    </div>
  );
}
