import { OrdersTabs } from "@/components/buyer/orders-tabs";
import { ScreenHeader } from "@/components/buyer/ui";
import { getBuyerOrders, getCatalog, getShops } from "@/lib/api";

export const metadata = { title: "Mes commandes" };

/** D1 · Mes commandes (US-06): En cours / Livrées / Litiges. */
export default async function OrdersPage() {
  const [orders, catalog, shops] = await Promise.all([getBuyerOrders(), getCatalog(), getShops()]);
  const ongoing = orders.filter((o) => o.tab === "ongoing").length;
  const rows = orders.map((o) => {
    const products = o.lines.map((l) => catalog.find((p) => p.id === l.productId)!);
    return {
      ...o,
      shopName: shops.find((s) => s.id === o.shopId)!.name,
      products: products.map((p) => ({ id: p.id, short: p.short, swatch: p.swatch, name: p.name })),
      total: o.lines.reduce((n, l) => n + l.unitPrice * l.qty, 0) + o.deliveryFee,
      items: o.lines.reduce((n, l) => n + l.qty, 0),
    };
  });
  return (
    <>
      <ScreenHeader overline={`${ongoing} commande${ongoing > 1 ? "s" : ""} en cours`} title="Mes commandes" />
      <OrdersTabs orders={rows} />
    </>
  );
}
