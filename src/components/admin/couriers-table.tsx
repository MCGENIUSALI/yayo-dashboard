"use client";

import { Check, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Chips } from "@/components/ui/segmented";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { remindCourier } from "@/lib/actions";
import { formatFC } from "@/lib/format";
import type { Courier } from "@/lib/types";

const status: Record<Courier["status"], { label: string; tone: "success" | "info" | "neutral" }> = {
  available: { label: "Disponible", tone: "success" },
  on_mission: { label: "En mission", tone: "info" },
  offline: { label: "Hors ligne", tone: "neutral" },
};

/** One request state per row: reminding a courier never blocks the other rows. */
function RemindButton({ courier }: { courier: Courier }) {
  const toast = useToast();
  const remind = useAsyncAction(async () => {
    await remindCourier(courier.id);
    toast({ tone: "success", title: "Relance envoyée", description: `${courier.name} · ${formatFC(courier.cashToReturn)} à reverser` });
  });
  if (remind.status === "success")
    return (
      <Button size="sm" variant="secondary" disabled icon={<Check className="size-3.5" />}>
        Relancé
      </Button>
    );
  return (
    <Button size="sm" variant={remind.error ? "danger" : "primary"} loading={remind.pending} title={remind.error ?? undefined} onClick={() => remind.run()}>
      {remind.error ? "Échec · Réessayer" : "Relancer"}
    </Button>
  );
}

export function CouriersTable({ couriers }: { couriers: Courier[] }) {
  const [filter, setFilter] = useState<"all" | "cash" | Courier["status"]>("all");
  const list = couriers.filter((c) => (filter === "all" ? true : filter === "cash" ? c.cashToReturn > 0 : c.status === filter));
  return (
    <div className="flex flex-col gap-4">
      <Chips
        value={filter}
        onChange={setFilter}
        items={[
          { value: "all", label: "Tous", count: couriers.length },
          { value: "available", label: "Disponibles" },
          { value: "on_mission", label: "En mission" },
          { value: "cash", label: "Cash à reverser" },
        ]}
      />
      <DataTable
        rows={list}
        rowKey={(c) => c.id}
        title={(c) => c.name}
        columns={[
          { key: "name", header: "Livreur", cell: (c) => <span className="type-label-m">{c.name}</span>, hideOnMobile: true },
          { key: "vehicle", header: "Véhicule", cell: (c) => c.vehicle },
          { key: "area", header: "Zone", cell: (c) => c.area },
          { key: "status", header: "Statut", cell: (c) => <Badge tone={status[c.status].tone}>{status[c.status].label}</Badge> },
          { key: "missions", header: "Missions (jour)", cell: (c) => c.missionsToday },
          { key: "cash", header: "Cash à reverser", cell: (c) => <span className={c.cashToReturn > 0 ? "type-label-m whitespace-nowrap text-fg-warning" : "text-fg-tertiary"}>{c.cashToReturn > 0 ? formatFC(c.cashToReturn) : "—"}</span> },
          { key: "rating", header: "Note", cell: (c) => <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-warning text-warning" />{c.rating.toLocaleString("fr-FR")}</span> },
        ]}
        action={(c) =>
          c.cashToReturn > 0 ? (
            <RemindButton courier={c} />
          ) : (
            <Button size="sm" variant="outline">
              Voir
            </Button>
          )
        }
      />
    </div>
  );
}
