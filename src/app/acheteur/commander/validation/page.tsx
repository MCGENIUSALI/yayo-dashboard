import { MobileMoneyStep } from "@/components/buyer/checkout";

export const metadata = { title: "Paiement en cours" };

/** C4 · Validation Mobile Money (US-05). */
export default function Page() {
  return <MobileMoneyStep />;
}
