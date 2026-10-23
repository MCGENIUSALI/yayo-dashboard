import { AppShell } from "@/components/layout/app-shell";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navKey="seller"
      root="/vendeur"
      space="Vendeur"
      user={{ name: "Grâce Mbala", role: "JBL Store Kin" }}
      notifications={{ href: "/vendeur/notifications", count: 3 }}
      searchPlaceholder="Rechercher une commande, un produit…"
      mobileNav="bottom"
    >
      {children}
    </AppShell>
  );
}
