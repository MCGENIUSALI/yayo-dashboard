import { Banknote, MapPin, Navigation, Package, Store } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatFC } from "@/lib/format";
import type { Mission } from "@/lib/data/courier";

export function Stop({ kind, title, address }: { kind: "pickup" | "dropoff"; title: string; address: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", kind === "pickup" ? "bg-brand text-fg-inverse" : "bg-accent text-fg-on-accent")}>
        {kind === "pickup" ? <Store className="size-4" /> : <MapPin className="size-4" />}
      </span>
      <div className="min-w-0">
        <p className="type-label-m">{title}</p>
        <p className="type-body-s text-fg-tertiary">{address}</p>
      </div>
    </div>
  );
}

export function CashChip({ amount }: { amount: number }) {
  if (!amount) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-subtle px-2.5 py-1 type-label-s text-fg-warning">
      <Banknote className="size-3.5" /> Cash à encaisser : {formatFC(amount)}
    </span>
  );
}

/** Mission summary (DS "Mission Card"): fee, pickup, drop-off, distance, cash to collect. */
export function MissionCard({ mission, overline, highlight, footer, chips }: { mission: Mission; overline: string; highlight?: boolean; footer?: ReactNode; chips?: ReactNode }) {
  return (
    <article className={cn("flex flex-col gap-3 rounded-xl bg-surface p-4", highlight ? "border-2 border-accent shadow-e2" : "shadow-e1")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="type-overline text-fg-accent">{overline}</p>
          <p className="type-label-l">
            #{mission.id} · {mission.parcels} colis
          </p>
        </div>
        <div className="text-right">
          <p className="type-price-m text-fg-success">{formatFC(mission.fee)}</p>
          <p className="type-caption text-fg-tertiary">ta rémunération</p>
        </div>
      </div>
      <Stop kind="pickup" title={`Collecte · ${mission.pickup.shop}`} address={mission.pickup.address} />
      <Stop kind="dropoff" title={`Livraison · ${mission.dropoff.name}`} address={mission.dropoff.address} />
      <div className="flex flex-wrap gap-2">
        {chips ?? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-2.5 py-1 type-label-s text-fg-secondary">
            <Navigation className="size-3.5" /> {mission.distance}
          </span>
        )}
        <CashChip amount={mission.cash} />
      </div>
      {footer}
    </article>
  );
}

export function NextMissionRow({ mission }: { mission: Mission }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken">
        <Package className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="type-label-l">
          #{mission.id} · {mission.pickup.address.split(", ").pop()} → {mission.dropoff.address.split(", ").pop()}
        </p>
        <p className="type-body-s text-fg-tertiary">{mission.plannedAt ?? mission.distance}</p>
      </div>
      <span className="type-label-m">{formatFC(mission.fee)}</span>
    </div>
  );
}
