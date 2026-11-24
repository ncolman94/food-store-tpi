from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])

# Lecturas publicas; escrituras solo para admin
SOLO_ADMIN = [Depends(require_role(["admin"]))]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork(session_factory))


ProductoServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ProductoServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100)] = None,
    categoria_id: Annotated[int | None, Query(gt=0)] = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead)
def obtener_producto(id: Annotated[int, Path(gt=0)], service: ProductoServiceDep) -> ProductoRead:
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=SOLO_ADMIN
)
def crear_producto(data: ProductoCreate, service: ProductoServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{id}", response_model=ProductoRead, dependencies=SOLO_ADMIN)
def actualizar_producto(
    id: Annotated[int, Path(gt=0)], data: ProductoUpdate, service: ProductoServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{id}/stock", response_model=ProductoRead, dependencies=SOLO_ADMIN)
def actualizar_stock(
    id: Annotated[int, Path(gt=0)], data: ProductoStockUpdate, service: ProductoServiceDep
) -> ProductoRead:
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SOLO_ADMIN)
def eliminar_producto(id: Annotated[int, Path(gt=0)], service: ProductoServiceDep) -> None:
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
