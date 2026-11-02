import { Skeleton } from "@/components/ui/skeleton";

/** E2 · Chargement: skeleton of the home screen. */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex animate-skeleton-in flex-col gap-5 bg-surface px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-6">
      <span className="sr-only">Chargement…</span>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="size-11" />
          <Skeleton className="size-11" />
        </div>
      </div>
      <Skeleton className="h-12 rounded-full" />
      <div className="flex gap-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="size-14 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-36 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}
