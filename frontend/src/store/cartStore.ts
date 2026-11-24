import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Producto } from "@/features/productos";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string | null;
  // Stock al momento de agregarlo: limita la cantidad; el backend lo vuelve a validar
  stock: number;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: Producto) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

const limitar = (cantidad: number, stock: number) => Math.max(1, Math.min(cantidad, stock));

// persist usa localStorage: el carrito sigue ahi al recargar o al cerrar el navegador
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Si ya esta en el carrito suma uno, sin pasarse del stock
      agregar: (producto) =>
        set((state) => {
          const existente = state.items.find((item) => item.producto_id === producto.id);
          if (existente) {
            return {
              items: state.items.map((item) =>
                item.producto_id === producto.id
                  ? { ...item, cantidad: limitar(item.cantidad + 1, producto.stock), stock: producto.stock }
                  : item
              ),
            };
          }
          const nuevo: ItemCarrito = {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            cantidad: 1,
            imagen_url: producto.imagen_url,
            stock: producto.stock,
          };
          return { items: [...state.items, nuevo] };
        }),

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((item) => item.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.producto_id === productoId ? { ...item, cantidad: limitar(cantidad, item.stock) } : item
          ),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((suma, item) => suma + item.precio_unitario * item.cantidad, 0),
    }),
    { name: "cart-storage" }
  )
);
