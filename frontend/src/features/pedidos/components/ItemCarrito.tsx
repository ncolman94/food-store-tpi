import { ImagenProducto } from "@/features/productos";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore, type ItemCarrito as Item } from "@/store/cartStore";

const botonCantidad =
  "flex size-8 items-center justify-center rounded-lg border border-gray-300 text-lg font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40";

export function ItemCarrito({ item }: { item: Item }) {
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <ImagenProducto url={item.imagen_url} nombre={item.nombre} className="size-16 shrink-0 rounded-lg text-lg" />

      <div className="min-w-40 flex-1">
        <p className="font-semibold">{item.nombre}</p>
        <p className="text-sm text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${item.nombre}`}>
        <button
          type="button"
          className={botonCantidad}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
          disabled={item.cantidad <= 1}
          aria-label="Restar uno"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={item.stock}
          value={item.cantidad}
          onChange={(e) => {
            const valor = e.target.valueAsNumber;
            if (!Number.isNaN(valor)) cambiarCantidad(item.producto_id, valor);
          }}
          aria-label="Cantidad"
          className="input w-16 text-center"
        />
        <button
          type="button"
          className={botonCantidad}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
          disabled={item.cantidad >= item.stock}
          aria-label="Sumar uno"
        >
          +
        </button>
      </div>

      <p className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>

      <button
        type="button"
        onClick={() => quitar(item.producto_id)}
        className="text-sm font-medium text-error hover:underline"
      >
        Quitar
      </button>
    </li>
  );
}
