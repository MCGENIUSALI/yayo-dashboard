import { CartScreen } from "@/components/buyer/cart-screen";
import { getShops } from "@/lib/api";

export const metadata = { title: "Mon panier" };

/** C1 · Panier multi-vendeur, E7 · Panier ajusté, D8 · Panier vide (US-04). */
export default async function CartPage() {
  return <CartScreen shops={await getShops()} />;
}
