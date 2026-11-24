from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # Entre todas, tambien las dadas de baja, y sin distinguir mayusculas
        query = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(query).first()

    def list_activas(self) -> list[Categoria]:
        query = select(Categoria).where(col(Categoria.activo)).order_by(col(Categoria.nombre))
        return list(self.session.exec(query).all())
