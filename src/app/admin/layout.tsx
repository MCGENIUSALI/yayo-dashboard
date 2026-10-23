import { AppShell } from "@/components/layout/app-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navKey="admin"
      root="/admin"
      space="Admin"
      user={{ name: "Admin YA YO", role: "Chef de plateforme" }}
      notifications={{ href: "/admin/litiges", count: 5 }}
      searchPlaceholder="Rechercher une commande, un utilisateur…"
      mobileNav="drawer"
    >
      {children}
    </AppShell>
  );
}
