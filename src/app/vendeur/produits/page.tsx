import { PageHeader } from "@/components/layout/page-header";
import { CatalogTabs } from "@/components/seller/catalog-tabs";
import { ProductList } from "@/components/seller/product-list";
import { getProducts } from "@/lib/api";

export const metadata = { title: "Mes produits" };

export default async function ProductsPage() {
  const products = await getProducts();
  const out = products.filter((p) => p.stock === 0).length;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow={`${products.length} produits · ${out} en rupture`} title="Mes produits" />
      <CatalogTabs />
      <ProductList products={products} />
    </div>
  );
}
