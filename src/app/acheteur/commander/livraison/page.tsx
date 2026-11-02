import { DeliveryStep } from "@/components/buyer/checkout";

export const metadata = { title: "Livraison" };

/** C2 · Livraison (adresse, créneau, consigne) (US-05). */
export default function Page() {
  return <DeliveryStep />;
}
