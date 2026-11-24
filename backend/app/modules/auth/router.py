from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.database import session_factory
from app.core.deps import CurrentUser
from app.modules.auth.schemas import MensajeRespuesta
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork(session_factory))


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]

# Mismos atributos al crear y al borrar la cookie
COOKIE = {"key": "access_token", "httponly": True, "samesite": "lax", "secure": False}


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthServiceDep) -> UserPublic:
    # Publico: el rol siempre es user
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/token", response_model=MensajeRespuesta)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthServiceDep,
    response: Response,
) -> MensajeRespuesta:
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivada as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    # El token no va en el cuerpo: va en una cookie que JavaScript no puede leer.
    # En produccion, con HTTPS, secure=True
    response.set_cookie(
        value=token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **COOKIE
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response) -> MensajeRespuesta:
    # Set-Cookie que borra la cookie. El JWT no se revoca: vale hasta que vence
    response.delete_cookie(**COOKIE)
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def read_me(current_user: CurrentUser) -> UserPublic:
    return current_user
