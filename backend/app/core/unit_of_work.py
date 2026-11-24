from collections.abc import Callable
from types import TracebackType

from sqlmodel import Session


class UnitOfWork:
    # Cada bloque with es una transaccion: commit si todo salio bien, rollback si hubo
    # una excepcion, y close siempre. El unit_of_work.py de cada modulo agrega sus repositorios

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self.session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        self.session = self.session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            # No devuelve True: la excepcion sigue hasta el router
            self.session.close()
