from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def _buscar(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        # Una categoria dada de baja se trata como inexistente
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    def _validar_nombre(
        self, uow: CategoriaUnitOfWork, nombre: str, categoria_id: int | None = None
    ) -> None:
        existente = uow.categorias.get_by_nombre(nombre)
        if existente and existente.id != categoria_id:
            raise NombreDuplicado(f"Ya existe una categoría con el nombre {existente.nombre}")

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._buscar(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._validar_nombre(uow, data.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "nombre" in cambios:
                self._validar_nombre(uow, cambios["nombre"], categoria_id)
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        # Baja logica: sus productos siguen en el catalogo hasta que se den de baja
        with self.uow as uow:
            categoria = self._buscar(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)
