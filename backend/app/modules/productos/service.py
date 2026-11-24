from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def _buscar(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        # Un producto dado de baja se trata como inexistente
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._buscar(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True)
            # nombre, precio, stock, disponible y categoria no admiten null
            for campo in ("nombre", "descripcion", "precio_base", "stock", "disponible"):
                if cambios.get(campo, 0) is None:
                    cambios.pop(campo)
            if cambios.get("categoria_id") is not None:
                self._validar_categoria(uow, cambios["categoria_id"])
            else:
                cambios.pop("categoria_id", None)
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)
            # La categoria pudo cambiar: se vuelve a leer la relacion
            uow.session.refresh(producto, ["categoria"])
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar(uow, producto_id)
            producto.sqlmodel_update(data.model_dump(exclude_unset=True, exclude_none=True))
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        # Baja logica: los pedidos que lo incluyen conservan sus lineas
        with self.uow as uow:
            producto = self._buscar(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)
