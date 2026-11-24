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
import { useCategorias } from "@/features/categorias";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/utils/formato";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useNotificationStore } from "@/store/notificationStore";
import { ImagenProducto } from "../components/ImagenProducto";
import { ProductoForm } from "../components/ProductoForm";
import { StockForm } from "../components/StockForm";
import { useProductoMutations, useProductos } from "../hooks/useProductos";
import type { Producto, ProductoCreate, ProductoStockUpdate } from "../types/producto.types";

const columnHelper = createColumnHelper<Producto>();
const sinProductos: Producto[] = [];
// El panel pide hasta 100 y pagina del lado del cliente
const FILTROS_PANEL = { skip: 0, limit: 100 };

type Dialogo = { tipo: "producto"; producto: Producto | null } | { tipo: "stock"; producto: Producto } | null;

export function AdminProductosPage() {
  const { data, isPending, error, refetch } = useProductos(FILTROS_PANEL);
  const { data: categorias = [] } = useCategorias();
  const { crear, editar, cambiarStock, eliminar } = useProductoMutations();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "nombre", desc: false }]);
  const [busqueda, setBusqueda] = useState("");

  const { reset: resetCrear } = crear;
  const { reset: resetEditar } = editar;
  const { reset: resetStock } = cambiarStock;
  const { mutate: bajaProducto } = eliminar;

  const cerrar = useCallback(() => setDialogo(null), []);

  const abrir = useCallback(
    (nuevo: Dialogo) => {
      resetCrear();
      resetEditar();
      resetStock();
      setDialogo(nuevo);
    },
    [resetCrear, resetEditar, resetStock]
  );

  const darDeBaja = useCallback(
    (producto: Producto) => {
      if (!window.confirm(`¿Dar de baja «${producto.nombre}»? Deja de aparecer en el catálogo.`)) return;
      bajaProducto(producto, { onError: (e) => showNotification(handleApiError(e), "error") });
    },
    [bajaProducto, showNotification]
  );

  const guardarProducto = (valores: ProductoCreate) => {
    if (dialogo?.tipo !== "producto") return;
    if (dialogo.producto) {
      // PUT parcial: el stock y la disponibilidad no se tocan desde aca
      const { stock: _stock, disponible: _disponible, ...cambios } = valores;
      editar.mutate({ id: dialogo.producto.id, cambios }, { onSuccess: cerrar });
    } else {
      crear.mutate(valores, { onSuccess: cerrar });
    }
  };

  const guardarStock = (cambios: ProductoStockUpdate) => {
    if (dialogo?.tipo !== "stock") return;
    cambiarStock.mutate({ id: dialogo.producto.id, cambios }, { onSuccess: cerrar });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: "Producto",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ImagenProducto
              url={row.original.imagen_url}
              nombre={row.original.nombre}
              className="size-10 shrink-0 rounded-lg text-base"
            />
            <span className="font-medium text-gray-900">{row.original.nombre}</span>
          </div>
        ),
      }),
      columnHelper.accessor((producto) => producto.categoria.nombre, { id: "categoria", header: "Categoría" }),
      columnHelper.accessor("precio_base", {
        header: "Precio",
        enableGlobalFilter: false,
        cell: (info) => formatearPrecio(info.getValue()),
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        enableGlobalFilter: false,
        cell: (info) => (
          <span className={info.getValue() === 0 ? "font-semibold text-error" : ""}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("disponible", {
        header: "Venta",
        enableGlobalFilter: false,
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Disponible</span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">Pausado</span>
          ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => abrir({ tipo: "producto", producto: row.original })}>
              Editar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => abrir({ tipo: "stock", producto: row.original })}>
              Stock
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
    data: data?.items ?? sinProductos,
    columns,
    state: { sorting, globalFilter: busqueda },
    onSortingChange: setSorting,
    onGlobalFilterChange: setBusqueda,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Sin esto, cada cambio de stock volveria a la primera pagina
    autoResetPageIndex: false,
  });

  const mutacionProducto = dialogo?.tipo === "producto" && dialogo.producto ? editar : crear;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-gray-500">Alta, edición, stock y baja lógica de los productos activos.</p>
        </div>
        <Button onClick={() => abrir({ tipo: "producto", producto: null })} disabled={categorias.length === 0}>
          Nuevo producto
        </Button>
      </div>

      {data && data.total > data.items.length && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Se muestran los primeros {data.items.length} de {data.total} productos.
        </p>
      )}

      {isPending ? (
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar los productos" mensaje={handleApiError(error)} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay productos"
          mensaje={categorias.length === 0 ? "Primero creá una categoría." : "Creá el primero con «Nuevo producto»."}
        />
      ) : (
        <DataTable table={table} conBusqueda />
      )}

      <Modal
        isOpen={dialogo?.tipo === "producto"}
        titulo={dialogo?.tipo === "producto" && dialogo.producto ? "Editar producto" : "Nuevo producto"}
        onClose={cerrar}
      >
        {dialogo?.tipo === "producto" && (
          <ProductoForm
            key={dialogo.producto?.id ?? "nuevo"}
            producto={dialogo.producto}
            categorias={categorias}
            onSubmit={guardarProducto}
            onCancelar={cerrar}
            guardando={mutacionProducto.isPending}
            error={mutacionProducto.error ? handleApiError(mutacionProducto.error) : null}
          />
        )}
      </Modal>

      <Modal
        isOpen={dialogo?.tipo === "stock"}
        titulo={dialogo?.tipo === "stock" ? `Stock de «${dialogo.producto.nombre}»` : "Stock"}
        onClose={cerrar}
      >
        {dialogo?.tipo === "stock" && (
          <StockForm
            key={dialogo.producto.id}
            producto={dialogo.producto}
            onSubmit={guardarStock}
            onCancelar={cerrar}
            guardando={cambiarStock.isPending}
            error={cambiarStock.error ? handleApiError(cambiarStock.error) : null}
          />
        )}
      </Modal>
    </section>
  );
}
