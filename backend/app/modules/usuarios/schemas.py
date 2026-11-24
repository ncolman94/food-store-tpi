import re
from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


USERNAME_VALIDO = re.compile(r"^[A-Za-z0-9_.-]+$")


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr = Field(max_length=254)
    # bcrypt usa solo los primeros 72 bytes
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username")
    @classmethod
    def username_sin_espacios(cls, value: str) -> str:
        if not USERNAME_VALIDO.match(value):
            raise ValueError("El usuario solo admite letras, números, punto, guion y guion bajo")
        return value

    @field_validator("full_name")
    @classmethod
    def nombre_sin_espacios_extra(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El nombre no puede estar vacío")
        return value

    @field_validator("password")
    @classmethod
    def password_hasta_72_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return value


# Nunca incluye hashed_password
class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
