import { Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { ShopProducts } from "@/components/buyer/shop-products";
import { FollowButton } from "@/components/buyer/social";
import { TopBar } from "@/components/buyer/top-bar";
import { Stars } from "@/components/buyer/ui";
import { ShareButton } from "@/components/buyer/share-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCatalog, getShop } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: (await getShop((await params).id))?.name ?? "Boutique" };
}

/** B5 · Boutique vendeur (US-03). No direct contact: questions go through YA YO support. */
export default async function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const shop = await getShop((await params).id);
  if (!shop) notFound();
  const products = (await getCatalog()).filter((p) => p.shopId === shop.id);
  return (
    <>
      <TopBar title={shop.name} fallback="/acheteur/explorer" trailing={<ShareButton title={shop.name} />} />
      <div className="flex flex-col gap-4 p-5">
        <section className="flex flex-col gap-4 rounded-xl bg-surface p-4">
          <div className="flex items-center gap-4">
            <Avatar name={shop.name} verified={shop.verified} size="xl" />
            <div className="min-w-0">
              <h2 className="type-h3">{shop.name}</h2>
              <Stars value={shop.rating} reviews={shop.reviews} />
              <p className="type-body-s text-fg-tertiary">
                {shop.category} · {shop.area}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {shop.verified && <Badge tone="success">Vendeur vérifié</Badge>}
            <Badge icon={<Truck />}>Livraison {shop.delivery}</Badge>
          </div>
          <FollowButton shop={shop} size="lg" />
        </section>
        <p className="type-body-s text-fg-tertiary">Une question ? Passe par le support YA YO : pas d’échange direct avec le vendeur.</p>
        <ShopProducts products={products} shopName={shop.name} />
      </div>
    </>
  );
}
