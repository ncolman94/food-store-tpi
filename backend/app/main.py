from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Crea las tablas que falten al arrancar
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API del sistema de pedidos de comida: catálogo, carrito, pedidos y usuarios.",
    version="1.0.0",
    lifespan=lifespan,
)

# Con credenciales el navegador acepta y envia la cookie desde el frontend.
# El origen va explicito: con allow_credentials no se admite "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
api.include_router(usuarios_router)
api.include_router(categorias_router)
api.include_router(productos_router)
api.include_router(pedidos_router)
app.include_router(api)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
