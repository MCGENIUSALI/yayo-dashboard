import { Bell, ChartNoAxesColumn, Package, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SellerOrderCard } from "@/components/seller/order-card";
import { BarChart } from "@/components/ui/bar-chart";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { PostTile } from "@/components/ui/media";
import { SectionHeader } from "@/components/ui/misc";
import { getPosts, getSalesWeek, getSeller, getSellerKpis, getSellerNotifications, getSellerOrders } from "@/lib/api";
import { formatCompact, formatFC, formatNumber } from "@/lib/format";

export const metadata = { title: "Tableau de bord vendeur" };

export default async function SellerDashboard() {
  const [seller, kpis, week, orders, notifications, posts] = await Promise.all([getSeller(), getSellerKpis(), getSalesWeek(), getSellerOrders(), getSellerNotifications(), getPosts()]);
  const newOrders = orders.filter((o) => o.sellerStatus === "new");
  const topPosts = posts.filter((p) => p.state === "published").slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={`Bonjour ${seller.owner} 👋`} title={seller.name} />

      <section aria-label="Indicateurs" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard icon={<ChartNoAxesColumn />} label="Ventes du jour" value={formatFC(kpis.salesToday.value)} trend="up" trendLabel={`+${kpis.salesToday.delta} % vs hier`} />
        <KpiCard icon={<Package />} label="Commandes à traiter" value={kpis.toProcess} trend="neutral" trendLabel="Stable" />
        <KpiCard icon={<ShieldCheck />} label="Fonds sécurisés" value={formatFC(kpis.secured)} trend="up" trendLabel="Libérés à la livraison" />
        <KpiCard icon={<Star />} label="Note moyenne" value={`${kpis.rating.value.toLocaleString("fr-FR")} ★`} trend="down" trendLabel={`${kpis.rating.delta.toLocaleString("fr-FR")} ce mois`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Ventes des 7 derniers jours" subtitle={`${formatFC(week.reduce((s, d) => s + d.value, 0))} encaissés sous séquestre`} />
            <div className="px-4 pt-6 pb-4 md:px-5">
              <BarChart data={week} format={formatFC} />
            </div>
          </Card>

          <section className="flex flex-col gap-3">
            <SectionHeader title="Nouvelles commandes" href="/vendeur/commandes" />
            <div className="grid gap-3 md:grid-cols-2">
              {newOrders.map((o) => (
                <SellerOrderCard key={o.id} order={o} />
              ))}
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Notifications" action={<Bell className="size-5 text-fg-tertiary" />} />
            <ul className="mt-2 pb-2">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id}>
                  <Link href={n.href ?? "/vendeur/notifications"} className="flex gap-3 px-4 py-2.5 hover:bg-surface-muted md:px-5">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.unread ? "bg-accent" : "bg-transparent"}`} />
                    <span className="min-w-0">
                      <span className="block type-label-m">{n.title}</span>
                      <span className="block truncate type-body-s text-fg-tertiary">{n.body}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <section className="flex flex-col gap-3">
            <SectionHeader title="Mes contenus" href="/vendeur/contenus" />
            <div className="grid grid-cols-3 gap-2">
              {topPosts.map((p) => (
                <Link key={p.id} href={`/vendeur/contenus/${p.id}`} aria-label={p.caption}>
                  <PostTile swatch={p.cover} caption={p.caption} kind={p.kind} views={p.stats.views} />
                </Link>
              ))}
            </div>
            <p className="type-body-s text-fg-tertiary">
              {formatCompact(posts.reduce((s, p) => s + p.stats.views, 0))} vues · {formatNumber(posts.reduce((s, p) => s + p.stats.sales, 0))} ventes générées par les contenus
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
