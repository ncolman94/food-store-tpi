import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productosKey } from "@/features/productos";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { cancelarPedido } from "../api/pedidos";
import type { Pedido } from "../types/pedido.types";
import { pedidosKey } from "./pedidosKey";

// El cliente cancela un pedido propio mientras sigue PENDIENTE
export function useCancelarPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation({
    mutationFn: (pedido: Pedido) => cancelarPedido(pedido.id),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: pedidosKey });
      queryClient.invalidateQueries({ queryKey: productosKey });
      showNotification(`Pedido #${pedido.id} cancelado. El stock volvió al catálogo.`);
    },
    onError: (e) => showNotification(handleApiError(e), "error"),
  });
}
