import { Button } from "@/shared/ui/Button";
import { TRANSICIONES } from "../types/estados";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

interface AccionesPedidoProps {
  pedido: Pedido;
  onCambiar: (pedido: Pedido, estado: EstadoPedido) => void;
  deshabilitado: boolean;
}

const TEXTO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Preparar",
  ENTREGADO: "Entregar",
  CANCELADO: "Cancelar",
};

// Solo los botones de las transiciones validas desde el estado actual
export function AccionesPedido({ pedido, onCambiar, deshabilitado }: AccionesPedidoProps) {
  const siguientes = TRANSICIONES[pedido.estado];
  if (siguientes.length === 0) return <span className="text-xs text-gray-400">Sin acciones</span>;

  return (
    <div className="flex gap-2">
      {siguientes.map((estado) => (
        <Button
          key={estado}
          size="sm"
          variant={estado === "CANCELADO" ? "danger" : "primary"}
          disabled={deshabilitado}
          onClick={() => onCambiar(pedido, estado)}
        >
          {TEXTO[estado]}
        </Button>
      ))}
    </div>
  );
}
