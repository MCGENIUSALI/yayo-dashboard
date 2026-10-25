import { AppShell } from "@/components/layout/app-shell";
import { roleLabels } from "@/lib/auth/display";
import { requireRole } from "@/lib/auth/server";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole("seller");
  return (
    <AppShell
      navKey="seller"
      root="/vendeur"
      space="Vendeur"
      user={{ name: user.name, role: roleLabels.seller }}
      canSwitch={user.roles.length > 1}
      notifications={{ href: "/vendeur/notifications", count: 3 }}
      searchPlaceholder="Rechercher une commande, un produit…"
      mobileNav="bottom"
    >
      {children}
    </AppShell>
  );
}
