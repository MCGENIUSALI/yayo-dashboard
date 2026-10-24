import { Banknote, Bike, ChartNoAxesColumn, Package, Scale, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { KpiCard } from "@/components/ui/kpi-card";
import { buttonClass } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/misc";
import { PaymentBadge } from "@/components/ui/status";
import { getAdminKpis, getWatchOrders } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatFC } from "@/lib/format";
import { orderTotal } from "@/lib/orders";
import type { Order } from "@/lib/types";

export const metadata = { title: "Tableau de bord admin" };

// Refresh the date line and KPIs every hour.
export const revalidate = 3600;

const actionFor: Record<string, string> = { disputed: "Examiner", failed: "Voir", in_delivery: "Suivre", delivered: "Libérer" };

const alerts = [
  { href: "/admin/kyc", tone: "bg-warning-subtle text-fg-warning", icon: UserCheck, title: "7 dossiers KYC en attente", body: "5 livreurs, 2 vendeurs" },
  { href: "/admin/litiges", tone: "bg-danger-subtle text-fg-danger", icon: Scale, title: "3 litiges dépassent 48 h", body: "Décision attendue sous 72 h" },
  { href: "/admin/livreurs", tone: "bg-info-subtle text-fg-info", icon: Banknote, title: "12 livreurs n’ont pas reversé leur cash", body: "2 340 000 FC au total" },
];

export default async function AdminDashboard() {
  const [k, orders] = await Promise.all([getAdminKpis(), getWatchOrders()]);
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kinshasa" }).format(new Date());
  const dateLine = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Tableau de bord" description={`${dateLine} · Kinshasa`} />

      <section aria-label="Indicateurs" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard className="col-span-2 md:col-span-1" icon={<ChartNoAxesColumn />} label="Volume d’affaires (jour)" value={formatFC(k.gmvToday.value)} trend={k.gmvToday.trend} trendLabel={k.gmvToday.delta} />
        <KpiCard icon={<Package />} label="Commandes" value={k.orders.value} trend={k.orders.trend} trendLabel={k.orders.delta} />
        <KpiCard icon={<ShieldCheck />} label="Fonds en séquestre" value={formatFC(k.escrow.value)} trend={k.escrow.trend} trendLabel={k.escrow.delta} />
        <KpiCard icon={<Scale />} label="Litiges ouverts" value={k.disputes.value} trend={k.disputes.trend} trendLabel={k.disputes.delta} />
        <KpiCard icon={<Bike />} label="Livreurs actifs" value={k.couriers.value} trend={k.couriers.trend} trendLabel={k.couriers.delta} />
      </section>

      <section aria-label="Alertes" className="grid gap-3 md:grid-cols-3">
        {alerts.map(({ href, tone, icon: Icon, title, body }) => (
          <Link key={href} href={href} className={cn("pressable flex gap-3 rounded-lg p-4 hover:opacity-90", tone)}>
            <Icon className="mt-0.5 size-5 shrink-0" />
            <span>
              <span className="block type-label-m">{title}</span>
              <span className="block type-body-s text-fg-secondary">{body}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Commandes à surveiller" href="/admin/commandes" />
        <DataTable<Order>
          rows={orders}
          rowKey={(o) => o.id}
          title={(o) => `#${o.id}`}
          columns={[
            { key: "id", header: "Commande", cell: (o) => <span className="type-label-m whitespace-nowrap">#{o.id}</span>, hideOnMobile: true },
            { key: "buyer", header: "Acheteur", cell: (o) => o.buyer },
            { key: "seller", header: "Vendeur", cell: (o) => o.seller },
            { key: "amount", header: "Montant", cell: (o) => <span className="tabular-nums">{formatFC(orderTotal(o))}</span> },
            { key: "payment", header: "Paiement", cell: (o) => <PaymentBadge status={o.payment} /> },
            { key: "since", header: "Depuis", cell: (o) => o.createdAt },
          ]}
          action={(o) => (
            <Link href={o.payment === "disputed" ? "/admin/litiges" : o.payment === "delivered" ? "/admin/sequestre" : `/admin/commandes?id=${o.id}`} className={buttonClass({ variant: "outline", size: "sm" })}>
              {actionFor[o.payment] ?? "Voir"}
            </Link>
          )}
        />
      </section>
    </div>
  );
}
