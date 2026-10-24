"use client";

import { useState, type ReactNode } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Sheet } from "@/components/ui/sheet";
import { DESKTOP, useMediaQuery } from "@/hooks/use-media-query";

/**
 * List + detail pattern of the admin screens (KYC, litiges, commandes):
 * the detail sits in a right panel from lg and in a bottom sheet below.
 * The selection survives filtering (falls back to the first visible row), and
 * widening the window past lg moves an open sheet into the side panel.
 */
export function MasterDetail<T>({ rows, columns, rowKey, title, detailTitle, renderDetail, actionLabel = "Examiner", initialKey, empty }: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  title: (row: T) => ReactNode;
  detailTitle: (row: T) => string;
  renderDetail: (row: T) => ReactNode;
  actionLabel?: string | ((row: T) => string);
  initialKey?: string;
  empty?: ReactNode;
}) {
  const desktop = useMediaQuery(DESKTOP);
  const [selected, setSelected] = useState<string | undefined>(initialKey);
  const [sheet, setSheet] = useState(false);
  if (desktop && sheet) setSheet(false);
  const current = rows.find((r) => rowKey(r) === selected) ?? rows[0];
  const currentKey = current ? rowKey(current) : undefined;

  function open(row: T) {
    setSelected(rowKey(row));
    if (!desktop) setSheet(true);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={rowKey}
        title={title}
        empty={empty}
        selectedKey={currentKey}
        onRowClick={open}
        action={(r) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open(r);
            }}
            aria-haspopup={desktop ? undefined : "dialog"}
            className="pressable inline-flex h-9 items-center justify-center rounded-md border border-line-strong bg-surface px-4 type-label-s hover:bg-surface-muted"
          >
            {typeof actionLabel === "function" ? actionLabel(r) : actionLabel}
          </button>
        )}
      />
      <aside aria-label="Détail" className="sticky top-24 hidden rounded-lg border border-line-subtle bg-surface p-5 lg:block">
        {current ? (
          <div key={currentKey} className="animate-fade-in">
            {renderDetail(current)}
          </div>
        ) : (
          <p className="type-body-m text-fg-secondary">Aucun élément à afficher.</p>
        )}
      </aside>
      <Sheet open={sheet && Boolean(current)} onClose={() => setSheet(false)} title={current ? detailTitle(current) : ""}>
        {current && renderDetail(current)}
      </Sheet>
    </div>
  );
}
