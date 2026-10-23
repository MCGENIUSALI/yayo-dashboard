"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Chips } from "@/components/ui/segmented";
import { formatFC } from "@/lib/format";
import type { Courier } from "@/lib/types";

const status: Record<Courier["status"], { label: string; tone: "success" | "info" | "neutral" }> = {
  available: { label: "Disponible", tone: "success" },
  on_mission: { label: "En mission", tone: "info" },
  offline: { label: "Hors ligne", tone: "neutral" },
};

export function CouriersTable({ couriers }: { couriers: Courier[] }) {
  const [filter, setFilter] = useState<"all" | "cash" | Courier["status"]>("all");
  const [reminded, setReminded] = useState<string[]>([]);
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
            <Button size="sm" variant={reminded.includes(c.id) ? "secondary" : "primary"} disabled={reminded.includes(c.id)} onClick={() => setReminded((r) => [...r, c.id])}>
              {reminded.includes(c.id) ? "Relancé ✓" : "Relancer"}
            </Button>
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
