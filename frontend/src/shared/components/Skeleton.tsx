// Bloque gris animado con la forma de lo que se esta cargando
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

export function SkeletonTabla({ filas = 5 }: { filas?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3">
      <Skeleton className="h-9 w-64" />
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}
