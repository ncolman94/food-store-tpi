import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productosKey } from "@/features/productos";
import { crearPedido } from "../api/pedidos";
import { pedidosKey } from "./pedidosKey";

export function useCrearPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pedidosKey });
      // El pedido desconto stock: el catalogo tiene que volver a pedirse
      queryClient.invalidateQueries({ queryKey: productosKey });
    },
  });
}
