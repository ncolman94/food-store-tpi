import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { ETIQUETA_PAGO } from "../types/estados";
import type { Pedido } from "../types/pedido.types";

interface PedidoDetalleProps {
  pedido: Pedido;
  // El panel muestra quien hizo el pedido
  mostrarCliente?: boolean;
}

export function PedidoDetalle({ pedido, mostrarCliente = false }: PedidoDetalleProps) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <dt className="text-gray-500">Estado</dt>
        <dd>
          <BadgeEstado estado={pedido.estado} />
        </dd>
        {mostrarCliente && (
          <>
            <dt className="text-gray-500">Cliente</dt>
            <dd>
              {pedido.usuario.full_name} <span className="text-gray-400">({pedido.usuario.username})</span>
            </dd>
          </>
        )}
        <dt className="text-gray-500">Creado</dt>
        <dd>{formatearFecha(pedido.created_at)}</dd>
        <dt className="text-gray-500">Última actualización</dt>
        <dd>{formatearFecha(pedido.updated_at)}</dd>
        <dt className="text-gray-500">Entrega</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="text-gray-500">Pago</dt>
        <dd>{ETIQUETA_PAGO[pedido.forma_pago]}</dd>
        {pedido.notas && (
          <>
            <dt className="text-gray-500">Notas</dt>
            <dd className="whitespace-pre-line">{pedido.notas}</dd>
          </>
        )}
      </dl>

      {/* Las lineas guardan el nombre y el precio del momento de la compra */}
      <table className="w-full text-left">
        <thead className="border-b border-gray-200 text-xs text-gray-500 uppercase">
          <tr>
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 text-base font-bold">
            <td colSpan={3} className="py-2">
              Total
            </td>
            <td className="py-2 text-right">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
