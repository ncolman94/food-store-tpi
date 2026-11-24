import type { EstadoPedido, FormaPago } from "./pedido.types";

export const ESTADOS: EstadoPedido[] = ["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"];

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ETIQUETA_PAGO: Record<FormaPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
};

// El mismo mapa que TRANSICIONES en el service del backend; ahi se valida de verdad
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};
