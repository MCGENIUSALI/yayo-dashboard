import { Banknote, Bike, Clock, Star } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CouriersTable } from "@/components/admin/couriers-table";
import { KpiCard } from "@/components/ui/kpi-card";
import { getCouriers } from "@/lib/api";
import { formatFC } from "@/lib/format";

export const metadata = { title: "Livreurs" };

export default async function CouriersPage() {
  const couriers = await getCouriers();
  const cash = couriers.reduce((s, c) => s + c.cashToReturn, 0);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Livreurs" description="Disponibilité, missions et cash encaissé à la livraison (§7.5.7)" />
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Bike />} label="Actifs aujourd’hui" value={86} trend="neutral" trendLabel="Stable" />
        <KpiCard icon={<Clock />} label="Délai moyen" value="42 min" trend="up" trendLabel="−5 min vs période préc." />
        <KpiCard icon={<Banknote />} label="Cash à reverser" value={formatFC(cash)} trend="down" trendLabel={`${couriers.filter((c) => c.cashToReturn > 0).length} livreurs`} />
        <KpiCard icon={<Star />} label="Note moyenne" value="4,7 ★" />
      </section>
      <CouriersTable couriers={couriers} />
    </div>
  );
}
