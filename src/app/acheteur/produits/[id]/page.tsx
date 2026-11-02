import { notFound } from "next/navigation";
import { ProductActions } from "@/components/buyer/product-actions";
import { getCatalogProduct, getShop } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await getCatalogProduct((await params).id);
  return { title: p?.short ?? "Produit" };
}

/** B4 · Fiche produit (US-03), E6 · Produit en rupture when stock is 0. */
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await getCatalogProduct((await params).id);
  if (!product) notFound();
  const shop = (await getShop(product.shopId))!;
  return <ProductActions product={product} shop={shop} />;
}
