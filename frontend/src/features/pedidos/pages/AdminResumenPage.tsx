import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { Skeleton } from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/utils/formato";
import { Button } from "@/shared/ui/Button";
import { TarjetaResumen } from "../components/TarjetaResumen";
import { useResumenPedidos } from "../hooks/useResumenPedidos";

export function AdminResumenPage() {
  const { data, isPending, isFetching, error, refetch } = useResumenPedidos();

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resumen</h1>
          <p className="text-sm text-gray-500">Indicadores de los pedidos del negocio.</p>
        </div>
        <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {isPending ? (
        <div role="status" aria-label="Cargando resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-28" />
          ))}
        </div>
      ) : error ? (
        <EstadoError titulo="No se pudo cargar el resumen" mensaje={handleApiError(error)} onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen
            titulo="Pendientes"
            valor={String(data.pendientes)}
            color="border-l-amber-400"
            to="/admin/pedidos?estado=PENDIENTE"
          />
          <TarjetaResumen
            titulo="En preparación"
            valor={String(data.en_preparacion)}
            color="border-l-sky-400"
            to="/admin/pedidos?estado=EN_PREPARACION"
          />
          <TarjetaResumen
            titulo="Entregados"
            valor={String(data.entregados)}
            color="border-l-green-500"
            to="/admin/pedidos?estado=ENTREGADO"
          />
          <TarjetaResumen
            titulo="Cancelados"
            valor={String(data.cancelados)}
            color="border-l-gray-400"
            to="/admin/pedidos?estado=CANCELADO"
          />
          <TarjetaResumen titulo="Pedidos de hoy" valor={String(data.pedidos_hoy)} color="border-l-brand" to="/admin/pedidos" />
          <TarjetaResumen
            titulo="Ingresos (pedidos entregados)"
            valor={formatearPrecio(data.ingresos_entregados)}
            color="border-l-emerald-600"
          />
        </div>
      )}
    </section>
  );
}
