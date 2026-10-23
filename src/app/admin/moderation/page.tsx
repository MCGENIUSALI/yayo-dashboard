import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { Alert } from "@/components/ui/alert";
import { getReportedComments } from "@/lib/api";

export const metadata = { title: "Modération sociale" };

export default async function ModerationPage() {
  const items = await getReportedComments();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Modération sociale" description={`${items.length} commentaires signalés sur les publications des vendeurs`} />
      <Alert tone="info" icon={<ShieldCheck />} title="Règle de la plateforme">
        Le cahier des charges interdit l’échange direct entre acheteur et vendeur : numéros, liens et demandes de paiement hors application sont masqués automatiquement.
      </Alert>
      <ModerationQueue items={items} />
    </div>
  );
}
