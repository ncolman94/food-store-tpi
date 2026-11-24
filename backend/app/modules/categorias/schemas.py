from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    model_config = {"str_strip_whitespace": True}

    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="", max_length=500)


# PUT actualiza solo los campos enviados
class CategoriaUpdate(SQLModel):
    model_config = {"str_strip_whitespace": True}

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
