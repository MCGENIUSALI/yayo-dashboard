import { cn } from "@/lib/cn";

/** Minimal accessible bar chart; the last (current) bar is highlighted in accent. */
export function BarChart({ data, format, className, highlightLast = true }: { data: { label: string; value: number }[]; format: (v: number) => string; className?: string; highlightLast?: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className="flex h-40 items-end gap-2" role="list">
        {data.map((d, i) => {
          const last = highlightLast && i === data.length - 1;
          return (
            <div key={d.label} role="listitem" className="group relative flex h-full flex-1 flex-col justify-end" aria-label={`${d.label} : ${format(d.value)}`}>
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-sm bg-inverse px-2 py-1 type-caption whitespace-nowrap text-fg-inverse opacity-0 transition group-hover:opacity-100">
                {format(d.value)}
              </span>
              <span className={cn("block w-full rounded-t-sm transition-colors", last ? "bg-accent" : "bg-surface-sunken group-hover:bg-line-strong")} style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }} />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center type-caption text-fg-tertiary">
            {d.label}
          </span>
        ))}
      </div>
    </figure>
  );
}

/** Horizontal stacked distribution with legend. */
export function Distribution({ data }: { data: { label: string; value: number; tone: "success" | "info" | "warning" | "danger" | "accent" }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const bg = { success: "bg-success", info: "bg-info", warning: "bg-warning", danger: "bg-danger", accent: "bg-accent" } as const;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-sunken">
        {data.map((d) => (
          <span key={d.label} className={cn("h-full", bg[d.tone])} style={{ width: `${(d.value / total) * 100}%` }} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 type-body-s">
            <span className={cn("size-2.5 rounded-full", bg[d.tone])} />
            <span className="text-fg-secondary">{d.label}</span>
            <span className="ml-auto type-label-s tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
