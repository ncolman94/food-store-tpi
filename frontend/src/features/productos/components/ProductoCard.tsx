import { formatearPrecio } from "@/shared/utils/formato";
import { Button } from "@/shared/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { Producto } from "../types/producto.types";
import { ImagenProducto } from "./ImagenProducto";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((state) => state.agregar);
  const enCarrito = useCartStore(
    (state) => state.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0
  );
  const showNotification = useNotificationStore((state) => state.showNotification);

  // Se vende solo si esta disponible y le queda stock
  const sinStock = producto.stock === 0;
  const vendible = producto.disponible && !sinStock;
  const llegoAlTope = enCarrito >= producto.stock;

  const handleAgregar = () => {
    agregar(producto);
    showNotification(`«${producto.nombre}» agregado al carrito`);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <ImagenProducto url={producto.imagen_url} nombre={producto.nombre} className="aspect-[3/2] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">{producto.categoria.nombre}</p>
        <h2 className="font-semibold text-gray-900">{producto.nombre}</h2>
        {producto.descripcion && <p className="line-clamp-2 text-sm text-gray-500">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</p>
          <p className={`text-xs ${vendible ? "text-gray-500" : "font-semibold text-error"}`}>
            {!producto.disponible ? "No disponible" : sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
          </p>
        </div>

        <Button onClick={handleAgregar} disabled={!vendible || llegoAlTope}>
          {llegoAlTope && vendible ? "Máximo en el carrito" : "Agregar al carrito"}
        </Button>
        {enCarrito > 0 && <p className="text-center text-xs text-gray-500">En el carrito: {enCarrito}</p>}
      </div>
    </article>
  );
}
