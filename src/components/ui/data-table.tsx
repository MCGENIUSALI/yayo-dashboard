import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide this column inside the mobile card (e.g. already in the title). */
  hideOnMobile?: boolean;
}

/**
 * Back-office table (DS "Admin Table"). From md it is a real table; under md
 * each row becomes a card so nothing scrolls sideways on a phone.
 */
export function DataTable<T>({ columns, rows, rowKey, title, action, empty, onRowClick, selectedKey }: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  title: (row: T) => ReactNode;
  action?: (row: T) => ReactNode;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
}) {
  if (rows.length === 0) return <>{empty}</>;
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-line-subtle bg-surface md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-surface-muted">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={cn("px-4 py-3 type-body-s font-medium whitespace-nowrap text-fg-secondary", c.className)}>
                    {c.header}
                  </th>
                ))}
                {action && <th className="px-4 py-3" aria-label="Actions" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={rowKey(r)}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  aria-selected={onRowClick ? selectedKey === rowKey(r) : undefined}
                  className={cn(
                    "border-t border-line-subtle transition-[background-color,box-shadow] duration-(--duration-instant) ease-(--ease-standard)",
                    onRowClick && "cursor-pointer hover:bg-surface-muted",
                    selectedKey === rowKey(r) && "bg-accent-subtle/60 shadow-[inset_3px_0_0_var(--bg-accent)] hover:bg-accent-subtle/60",
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3.5 type-body-m", c.className)}>
                      {c.cell(r)}
                    </td>
                  ))}
                  {action && <td className="px-4 py-2.5 text-right">{action(r)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((r) => (
          <li
            key={rowKey(r)}
            onClick={onRowClick ? () => onRowClick(r) : undefined}
            className={cn(
              "rounded-lg border border-line-subtle bg-surface p-4 transition-[border-color,background-color,transform] duration-(--duration-instant) ease-(--ease-standard)",
              onRowClick && "cursor-pointer active:scale-[0.99] active:bg-surface-muted",
              selectedKey === rowKey(r) && "border-accent",
            )}
          >
            <div className="type-label-l">{title(r)}</div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="type-caption text-fg-tertiary">{c.header}</dt>
                    <dd className="mt-0.5 type-body-m">{c.cell(r)}</dd>
                  </div>
                ))}
            </dl>
            {action && <div className="mt-3 [&>*]:w-full">{action(r)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}
