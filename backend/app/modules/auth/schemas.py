from sqlmodel import SQLModel

# El registro y el perfil usan UserCreate y UserPublic del modulo usuarios


class MensajeRespuesta(SQLModel):
    message: str
