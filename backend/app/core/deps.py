from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    # El token se lee solo de la cookie HttpOnly. El encabezado Authorization no se
    # acepta: para mandarlo, el frontend tendria que poder leer el token
    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No autenticado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    # 401 si el token no es valido, vencio o el usuario ya no existe
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credenciales_invalidas
    username = payload.get("sub")
    if not isinstance(username, str):
        raise credenciales_invalidas
    usuario = UsuarioService(UsuarioUnitOfWork(session_factory)).obtener_por_username(username)
    if usuario is None:
        raise credenciales_invalidas
    return usuario


def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    # El estado se consulta en cada peticion: una cuenta desactivada deja de operar
    # aunque su token no haya vencido
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada"
        )
    return current_user


def require_role(allowed_roles: list[str]):
    # Fabrica de dependencias: 403 si el rol del usuario no esta entre los permitidos
    def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return current_user

    return role_checker


CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
