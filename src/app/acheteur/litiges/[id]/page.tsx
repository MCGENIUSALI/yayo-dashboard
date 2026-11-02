import { notFound } from "next/navigation";
import { DisputeInfo } from "@/components/buyer/after-sale";
import { TopBar } from "@/components/buyer/top-bar";
import { InverseNote } from "@/components/buyer/ui";
import { MoneyRow } from "@/components/ui/misc";
import { PaymentBadge } from "@/components/ui/status";
import { Timeline } from "@/components/ui/timeline";
import { Search } from "lucide-react";
import { getBuyerDispute } from "@/lib/api";
import { formatFC } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Litige #${(await params).id}` };
}

/** D5 · Litige en cours (US-08). */
export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const d = await getBuyerDispute((await params).id);
  if (!d) notFound();
  return (
    <>
      <TopBar title={`Litige #${d.id}`} fallback="/acheteur/commandes" />
      <div className="flex flex-col gap-4 px-5 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="type-h4">Commande #{d.orderId}</p>
          <PaymentBadge status="disputed" />
        </div>
        <InverseNote title={`${formatFC(d.amount)} bloqués par YA YO`}>Ni le vendeur ni le livreur ne sont payés pendant l’examen. Décision sous 72 h.</InverseNote>
        <section className="rounded-xl bg-surface p-4">
          <MoneyRow label="Motif" value={d.reason} />
          <MoneyRow label="Ouvert le" value={d.openedAt} />
          <MoneyRow label="Pièces jointes" value={`${d.attachments} photo${d.attachments > 1 ? "s" : ""}`} />
        </section>
        <section aria-labelledby="avancement">
          <h2 id="avancement" className="mb-3 type-h4">
            Avancement
          </h2>
          <Timeline
            steps={[
              { title: "Signalement envoyé", detail: d.openedAt, state: "done" },
              { title: "Examen par l’équipe YA YO", detail: "Nous contactons le vendeur et le livreur", state: "current", icon: <Search /> },
              { title: "Décision", detail: "Remboursement, échange ou paiement du vendeur", state: "upcoming" },
            ]}
          />
        </section>
      </div>
      <DisputeInfo id={d.id} />
    </>
  );
}
