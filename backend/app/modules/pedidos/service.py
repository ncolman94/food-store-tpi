from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


# Maquina de estados (RN-02): a donde puede pasar cada estado
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    # No hace commit ni rollback: cada caso de uso corre dentro de un bloque with del UoW,
    # y el schema de salida se arma adentro del bloque, antes del commit

    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def _buscar(self, uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: cada linea devuelve su cantidad, en la misma transaccion que el cambio de estado
        for item in pedido.items:
            producto = uow.productos.get_for_update(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        # RN-01: todo en una transaccion. Si una validacion falla, no se guarda nada,
        # tampoco el stock ya descontado de los items anteriores
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un mismo producto no puede repetirse en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas or None,
                    total=0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"No existe el producto con id {item.producto_id}")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"{producto.nombre} no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de {producto.nombre}: quedan {producto.stock}"
                    )
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                # La linea copia el nombre y el precio: no cambian si despues cambia el producto
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario_id: int, es_admin: bool, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        # RN-04: el cliente ve solo los suyos; el admin, todos
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                None if es_admin else usuario_id, skip, limit, estado
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido es de otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        # El admin avanza o cancela desde cualquier estado no terminal
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(
                    f"Un pedido {pedido.estado} no puede pasar a {nuevo_estado}"
                )
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        # El duenio cancela solo sus pedidos y solo en PENDIENTE (RN-04)
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido es de otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    f"Solo se puede cancelar un pedido PENDIENTE; este está {pedido.estado}"
                )
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        # "Hoy" es el dia de la zona horaria del servidor, desde las 00:00
        inicio_de_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_de_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total("ENTREGADO"), 2),
            )
