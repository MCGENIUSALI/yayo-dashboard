import type { Metadata } from "next";
import { CourierStoreProvider } from "@/components/courier/store";

export const metadata: Metadata = {
  title: { default: "YA YO! Livreur", template: "%s · YA YO! Livreur" },
  description: "App livreur YA YO : missions, collecte avec code vendeur, livraison avec code client, cash et revenus.",
};

/** Courier mobile app (Figma 07 · US-15 à US-19). */
export default function CourierLayout({ children }: { children: React.ReactNode }) {
  return (
    <CourierStoreProvider>
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-canvas shadow-e2 md:border-x md:border-line-subtle">{children}</div>
    </CourierStoreProvider>
  );
}
