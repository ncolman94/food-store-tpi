import { useMemo } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { ETIQUETA_PAGO } from "../types/estados";
import type { EstadoPedido, Pedido } from "../types/pedido.types";
import { AccionesPedido } from "./AccionesPedido";

interface TablaPedidosProps {
  pedidos: Pedido[];
  total: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onVer: (pedido: Pedido) => void;
  onCambiar: (pedido: Pedido, estado: EstadoPedido) => void;
  // Pedido cuyo cambio de estado esta en curso
  enCurso: number | undefined;
}

const columnHelper = createColumnHelper<Pedido>();

// Paginacion en el servidor: la tabla recibe una pagina y el total
export function TablaPedidos({
  pedidos,
  total,
  pagination,
  onPaginationChange,
  onVer,
  onCambiar,
  enCurso,
}: TablaPedidosProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "N.º",
        cell: (info) => <span className="font-semibold">#{info.getValue()}</span>,
      }),
      columnHelper.accessor("usuario", {
        header: "Cliente",
        cell: (info) => (
          <div className="leading-tight">
            <p className="font-medium text-gray-900">{info.getValue().full_name}</p>
            <p className="text-xs text-gray-500">{info.getValue().username}</p>
          </div>
        ),
      }),
      columnHelper.accessor("created_at", { header: "Fecha", cell: (info) => formatearFecha(info.getValue()) }),
      columnHelper.accessor((pedido) => pedido.items.reduce((suma, item) => suma + item.cantidad, 0), {
        id: "unidades",
        header: "Unidades",
      }),
      columnHelper.accessor("total", { header: "Total", cell: (info) => formatearPrecio(info.getValue()) }),
      columnHelper.accessor("forma_pago", { header: "Pago", cell: (info) => ETIQUETA_PAGO[info.getValue()] }),
      columnHelper.accessor("estado", { header: "Estado", cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onVer(row.original)}>
              Ver
            </Button>
            <AccionesPedido pedido={row.original} onCambiar={onCambiar} deshabilitado={enCurso === row.original.id} />
          </div>
        ),
      }),
    ],
    [onVer, onCambiar, enCurso]
  );

  const table = useReactTable({
    data: pedidos,
    columns,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    rowCount: total,
    enableSorting: false,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} mensajeSinFilas="No hay pedidos con este filtro." />;
}
