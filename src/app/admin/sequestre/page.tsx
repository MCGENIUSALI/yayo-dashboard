import { Clock, Info, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EscrowTable } from "@/components/admin/escrow-table";
import { Alert } from "@/components/ui/alert";
import { KpiCard } from "@/components/ui/kpi-card";
import { getEscrowKpis, getTransactions } from "@/lib/api";
import { formatFC } from "@/lib/format";

export const metadata = { title: "Paiements et séquestre" };

export default async function EscrowPage() {
  const [k, tx] = await Promise.all([getEscrowKpis(), getTransactions()]);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Paiements et séquestre" description="Synchronisé avec les statuts de livraison" />
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<ShieldCheck />} label="Bloqués en séquestre" value={formatFC(k.held)} />
        <KpiCard icon={<Clock />} label="À libérer (48 h écoulées)" value={formatFC(k.toRelease)} />
        <KpiCard icon={<Send />} label="Libérés ce mois" value={formatFC(k.releasedMonth)} />
        <KpiCard icon={<RotateCcw />} label="Remboursés ce mois" value={formatFC(k.refundedMonth)} />
      </section>
      <EscrowTable transactions={tx} />
      <Alert tone="inverse" icon={<Info />} title="Règle de libération">
        Les fonds passent en « Libérés » 48 h après la livraison confirmée par le livreur, sauf litige ouvert.
      </Alert>
    </div>
  );
}
