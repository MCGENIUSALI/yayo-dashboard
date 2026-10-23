export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-busy="true" aria-label="Chargement">
      <div className="h-9 w-48 rounded-md bg-surface-sunken" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-32 rounded-lg bg-surface-sunken" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-surface-sunken" />
    </div>
  );
}
