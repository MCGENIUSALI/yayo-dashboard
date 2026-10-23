import { PageHeader } from "@/components/layout/page-header";
import { OrdersAdmin } from "@/components/admin/orders-admin";
import { getAllOrders } from "@/lib/api";

export const metadata = { title: "Commandes" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  const [{ id }, orders] = await Promise.all([searchParams, getAllOrders()]);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Commandes" description="Toutes les commandes, avec leur statut de paiement et de livraison" />
      <OrdersAdmin orders={orders} initialId={typeof id === "string" ? id : undefined} />
    </div>
  );
}
