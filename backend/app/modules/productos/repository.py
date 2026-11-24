from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_for_update(self, producto_id: int) -> Producto | None:
        # Bloquea la fila hasta el commit: dos pedidos simultaneos no venden el mismo stock
        return self.session.get(Producto, producto_id, with_for_update=True)

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        # Solo los activos; el total es antes de paginar
        filtros = [col(Producto.activo)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        query = (
            select(Producto)
            .where(*filtros)
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
        )
        return total, list(self.session.exec(query).all())
