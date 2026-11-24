from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int | None, skip: int, limit: int, estado: str | None = None
    ) -> tuple[int, list[Pedido]]:
        # usuario_id None: los pedidos de todos (admin). Los mas nuevos primero
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        query = (
            select(Pedido)
            .where(*filtros)
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
            .options(selectinload(Pedido.items), selectinload(Pedido.usuario))  # type: ignore[arg-type]
        )
        return total, list(self.session.exec(query).all())

    def count_by_estado(self) -> dict[str, int]:
        query = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(query).all()}

    def count_desde(self, desde: datetime) -> int:
        query = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(query).one()

    def sum_total(self, estado: str) -> float:
        query = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(query).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)
