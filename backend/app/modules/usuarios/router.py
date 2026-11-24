from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.database import session_factory
from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork(session_factory))


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: AdminUser, service: UsuarioServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(
    id: Annotated[int, Path(gt=0)], _admin: AdminUser, service: UsuarioServiceDep
) -> UserPublic:
    try:
        return service.activar(id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: Annotated[int, Path(gt=0)], admin: AdminUser, service: UsuarioServiceDep
) -> UserPublic:
    try:
        return service.desactivar(id, admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AutoDesactivacion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
