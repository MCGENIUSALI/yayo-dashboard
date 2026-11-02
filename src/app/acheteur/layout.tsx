import type { Metadata } from "next";
import { BuyerStoreProvider } from "@/components/buyer/store";

export const metadata: Metadata = {
  title: { default: "YA YO! · Acheter en confiance", template: "%s · YA YO!" },
  description: "Marketplace congolaise : achète auprès de boutiques vérifiées, paiement protégé par séquestre et livraison suivie à Kinshasa.",
};

/**
 * Buyer mobile app (Figma 07 · US-01 à US-09, US-20 à US-23).
 * Phone-width column, centred on larger screens.
 */
export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BuyerStoreProvider>
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-canvas shadow-e2 md:border-x md:border-line-subtle">{children}</div>
    </BuyerStoreProvider>
  );
}
