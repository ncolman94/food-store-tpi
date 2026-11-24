import type { Categoria } from "@/features/categorias";
import { Button } from "@/shared/ui/Button";

interface FiltrosCatalogoProps {
  texto: string;
  onTexto: (texto: string) => void;
  onBuscar: () => void;
  categorias: Categoria[];
  categoriaId: number | undefined;
  onCategoria: (id: number | undefined) => void;
  soloDisponibles: boolean;
  onSoloDisponibles: (valor: boolean) => void;
  hayFiltros: boolean;
  onLimpiar: () => void;
}

export function FiltrosCatalogo({
  texto,
  onTexto,
  onBuscar,
  categorias,
  categoriaId,
  onCategoria,
  soloDisponibles,
  onSoloDisponibles,
  hayFiltros,
  onLimpiar,
}: FiltrosCatalogoProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* La busqueda se aplica al enviar, asi no se pide una pagina por cada tecla */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onBuscar();
        }}
        className="flex min-w-60 flex-1 gap-2"
      >
        <input
          type="search"
          aria-label="Buscar por nombre"
          placeholder="Buscar por nombre..."
          value={texto}
          onChange={(e) => onTexto(e.target.value)}
          className="input"
        />
        <Button type="submit">Buscar</Button>
      </form>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Categoría
        <select
          value={categoriaId ?? ""}
          onChange={(e) => onCategoria(e.target.value ? Number(e.target.value) : undefined)}
          className="input min-w-44"
        >
          <option value="">Todas</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={soloDisponibles}
          onChange={(e) => onSoloDisponibles(e.target.checked)}
          className="size-4 accent-brand"
        />
        Solo disponibles
      </label>

      {hayFiltros && (
        <Button variant="ghost" onClick={onLimpiar}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
