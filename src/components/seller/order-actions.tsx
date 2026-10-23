"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import type { Order } from "@/lib/types";

/** Sticky footer actions of V6 · Détail commande. */
export function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [stockout, setStockout] = useState(false);
  const [done, setDone] = useState(false);

  const primary =
    order.sellerStatus === "new"
      ? { label: "Commencer la préparation", onClick: () => setDone(true) }
      : order.sellerStatus === "preparing"
        ? { label: "Marquer comme prête pour collecte", onClick: () => setDone(true) }
        : order.sellerStatus === "ready"
          ? { label: "Remettre au livreur", onClick: () => router.push(`/vendeur/commandes/${order.id}/remise`) }
          : null;

  if (!primary) return null;
  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line-subtle bg-surface p-4 lg:static lg:rounded-lg lg:border">
        <div className="mx-auto flex max-w-xl flex-col gap-2 lg:max-w-none">
          <Button size="lg" block onClick={primary.onClick} disabled={done}>
            {done ? "Statut mis à jour ✓" : primary.label}
          </Button>
          {order.sellerStatus !== "ready" && (
            <Button variant="ghost" block onClick={() => setStockout(true)}>
              Signaler une rupture
            </Button>
          )}
        </div>
      </div>

      <Sheet
        open={stockout}
        onClose={() => setStockout(false)}
        title="Signaler une rupture"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" block onClick={() => setStockout(false)}>
              Annuler
            </Button>
            <Button variant="danger" block onClick={() => setStockout(false)}>
              Envoyer
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-body-m text-fg-secondary">L’acheteur est prévenu et remboursé automatiquement pour les articles manquants. Les fonds restent sous séquestre jusqu’à sa réponse.</p>
          <Field label="Article en rupture">
            {(id) => (
              <Select id={id}>
                {order.lines.map((l) => (
                  <option key={l.product}>
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
