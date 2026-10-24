"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { reportStockout, updateOrderStatus } from "@/lib/actions";
import type { Order, SellerOrderStatus } from "@/lib/types";

const next: Partial<Record<SellerOrderStatus, { label: string; to: SellerOrderStatus; done: string }>> = {
  new: { label: "Commencer la préparation", to: "preparing", done: "Commande en préparation" },
  preparing: { label: "Marquer comme prête pour collecte", to: "ready", done: "Commande prête : un livreur va être assigné" },
};

/** Sticky footer actions of V6 · Détail commande. */
export function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const toast = useToast();
  const [stockout, setStockout] = useState(false);
  const [line, setLine] = useState(order.lines[0] ? order.lines[0].product : "");
  const step = next[order.sellerStatus];

  const advance = useAsyncAction(async () => {
    if (!step) return;
    await updateOrderStatus(order.id, step.to);
    toast({ tone: "success", title: step.done, description: `Commande #${order.id}` });
  });
  const report = useAsyncAction(async () => {
    await reportStockout(order.id, line);
    setStockout(false);
    toast({ tone: "success", title: "Rupture signalée", description: "L’acheteur est prévenu et remboursé pour cet article." });
  });

  const closeStockout = () => {
    setStockout(false);
    report.reset();
  };
  const ready = order.sellerStatus === "ready";
  if (!step && !ready) return null;
  const done = advance.status === "success";

  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line-subtle bg-surface p-4 lg:static lg:rounded-lg lg:border">
        <div className="mx-auto flex max-w-xl flex-col gap-2 lg:max-w-none">
          <ActionError error={advance.error} onRetry={() => advance.run()} />
          {ready ? (
            <Button size="lg" block onClick={() => router.push(`/vendeur/commandes/${order.id}/remise`)}>
              Remettre au livreur
            </Button>
          ) : (
            <Button size="lg" block variant={done ? "secondary" : "primary"} loading={advance.pending} disabled={done} icon={done ? <Check className="size-5" /> : undefined} onClick={() => advance.run()}>
              {done ? "Statut mis à jour" : step?.label}
            </Button>
          )}
          {!ready && (
            <Button variant="ghost" block disabled={advance.pending} onClick={() => setStockout(true)}>
              Signaler une rupture
            </Button>
          )}
        </div>
      </div>

      <Sheet
        open={stockout}
        busy={report.pending}
        onClose={closeStockout}
        title="Signaler une rupture"
        footer={
          <div className="flex flex-col gap-3">
            <ActionError error={report.error} />
            <div className="flex gap-2">
              <Button variant="outline" block disabled={report.pending} onClick={closeStockout}>
                Annuler
              </Button>
              <Button variant="danger" block loading={report.pending} onClick={() => report.run()}>
                {report.error ? "Réessayer" : "Envoyer"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-body-m text-fg-secondary">L’acheteur est prévenu et remboursé automatiquement pour les articles manquants. Les fonds restent sous séquestre jusqu’à sa réponse.</p>
          <Field label="Article en rupture">
            {(id) => (
              <Select id={id} value={line} onChange={(e) => setLine(e.target.value)}>
                {order.lines.map((l) => (
                  <option key={l.product + l.variant} value={l.product}>
                    {l.product}
                    {l.variant && ` · ${l.variant}`}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Message (facultatif)">{(id) => <Textarea id={id} placeholder="Ex. couleur bientôt disponible" />}</Field>
        </div>
      </Sheet>
    </>
  );
}
