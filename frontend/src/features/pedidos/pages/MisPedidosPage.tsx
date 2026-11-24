import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { Skeleton } from "@/shared/components/Skeleton";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { useCancelarPedido } from "../hooks/useCancelarPedido";
import { usePedidos } from "../hooks/usePedidos";
import { ESTADOS, ETIQUETA_ESTADO } from "../types/estados";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

const POR_PAGINA = 5;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const pedidoNuevo = (useLocation().state as { pedidoNuevo?: number } | null)?.pedidoNuevo;

  const { data, isPending, isFetching, error, refetch } = usePedidos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    estado,
  });
  const cancelar = useCancelarPedido();

  // El detalle sale de la pagina en cache, asi se actualiza solo despues de cancelar
  const detalle = data?.items.find((pedido) => pedido.id === detalleId) ?? null;

  const handleCancelar = (pedido: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}? Los productos vuelven al stock.`)) {
      cancelar.mutate(pedido);
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis pedidos</h1>
          <p className="text-sm text-gray-500">Podés cancelar un pedido mientras está pendiente.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Estado
          <select
            value={estado ?? ""}
            onChange={(e) => {
              setEstado((e.target.value || undefined) as EstadoPedido | undefined);
              setPagina(0);
            }}
            className="input min-w-44"
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {pedidoNuevo && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          ¡Listo! Tu pedido <strong>#{pedidoNuevo}</strong> quedó pendiente. Te avisamos cuando lo empecemos a preparar.
        </p>
      )}

      {isPending ? (
        <div role="status" aria-label="Cargando pedidos" className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28" />
          ))}
        </div>
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar tus pedidos" mensaje={handleApiError(error)} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo={estado ? "No hay pedidos con este estado" : "Todavía no hiciste pedidos"}
          mensaje={estado ? "Probá con otro filtro." : "Cuando confirmes uno, lo vas a ver acá."}
          accion={
            <Link to="/" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className={`flex flex-col gap-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <ul className="flex flex-col gap-4">
            {data.items.map((pedido) => (
              <li
                key={pedido.id}
                className={`flex flex-wrap items-center gap-4 rounded-xl border bg-white p-5 shadow-sm ${
                  pedido.id === pedidoNuevo ? "border-brand" : "border-gray-200"
                }`}
              >
                <div className="min-w-48 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Pedido #{pedido.id}</h2>
                    <BadgeEstado estado={pedido.estado} />
                  </div>
                  <p className="text-sm text-gray-500">{formatearFecha(pedido.created_at)}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                    {pedido.items.map((item) => `${item.cantidad} × ${item.nombre_producto}`).join(", ")}
                  </p>
                </div>
                <p className="text-xl font-bold">{formatearPrecio(pedido.total)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDetalleId(pedido.id)}>
                    Ver detalle
                  </Button>
                  {/* RN-04: el cliente cancela solo desde PENDIENTE */}
                  {pedido.estado === "PENDIENTE" && (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={cancelar.isPending && cancelar.variables?.id === pedido.id}
                      onClick={() => handleCancelar(pedido)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.ceil(data.total / POR_PAGINA)}
            onCambiar={setPagina}
            total={data.total}
          />
        </div>
      )}

      <Modal
        isOpen={detalle !== null}
        titulo={detalle ? `Pedido #${detalle.id}` : "Pedido"}
        onClose={() => setDetalleId(null)}
        ancho="lg"
      >
        {detalle && (
          <>
            <PedidoDetalle pedido={detalle} />
            {detalle.estado === "PENDIENTE" && (
              <div className="flex justify-end">
                <Button variant="danger" disabled={cancelar.isPending} onClick={() => handleCancelar(detalle)}>
                  Cancelar pedido
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </section>
  );
}
