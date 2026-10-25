import { AppShell } from "@/components/layout/app-shell";
import { roleLabels } from "@/lib/auth/display";
import { requireRole } from "@/lib/auth/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole("admin");
  return (
    <AppShell
      navKey="admin"
      root="/admin"
      space="Admin"
      user={{ name: user.name, role: roleLabels.admin }}
      canSwitch={user.roles.length > 1}
      notifications={{ href: "/admin/litiges", count: 5 }}
      searchPlaceholder="Rechercher une commande, un utilisateur…"
      mobileNav="drawer"
    >
      {children}
    </AppShell>
  );
}
