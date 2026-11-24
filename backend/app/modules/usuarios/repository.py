from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        query = select(Usuario).where(func.lower(Usuario.username) == username.lower())
        return self.session.exec(query).first()

    def get_by_email(self, email: str) -> Usuario | None:
        query = select(Usuario).where(func.lower(Usuario.email) == email.lower())
        return self.session.exec(query).first()

    def get_all(self) -> list[Usuario]:
        return list(self.session.exec(select(Usuario).order_by(col(Usuario.id))).all())
