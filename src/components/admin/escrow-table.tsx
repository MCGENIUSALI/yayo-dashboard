"use client";

import { useState } from "react";
import { ActionError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { PaymentBadge } from "@/components/ui/status";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { releaseEscrow } from "@/lib/actions";
import { ShieldCheck } from "lucide-react";
import { formatFC } from "@/lib/format";
import type { PaymentStatus, Transaction } from "@/lib/types";

type Tab = "all" | "held" | "release" | "failed" | "cash";
const match: Record<Tab, (t: Transaction) => boolean> = {
  all: () => true,
  held: (t) => (["held", "in_delivery", "pending"] as PaymentStatus[]).includes(t.status),
  release: (t) => t.status === "delivered",
  failed: (t) => t.status === "failed" || t.status === "refunded",
  cash: (t) => t.method === "Cash",
};

export function EscrowTable({ transactions }: { transactions: Transaction[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [rows, setRows] = useState(transactions);
  const list = rows.filter(match[tab]);
  const toast = useToast();
  // The target stays set while the sheet animates out, so its text never blanks.
  const [confirm, setConfirm] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    release.reset();
  };
  const ask = (t: Transaction) => {
    setConfirm(t);
    setOpen(true);
  };
  const release = useAsyncAction(async (t: Transaction) => {
    await releaseEscrow(t.id);
    setRows((rs) => rs.map((r) => (r.id === t.id ? { ...r, status: "released" } : r)));
    setOpen(false);
    toast({ tone: "success", title: "Fonds libérés", description: `${formatFC(t.amount)} versés à ${t.seller}` });
  });

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        value={tab}
        onChange={setTab}
        items={[
          { value: "all", label: "Toutes" },
          { value: "held", label: "En séquestre" },
          { value: "release", label: "À libérer" },
          { value: "failed", label: "Échecs" },
          { value: "cash", label: "Cash livreurs" },
        ]}
      />
      <DataTable
        rows={list}
        rowKey={(t) => t.id}
        title={(t) => `#${t.id}`}
        empty={<EmptyState icon={<ShieldCheck />} title="Aucune transaction" />}
        columns={[
          { key: "id", header: "Transaction", cell: (t) => <span className="type-label-m whitespace-nowrap">#{t.id}</span>, hideOnMobile: true },
          { key: "buyer", header: "Acheteur", cell: (t) => t.buyer },
          { key: "seller", header: "Vendeur", cell: (t) => t.seller },
          { key: "amount", header: "Montant", cell: (t) => <span className="tabular-nums whitespace-nowrap">{formatFC(t.amount)}</span> },
          { key: "status", header: "Statut paiement", cell: (t) => <PaymentBadge status={t.status} /> },
          { key: "method", header: "Moyen", cell: (t) => t.method },
        ]}
        action={(t) =>
          t.status === "delivered" ? (
            <Button size="sm" onClick={() => ask(t)}>
              Libérer
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              Détail
            </Button>
          )
        }
      />

      <Sheet
        open={open}
        busy={release.pending}
        onClose={close}
        title="Libérer les fonds ?"
        footer={
          <div className="flex flex-col gap-3">
            <ActionError error={release.error} />
            <div className="flex gap-2">
              <Button variant="outline" size="lg" block disabled={release.pending} onClick={close}>
                Annuler
              </Button>
              <Button size="lg" block loading={release.pending} onClick={() => confirm && release.run(confirm)}>
                {release.error ? "Réessayer" : "Libérer"}
              </Button>
            </div>
          </div>
        }
      >
        {confirm && (
          <p className="type-body-m text-fg-secondary">
            {formatFC(confirm.amount)} de la transaction #{confirm.id} seront versés à {confirm.seller}. L’opération ne peut pas être annulée depuis le back-office.
          </p>
        )}
      </Sheet>
    </div>
  );
}
