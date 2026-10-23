import { Calendar, MapPin, Package, Phone, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UserActions } from "@/components/admin/user-actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { KpiCard } from "@/components/ui/kpi-card";
import { ListRow } from "@/components/ui/misc";
import { PaymentBadge } from "@/components/ui/status";
import { getAllOrders, getUser } from "@/lib/api";
import { formatFC } from "@/lib/format";
import { roleLabel, userStatus } from "@/lib/labels";
import { orderTotal } from "@/lib/orders";

export const metadata = { title: "Détail utilisateur" };

export default async function UserPage({ params }: PageProps<"/admin/utilisateurs/[id]">) {
  const { id } = await params;
  const [user, orders] = await Promise.all([getUser(id), getAllOrders()]);
  if (!user) notFound();
  const first = user.name.split(" ")[0];
  const related = orders.filter((o) => o.buyer.startsWith(first) || o.seller === user.name).slice(0, 5);
  const b = userStatus[user.status];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/admin/utilisateurs" title={user.name} actions={<UserActions user={user} />} />
      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 p-5">
            <Avatar name={user.name} size="xl" verified={user.status === "active" && user.role !== "buyer"} />
            <div className="flex flex-col gap-1.5">
              <p className="type-h4">{user.name}</p>
              <div className="flex gap-1.5">
                <Badge>{roleLabel[user.role]}</Badge>
                <Badge tone={b.tone}>{b.label}</Badge>
              </div>
            </div>
          </div>
          <div className="divide-y divide-line-subtle border-t border-line-subtle">
            <ListRow icon={<Phone />} title="Téléphone" subtitle={user.phone} />
            <ListRow icon={<MapPin />} title="Commune" subtitle={`${user.area}, Kinshasa`} />
            <ListRow icon={<Calendar />} title="Inscrit" subtitle={user.joinedAt} />
          </div>
        </Card>
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={<Package />} label={user.role === "courier" ? "Missions" : "Commandes"} value={user.orders} />
            <KpiCard icon={<Star />} label="Note" value={user.rating ? `${user.rating.toLocaleString("fr-FR")} ★` : "—"} />
          </div>
          <Card>
            <CardHeader title="Commandes récentes" />
            <div className="p-4 md:p-5">
              <DataTable
                rows={related}
                rowKey={(o) => o.id}
                title={(o) => `#${o.id}`}
                empty={<p className="type-body-m text-fg-secondary">Aucune commande récente.</p>}
                columns={[
                  { key: "id", header: "Commande", cell: (o) => <span className="type-label-m whitespace-nowrap">#{o.id}</span>, hideOnMobile: true },
                  { key: "seller", header: "Vendeur", cell: (o) => o.seller },
                  { key: "amount", header: "Montant", cell: (o) => formatFC(orderTotal(o)) },
                  { key: "payment", header: "Paiement", cell: (o) => <PaymentBadge status={o.payment} /> },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
