import { cn } from "@/lib/cn";

/** Placeholder block. Appears after 150 ms so quick loads never flash a skeleton. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-md", className)} />;
}

/** Dashboard-shaped skeleton (header, KPI row, main card) used by the route loading states. */
export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex animate-skeleton-in flex-col gap-5">
      <span className="sr-only">Chargement de la page…</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
