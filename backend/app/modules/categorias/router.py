from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])

# Lecturas publicas; escrituras solo para admin
SOLO_ADMIN = [Depends(require_role(["admin"]))]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork(session_factory))


CategoriaServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: CategoriaServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(
    id: Annotated[int, Path(gt=0)], service: CategoriaServiceDep
) -> CategoriaRead:
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=SOLO_ADMIN
)
def crear_categoria(data: CategoriaCreate, service: CategoriaServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{id}", response_model=CategoriaRead, dependencies=SOLO_ADMIN)
def actualizar_categoria(
    id: Annotated[int, Path(gt=0)], data: CategoriaUpdate, service: CategoriaServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SOLO_ADMIN)
def eliminar_categoria(id: Annotated[int, Path(gt=0)], service: CategoriaServiceDep) -> None:
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
