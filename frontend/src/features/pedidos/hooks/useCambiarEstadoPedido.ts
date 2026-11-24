import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productosKey } from "@/features/productos";
import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "@/shared/api/handleApiError";
import { cambiarEstado } from "../api/pedidos";
import type { EstadoPedido } from "../types/pedido.types";
import { pedidosKey } from "./pedidosKey";
import { ETIQUETA_ESTADO } from "../types/estados";

// Avanza o cancela un pedido (solo admin), segun la maquina de estados del backend
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: pedidosKey });
      // Cancelar devuelve el stock de cada linea
      if (pedido.estado === "CANCELADO") queryClient.invalidateQueries({ queryKey: productosKey });
      showNotification(`Pedido #${pedido.id}: ${ETIQUETA_ESTADO[pedido.estado]}`);
    },
    onError: (e) => showNotification(handleApiError(e), "error"),
  });
}
