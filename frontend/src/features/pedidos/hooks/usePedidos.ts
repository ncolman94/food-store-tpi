import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPedidos } from "../api/pedidos";
import type { FiltrosPedidos } from "../types/pedido.types";
import { pedidosKey } from "./pedidosKey";

// Un user recibe solo sus pedidos; el admin, los de todos
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: [...pedidosKey, filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}
