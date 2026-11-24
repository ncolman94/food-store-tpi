import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { formatearPrecio } from "@/shared/utils/formato";
import { Card } from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { CheckoutForm, type DatosCheckout } from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/useCrearPedido";

export function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  const confirmar = (datos: DatosCheckout) => {
    crearPedido.mutate(
      {
        items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      },
      {
        onSuccess: (pedido) => {
          vaciar();
          showNotification(`Pedido #${pedido.id} confirmado`);
          navigate("/mis-pedidos", { replace: true, state: { pedidoNuevo: pedido.id } });
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        mensaje="Tu carrito está vacío."
        accion={
          <Link to="/" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
            Ver el catálogo
          </Link>
        }
      />
    );
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <CheckoutForm
            onSubmit={confirmar}
            enviando={crearPedido.isPending}
            error={crearPedido.error ? handleApiError(crearPedido.error) : null}
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tu pedido</h2>
            <Link to="/carrito" className="text-sm font-medium text-brand hover:underline">
              Editar
            </Link>
          </div>
          <ul className="divide-y divide-gray-100 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-2 py-2">
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
        </Card>
      </div>
    </section>
  );
}
