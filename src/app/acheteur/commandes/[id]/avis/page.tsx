import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/buyer/after-sale";
import { getBuyerOrder, getShop } from "@/lib/api";

export const metadata = { title: "Commande livrée" };

/** D3 · Livrée · Noter (US-07): rate the shop and the courier. */
export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await getBuyerOrder((await params).id);
  if (!order) notFound();
  const shop = (await getShop(order.shopId))!;
  return <ReviewForm orderId={order.id} shopName={shop.name} courier={order.courier?.name ?? "ton livreur"} deliveredAt={order.deliveredAt ?? "aujourd’hui"} />;
}
