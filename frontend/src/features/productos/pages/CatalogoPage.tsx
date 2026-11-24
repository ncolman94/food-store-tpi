import { useState } from "react";
import { useCategorias } from "@/features/categorias";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { Skeleton } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { FiltrosCatalogo } from "../components/FiltrosCatalogo";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";
import type { FiltrosProductos } from "../types/producto.types";

const POR_PAGINA = 8;

function SkeletonCatalogo() {
  return (
    <div role="status" aria-label="Cargando productos" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: POR_PAGINA }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Skeleton className="aspect-[3/2] rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  // texto es lo que se escribe; busqueda, lo que se aplico con «Buscar»
  const [texto, setTexto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  // Paginacion en el servidor: skip = pagina × limit
  const filtros: FiltrosProductos = {
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
    disponible: soloDisponibles ? true : undefined,
  };
  const { data, isPending, isFetching, error, refetch } = useProductos(filtros);
  const { data: categorias = [] } = useCategorias();

  const hayFiltros = Boolean(busqueda || categoriaId || soloDisponibles);
  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0;

  // Cualquier cambio de filtro vuelve a la primera pagina
  const limpiar = () => {
    setTexto("");
    setBusqueda("");
    setCategoriaId(undefined);
    setSoloDisponibles(false);
    setPagina(0);
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuestro menú</h1>
        <p className="text-gray-500">Elegí tus productos, armá el carrito y confirmá el pedido.</p>
      </div>

      <FiltrosCatalogo
        texto={texto}
        onTexto={setTexto}
        onBuscar={() => {
          setBusqueda(texto.trim());
          setPagina(0);
        }}
        categorias={categorias}
        categoriaId={categoriaId}
        onCategoria={(id) => {
          setCategoriaId(id);
          setPagina(0);
        }}
        soloDisponibles={soloDisponibles}
        onSoloDisponibles={(valor) => {
          setSoloDisponibles(valor);
          setPagina(0);
        }}
        hayFiltros={hayFiltros}
        onLimpiar={limpiar}
      />

      {isPending ? (
        <SkeletonCatalogo />
      ) : error ? (
        <EstadoError titulo="No se pudo cargar el catálogo" mensaje={handleApiError(error)} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje={hayFiltros ? "Probá con otra búsqueda o con otra categoría." : "Todavía no hay productos en el catálogo."}
          accion={hayFiltros ? <Button onClick={limpiar}>Limpiar filtros</Button> : undefined}
        />
      ) : (
        <div className={`flex flex-col gap-6 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} total={data.total} />
        </div>
      )}
    </section>
  );
}
