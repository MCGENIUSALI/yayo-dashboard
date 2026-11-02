import { PaymentStep } from "@/components/buyer/checkout";

export const metadata = { title: "Paiement" };

/** C3 · Paiement (Mobile Money, cash, carte) avec rappel du séquestre (US-05). */
export default function Page() {
  return <PaymentStep />;
}
