from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class AutoDesactivacion(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def obtener_por_username(self, username: str) -> UserPublic | None:
        # Lo usa get_current_user en cada peticion protegida
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            return UserPublic.model_validate(usuario) if usuario else None

    def listar(self) -> list[UserPublic]:
        # Incluye a los desactivados: el campo disabled indica el estado
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def _buscar(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado("Usuario no encontrado")
        return usuario

    # Activar y desactivar son idempotentes: responden 200 aunque el estado no cambie

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._buscar(uow, usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._buscar(uow, usuario_id)
            if usuario_id == admin_id:
                raise AutoDesactivacion("No podés desactivar tu propia cuenta")
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
