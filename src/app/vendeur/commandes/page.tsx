import { PageHeader } from "@/components/layout/page-header";
import { OrdersBoard } from "@/components/seller/orders-board";
import { getSellerOrders } from "@/lib/api";

export const metadata = { title: "Commandes" };

export default async function SellerOrdersPage() {
  const orders = await getSellerOrders();
  const todo = orders.filter((o) => o.sellerStatus === "new" || o.sellerStatus === "preparing").length;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow={`${todo} à traiter aujourd’hui`} title="Commandes" />
      <OrdersBoard orders={orders} />
    </div>
  );
}
