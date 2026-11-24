export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

// DetallePedidoRead: copia del nombre y del precio al momento de la compra
export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface UsuarioPedido {
  id: number;
  username: string;
  full_name: string;
}

// PedidoRead
export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  usuario: UsuarioPedido;
  items: DetallePedido[];
}

export interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

// PedidoCreate
export interface PedidoCreate {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}

export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}
