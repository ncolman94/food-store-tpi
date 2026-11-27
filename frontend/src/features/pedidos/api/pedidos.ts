import { api } from "@/shared/api/axiosInstance";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido.types";

export async function crearPedido(pedido: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>("/pedidos", pedido);
  return data;
}

// Un user recibe solo los suyos; el admin, los de todos
export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>("/pedidos", { params: filtros });
  return data;
}

// Detalle con sus lineas: 403 si es de otro usuario y no es admin
export async function getPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`);
  return data;
}

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}

export async function cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}
