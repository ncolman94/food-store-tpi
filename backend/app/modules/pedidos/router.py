from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.database import session_factory
from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork(session_factory))


PedidoServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


def _error(codigo: int, e: Exception) -> HTTPException:
    return HTTPException(status_code=codigo, detail=str(e))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, user: CurrentUser, service: PedidoServiceDep) -> PedidoRead:
    # El usuario sale de la sesion, nunca del cuerpo
    try:
        return service.crear(data, user.id)
    except ProductoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido) as e:
        raise _error(status.HTTP_400_BAD_REQUEST, e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    user: CurrentUser,
    service: PedidoServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(user.id, user.role == "admin", skip, limit, estado)


# Se declara antes de /{id}, si no "resumen" se tomaria como un id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUser, service: PedidoServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(
    id: Annotated[int, Path(gt=0)], user: CurrentUser, service: PedidoServiceDep
) -> PedidoRead:
    try:
        return service.obtener(id, user.id, user.role == "admin")
    except PedidoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except PedidoAjeno as e:
        raise _error(status.HTTP_403_FORBIDDEN, e)


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    id: Annotated[int, Path(gt=0)],
    data: CambioEstado,
    _admin: AdminUser,
    service: PedidoServiceDep,
) -> PedidoRead:
    try:
        return service.cambiar_estado(id, data.estado)
    except PedidoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except TransicionInvalida as e:
        raise _error(status.HTTP_400_BAD_REQUEST, e)


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: Annotated[int, Path(gt=0)], user: CurrentUser, service: PedidoServiceDep
) -> PedidoRead:
    try:
        return service.cancelar(id, user.id)
    except PedidoNoEncontrado as e:
        raise _error(status.HTTP_404_NOT_FOUND, e)
    except PedidoAjeno as e:
        raise _error(status.HTTP_403_FORBIDDEN, e)
    except TransicionInvalida as e:
        raise _error(status.HTTP_400_BAD_REQUEST, e)
