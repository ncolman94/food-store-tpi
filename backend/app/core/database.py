from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite (solo para desarrollo) necesita compartir la conexion entre hilos
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)


def create_all_tables() -> None:
    # Se importan los modelos para que queden registrados antes de crear las tablas
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # El Unit of Work pide una sesion nueva cada vez que se abre un bloque with
    return Session(engine)
