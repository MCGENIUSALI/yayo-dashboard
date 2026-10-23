import { ArrowDownLeft, ArrowUpRight, ChartNoAxesColumn, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { WithdrawButton } from "@/components/seller/withdraw-button";
import { Card, Overline } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { MoneyRow, SectionHeader } from "@/components/ui/misc";
import { getPayouts, getSeller, getSellerKpis } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatFC, formatUSD } from "@/lib/format";

export const metadata = { title: "Revenus" };

export default async function RevenuePage() {
  const [kpis, seller, moves] = await Promise.all([getSellerKpis(), getSeller(), getPayouts()]);
  const net = kpis.monthSales.value - kpis.monthCommission - kpis.monthDelivery;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Octobre 2026" title="Revenus" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2 rounded-xl bg-inverse p-5 text-fg-inverse">
            <p className="type-label-m">Solde disponible</p>
            <p className="type-display tabular-nums">{formatFC(kpis.balance)}</p>
            <p className="type-body-s opacity-75">
              {formatUSD(kpis.balance)} · prochain virement {seller.payout.provider} le {kpis.nextPayout}
            </p>
            <div className="mt-2">
              <WithdrawButton balance={kpis.balance} account={`${seller.payout.provider} ${seller.payout.phone}`} />
            </div>
          </section>
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={<ShieldCheck />} label="Bloqués (séquestre)" value={formatFC(kpis.secured)} />
            <KpiCard icon={<ChartNoAxesColumn />} label="Ce mois" value={formatFC(kpis.monthSales.value)} trend="up" trendLabel={`+${kpis.monthSales.delta} % vs sem. dernière`} />
          </div>
        </div>

        <Card className="p-4 md:p-5">
          <Overline>Calcul du net · ce mois</Overline>
          <div className="mt-2">
            <MoneyRow label="Ventes encaissées" value={formatFC(kpis.monthSales.value)} />
            <MoneyRow label="Commission YA YO (10 %)" value={`− ${formatFC(kpis.monthCommission)}`} tone="success" />
            <MoneyRow label="Frais de livraison" value={`− ${formatFC(kpis.monthDelivery)}`} tone="success" />
            <div className="mt-2 border-t border-line-subtle">
              <MoneyRow label="Net vendeur" value={formatFC(net)} strong />
            </div>
          </div>
          <p className="mt-3 type-body-s text-fg-tertiary">La commission est prélevée sur le vendeur, jamais facturée à l’acheteur. Les fonds sont libérés 48 h après la livraison confirmée, sauf litige.</p>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Derniers mouvements" />
        <ul className="divide-y divide-line-subtle rounded-lg border border-line-subtle bg-surface">
          {moves.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3">
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", m.kind === "in" ? "bg-success-subtle text-fg-success" : "bg-surface-sunken")}>
                {m.kind === "in" ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate type-label-m">{m.label}</p>
                <p className="truncate type-body-s text-fg-tertiary">
                  {m.detail} · {m.at}
                </p>
              </div>
              <span className={cn("type-price-s whitespace-nowrap", m.kind === "in" && "text-fg-success")}>
                {m.kind === "in" ? "+" : "−"} {formatFC(Math.abs(m.amount))}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
