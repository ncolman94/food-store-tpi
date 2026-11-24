import { useCallback, useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useNotificationStore } from "@/store/notificationStore";
import { CategoriaForm } from "../components/CategoriaForm";
import { useCategoriaMutations, useCategorias } from "../hooks/useCategorias";
import type { Categoria, CategoriaCreate } from "../types/categoria.types";

const columnHelper = createColumnHelper<Categoria>();
const sinCategorias: Categoria[] = [];

export function AdminCategoriasPage() {
  const { data: categorias, isPending, error, refetch } = useCategorias();
  const { crear, editar, eliminar } = useCategoriaMutations();
  const showNotification = useNotificationStore((state) => state.showNotification);

  // undefined: modal cerrado; null: categoria nueva
  const [seleccionada, setSeleccionada] = useState<Categoria | null | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([{ id: "nombre", desc: false }]);
  const [busqueda, setBusqueda] = useState("");

  const mutacion = seleccionada ? editar : crear;
  const cerrar = useCallback(() => setSeleccionada(undefined), []);

  // reset y mutate son estables; el objeto de la mutacion no
  const { reset: resetCrear } = crear;
  const { reset: resetEditar } = editar;
  const { mutate: bajaCategoria } = eliminar;

  const abrir = useCallback(
    (categoria: Categoria | null) => {
      resetCrear();
      resetEditar();
      setSeleccionada(categoria);
    },
    [resetCrear, resetEditar]
  );

  const guardar = (valores: CategoriaCreate) => {
    if (seleccionada) editar.mutate({ id: seleccionada.id, cambios: valores }, { onSuccess: cerrar });
    else crear.mutate(valores, { onSuccess: cerrar });
  };

  const darDeBaja = useCallback(
    (categoria: Categoria) => {
      const ok = window.confirm(
        `¿Dar de baja la categoría «${categoria.nombre}»?\n\nSus productos siguen en el catálogo hasta que los des de baja.`
      );
      if (ok) {
        bajaCategoria(categoria, {
          onError: (e) => showNotification(handleApiError(e), "error"),
        });
      }
    },
    [bajaCategoria, showNotification]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", { header: "N.º" }),
      columnHelper.accessor("nombre", {
        header: "Nombre",
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("descripcion", {
        header: "Descripción",
        enableSorting: false,
        cell: (info) => info.getValue() || <span className="text-gray-400 italic">Sin descripción</span>,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => abrir(row.original)}>
              Editar
            </Button>
            <Button variant="danger" size="sm" onClick={() => darDeBaja(row.original)}>
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [abrir, darDeBaja]
  );

  const table = useReactTable({
    data: categorias ?? sinCategorias,
    columns,
    state: { sorting, globalFilter: busqueda },
    onSortingChange: setSorting,
    onGlobalFilterChange: setBusqueda,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-sm text-gray-500">Solo se listan las activas. La baja es lógica.</p>
        </div>
        <Button onClick={() => abrir(null)}>Nueva categoría</Button>
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar las categorías" mensaje={handleApiError(error)} onRetry={() => refetch()} />
      ) : categorias.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay categorías"
          mensaje="Creá la primera para empezar a cargar productos."
          accion={<Button onClick={() => abrir(null)}>Nueva categoría</Button>}
        />
      ) : (
        <DataTable table={table} conBusqueda />
      )}

      <Modal
        isOpen={seleccionada !== undefined}
        titulo={seleccionada ? "Editar categoría" : "Nueva categoría"}
        onClose={cerrar}
      >
        {/* key: el formulario arranca de cero con cada categoria */}
        <CategoriaForm
          key={seleccionada?.id ?? "nueva"}
          categoria={seleccionada ?? null}
          onSubmit={guardar}
          onCancelar={cerrar}
          guardando={mutacion.isPending}
          error={mutacion.error ? handleApiError(mutacion.error) : null}
        />
      </Modal>
    </section>
  );
}
