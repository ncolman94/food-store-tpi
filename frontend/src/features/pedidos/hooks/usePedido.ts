import { skipToken, useQuery } from "@tanstack/react-query";
import { getPedido } from "../api/pedidos";
import type { Pedido } from "../types/pedido.types";
import { pedidosKey } from "./pedidosKey";

// GET /pedidos/{id}. Mientras llega se muestra la fila del listado, si la hay
export function usePedido(id: number | null, delListado?: Pedido) {
  return useQuery({
    queryKey: [...pedidosKey, "detalle", id],
    queryFn: id === null ? skipToken : () => getPedido(id),
    placeholderData: delListado,
  });
}
