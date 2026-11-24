import { Button } from "@/shared/ui/Button";

interface PaginacionProps {
  // Empieza en 0
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
  total?: number;
}

export function Paginacion({ pagina, totalPaginas, onCambiar, total }: PaginacionProps) {
  const ultima = Math.max(totalPaginas, 1);
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-2 text-sm text-gray-600">
      <Button variant="outline" size="sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina <= 0}>
        Anterior
      </Button>
      <span>
        Página {Math.min(pagina + 1, ultima)} de {ultima}
        {total !== undefined && <span className="text-gray-400"> · {total} en total</span>}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina + 1 >= ultima}
      >
        Siguiente
      </Button>
    </nav>
  );
}
