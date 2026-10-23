"use client";

import { useState, type ReactNode } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Sheet } from "@/components/ui/sheet";

/**
 * List + detail pattern of the admin screens (KYC, litiges, commandes):
 * the detail sits in a right panel from lg and in a bottom sheet below.
 */
export function MasterDetail<T>({ rows, columns, rowKey, title, detailTitle, renderDetail, actionLabel = "Examiner", initialKey }: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  title: (row: T) => ReactNode;
  detailTitle: (row: T) => string;
  renderDetail: (row: T) => ReactNode;
  actionLabel?: string | ((row: T) => string);
  initialKey?: string;
}) {
  const [selected, setSelected] = useState<string | undefined>(initialKey ?? (rows[0] ? rowKey(rows[0]) : undefined));
  const [sheet, setSheet] = useState(false);
  const current = rows.find((r) => rowKey(r) === selected);

  function open(row: T) {
    setSelected(rowKey(row));
    if (!window.matchMedia("(min-width: 1024px)").matches) setSheet(true);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={rowKey}
        title={title}
        selectedKey={selected}
        onRowClick={open}
        action={(r) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open(r);
            }}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line-strong bg-surface px-4 type-label-s hover:bg-surface-muted"
          >
            {typeof actionLabel === "function" ? actionLabel(r) : actionLabel}
          </button>
        )}
      />
      <aside className="sticky top-24 hidden rounded-lg border border-line-subtle bg-surface p-5 lg:block">
        {current ? renderDetail(current) : <p className="type-body-m text-fg-secondary">Sélectionne une ligne.</p>}
      </aside>
      <Sheet open={sheet && Boolean(current)} onClose={() => setSheet(false)} title={current ? detailTitle(current) : ""}>
        {current && renderDetail(current)}
      </Sheet>
    </div>
  );
}
