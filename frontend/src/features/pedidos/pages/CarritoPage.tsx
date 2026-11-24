import { Link } from "react-router-dom";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { formatearPrecio } from "@/shared/utils/formato";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ItemCarrito } from "../components/ItemCarrito";

const botonLink = "rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-hover";

export function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const usuario = useAuthStore((state) => state.usuario);

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className={botonLink}>
            Ver el catálogo
          </Link>
        }
      />
    );
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Carrito</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <ItemCarrito key={item.producto_id} item={item} />
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Productos</span>
            <span>{items.reduce((suma, item) => suma + item.cantidad, 0)} unidades</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <p className="text-xs text-gray-500">El precio y el stock se confirman al crear el pedido.</p>
          <Link to="/checkout" className={botonLink}>
            {usuario ? "Continuar con el pedido" : "Iniciar sesión y continuar"}
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm("¿Vaciar el carrito?")) vaciar();
            }}
          >
            Vaciar carrito
          </Button>
        </Card>
      </div>
    </section>
  );
}
