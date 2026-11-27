import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { PaginationState } from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { Skeleton, SkeletonTabla } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { AccionesPedido } from "../components/AccionesPedido";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { TablaPedidos } from "../components/TablaPedidos";
import { useCambiarEstadoPedido } from "../hooks/useCambiarEstadoPedido";
import { usePedido } from "../hooks/usePedido";
import { usePedidos } from "../hooks/usePedidos";
import { ESTADOS, ETIQUETA_ESTADO } from "../types/estados";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

const esEstado = (valor: string | null): valor is EstadoPedido =>
  ESTADOS.includes(valor as EstadoPedido);

export function AdminPedidosPage() {
  // El filtro va en la URL: el resumen enlaza a /admin/pedidos?estado=PENDIENTE
  const [searchParams, setSearchParams] = useSearchParams();
  const valor = searchParams.get("estado");
  const estado = esEstado(valor) ? valor : undefined;

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const { data, isPending, isFetching, error, refetch } = usePedidos({
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    estado,
  });
  const cambiarEstado = useCambiarEstadoPedido();
  const { mutate: cambiar } = cambiarEstado;
  const enCurso = cambiarEstado.isPending ? cambiarEstado.variables?.id : undefined;

  const detalle = usePedido(
    detalleId,
    data?.items.find((pedido) => pedido.id === detalleId)
  );

  const handleCambiar = useCallback(
    (pedido: Pedido, nuevo: EstadoPedido) => {
      if (
        nuevo === "CANCELADO" &&
        !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devuelve el stock de sus productos.`)
      ) {
        return;
      }
      cambiar({ id: pedido.id, estado: nuevo });
    },
    [cambiar]
  );

  const verDetalle = useCallback((pedido: Pedido) => setDetalleId(pedido.id), []);

  const filtrar = (nuevo: string) => {
    setSearchParams(nuevo ? { estado: nuevo } : {});
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-gray-500">
            Pendiente → En preparación → Entregado. Se puede cancelar antes de entregar.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Estado
            <select value={estado ?? ""} onChange={(e) => filtrar(e.target.value)} className="input min-w-44">
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </option>
              ))}
            </select>
          </label>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar los pedidos" mensaje={handleApiError(error)} onRetry={() => refetch()} />
      ) : (
        <TablaPedidos
          pedidos={data.items}
          total={data.total}
          pagination={pagination}
          onPaginationChange={setPagination}
          onVer={verDetalle}
          onCambiar={handleCambiar}
          enCurso={enCurso}
        />
      )}

      <Modal isOpen={detalleId !== null} titulo={`Pedido #${detalleId}`} onClose={() => setDetalleId(null)} ancho="lg">
        {detalle.isPending ? (
          <Skeleton className="h-64" />
        ) : detalle.error ? (
          <EstadoError titulo="No se pudo cargar el pedido" mensaje={handleApiError(detalle.error)} />
        ) : (
          <>
            <PedidoDetalle pedido={detalle.data} mostrarCliente />
            <div className="flex justify-end">
              <AccionesPedido
                pedido={detalle.data}
                onCambiar={handleCambiar}
                deshabilitado={enCurso === detalle.data.id}
              />
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
