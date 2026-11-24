from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    # Unico tambien entre las dadas de baja: la baja logica no libera el nombre
    nombre: str = Field(max_length=100, unique=True)
    descripcion: str = ""
    activo: bool = True

    productos: list["Producto"] = Relationship(back_populates="categoria")
