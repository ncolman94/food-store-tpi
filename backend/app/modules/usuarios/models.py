from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.tiempo import ahora

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=120)
    email: str = Field(max_length=254, unique=True, index=True)
    # Hash bcrypt, nunca la contrasena
    hashed_password: str
    # "user" o "admin". El registro publico siempre crea "user"
    role: str = Field(default="user", max_length=20)
    # Baja logica: el admin activa y desactiva
    disabled: bool = False
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
