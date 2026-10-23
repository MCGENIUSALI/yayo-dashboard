import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { BarChart, Distribution } from "@/components/ui/bar-chart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getReports } from "@/lib/api";
import { formatFC } from "@/lib/format";

export const metadata = { title: "Rapports" };

export default async function ReportsPage() {
  const { gmvMonths, ordersByStatus, topSellers } = await getReports();
  const total = ordersByStatus.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Rapports"
        description="Performance globale · 6 derniers mois"
        actions={
          <>
            <Button variant="outline" size="sm">Dernier trimestre</Button>
            <Button size="sm" icon={<Download className="size-4" />}>Tout exporter</Button>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Volume d’affaires (GMV)" subtitle="En millions de FC · +12 % vs période précédente" action={<span className="type-h4 whitespace-nowrap md:type-h3">156,4 M FC</span>} />
          <div className="px-4 pt-6 pb-4 md:px-5">
            <BarChart data={gmvMonths} format={(v) => `${v} M FC`} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Commandes par statut" subtitle="Stable vs période précédente" action={<span className="type-h4 whitespace-nowrap md:type-h3">{total} total</span>} />
          <div className="p-4 md:p-5">
            <Distribution data={ordersByStatus} />
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Performance vendeurs" subtitle="Top 4 par volume d’affaires" />
        <div className="p-4 md:p-5">
          <DataTable
            rows={topSellers}
            rowKey={(s) => s.name}
            title={(s) => s.name}
            columns={[
              { key: "name", header: "Vendeur", cell: (s) => <span className="type-label-m">{s.name}</span>, hideOnMobile: true },
              { key: "gmv", header: "GMV", cell: (s) => <span className="tabular-nums whitespace-nowrap">{formatFC(s.gmv)}</span> },
              { key: "orders", header: "Commandes", cell: (s) => s.orders },
              { key: "rating", header: "Note", cell: (s) => `${s.rating.toLocaleString("fr-FR")} ★` },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
