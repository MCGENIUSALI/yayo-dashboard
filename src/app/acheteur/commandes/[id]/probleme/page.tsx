import { notFound } from "next/navigation";
import { DisputeForm } from "@/components/buyer/after-sale";
import { getBuyerOrder, getShop } from "@/lib/api";

export const metadata = { title: "Signaler un problème" };

/** D4 · Signaler un problème (US-08): the funds stay blocked while YA YO decides. */
export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await getBuyerOrder((await params).id);
  if (!order) notFound();
  const shop = (await getShop(order.shopId))!;
  return <DisputeForm orderId={order.id} shopName={shop.name} />;
}
