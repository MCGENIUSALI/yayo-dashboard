import { Lock, PackageCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { HandoverConfirm } from "@/components/seller/handover-confirm";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CodeBoxes } from "@/components/ui/misc";
import { DeliveryBadge } from "@/components/ui/status";
import { getSellerOrder } from "@/lib/api";

export const metadata = { title: "Remise au livreur" };

export default async function HandoverPage({ params }: PageProps<"/vendeur/commandes/[id]/remise">) {
  const { id } = await params;
  const order = await getSellerOrder(id);
  if (!order) notFound();
  const items = order.lines.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <PageHeader back={`/vendeur/commandes/${order.id}`} title="Remise au livreur" />
      <div className="flex items-center justify-between">
        <p className="type-label-l">Commande #{order.id}</p>
        <DeliveryBadge status="picking_up" />
      </div>
      <Card className="flex items-center gap-3 p-4">
        <Avatar name={order.courier ?? "Patrick K."} verified />
        <div>
          <p className="type-label-l">{order.courier ?? "Patrick K."} arrive</p>
          <p className="type-body-s text-fg-tertiary">Moto · Livreur vérifié · à 4 min</p>
        </div>
      </Card>
      <div className="flex flex-col gap-4 rounded-lg border-2 border-dashed border-accent/60 bg-accent-subtle p-5 text-center">
        <p className="inline-flex items-center justify-center gap-2 type-label-m text-fg-accent">
          <Lock className="size-4" /> Code de remise
        </p>
        <CodeBoxes code={order.handoverCode ?? "0000"} />
        <p className="type-body-s text-fg-secondary">Le livreur saisit ce code pour confirmer la collecte. Ne remets le colis qu’à lui.</p>
      </div>
      <Alert tone="info" icon={<PackageCheck />} title="Vérifie avant de remettre">
        Colis fermé, étiquette #{order.id} collée, {items} article{items > 1 ? "s" : ""}.
      </Alert>
      <HandoverConfirm orderId={order.id} />
    </div>
  );
}
