import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto, getProductos } from "../api/productos";
import type { FiltrosProductos, Producto, ProductoStockUpdate, ProductoUpdate } from "../types/producto.types";

export const productosKey = ["productos"] as const;

// Cada combinacion de filtros es una entrada de la cache: ['productos', filtros]
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [...productosKey, filtros],
    queryFn: () => getProductos(filtros),
    // Al cambiar de pagina se sigue mostrando la anterior hasta que llega la nueva
    placeholderData: keepPreviousData,
  });
}

export function useProductoMutations() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const invalidar = () => queryClient.invalidateQueries({ queryKey: productosKey });

  const crear = useMutation({
    mutationFn: crearProducto,
    onSuccess: (producto) => {
      invalidar();
      showNotification(`Producto «${producto.nombre}» creado`);
    },
  });

  const editar = useMutation({
    mutationFn: ({ id, cambios }: { id: number; cambios: ProductoUpdate }) => actualizarProducto(id, cambios),
    onSuccess: (producto) => {
      invalidar();
      showNotification(`Producto «${producto.nombre}» actualizado`);
    },
  });

  const cambiarStock = useMutation({
    mutationFn: ({ id, cambios }: { id: number; cambios: ProductoStockUpdate }) => actualizarStock(id, cambios),
    onSuccess: (producto) => {
      invalidar();
      showNotification(`Stock de «${producto.nombre}»: ${producto.stock} unidades`);
    },
  });

  const eliminar = useMutation({
    mutationFn: (producto: Producto) => eliminarProducto(producto.id),
    onSuccess: (_, producto) => {
      invalidar();
      showNotification(`Producto «${producto.nombre}» dado de baja`);
    },
  });

  return { crear, editar, cambiarStock, eliminar };
}
