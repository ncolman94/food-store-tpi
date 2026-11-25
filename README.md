# Food Store: sistema de pedidos de comida

Trabajo Práctico Integrador de Programación IV, Tecnicatura Universitaria en Programación a Distancia (UTN). Alumno: **Nicolás Colman**.

- **Repositorio:** https://github.com/ncolman94/food-store-tpi
- **Video de demostración:** COMPLETAR_LINK_DEL_VIDEO

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con la dirección de entrega y la forma de pago. El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

| Carpeta | Contenido |
|---|---|
| `backend/` | API REST con FastAPI + SQLModel sobre PostgreSQL (o SQLite para desarrollo). Arquitectura en capas por módulo con Unit of Work, JWT en cookie HttpOnly y roles `user` y `admin` |
| `frontend/` | React 19 + TypeScript + Vite + Tailwind CSS. TanStack Query, Form y Table, Zustand, Axios y React Router, organizado por features |

## Requisitos

- **Python** 3.11 a 3.13 (probado con 3.12)
- **PostgreSQL** 15 o superior. Para desarrollo local alcanza con SQLite, que no necesita instalar nada
- **Node.js** 20.19 o superior y **pnpm** 9 o superior (`npm install -g pnpm`)

## Puesta en marcha

Primero se levanta el backend (puerto 8000) y después el frontend (puerto 5173). Los comandos van desde la raíz del proyecto.

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # En Windows: copy .env.example .env
```

Completar el `.env` (ver [Variables de entorno](#variables-de-entorno)):

- **Con PostgreSQL**, la base tiene que existir: `createdb foodstore_db`, o `CREATE DATABASE foodstore_db;` desde `psql`. Las tablas las crea la aplicación. Después se ajusta `DATABASE_URL` con el usuario y la contraseña.
- **Con SQLite** alcanza con `DATABASE_URL=sqlite:///./foodstore.db`: el archivo se crea solo.
- **`SECRET_KEY`**: una clave aleatoria de al menos 32 caracteres. Se genera con `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

Después:

```bash
python -m app.db.seed              # Carga el admin, un cliente, categorías y productos
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs (Swagger) y http://localhost:8000/redoc

El seed es idempotente: se puede correr varias veces y no duplica nada.

### 2. Frontend

En otra terminal:

```bash
cd frontend
pnpm install
cp .env.example .env               # En Windows: copy .env.example .env
pnpm dev
```

La aplicación queda en http://localhost:5173. Es el único origen que el backend acepta con credenciales (`FRONTEND_ORIGIN`): si Vite levanta en otro puerto porque el 5173 está ocupado, hay que liberar ese puerto o cambiar `FRONTEND_ORIGIN` en el `.env` del backend.

Otros comandos:

- `pnpm build`: verifica los tipos con `tsc -b` y arma el build de producción en `dist/`.
- `pnpm lint`: corre oxlint.

## Usuarios del seed

| Usuario | Contraseña | Rol | Uso |
|---|---|---|---|
| `admin` | `Admin1234!` | `admin` | Panel de administración: resumen, pedidos, productos, categorías y usuarios |
| `cliente` | `Cliente1234!` | `user` | Cliente de prueba. También se puede crear uno nuevo desde «Registrarse» |

## Variables de entorno

Los dos proyectos traen un `.env.example`. Los archivos `.env` no se suben al repositorio ni se entregan.

**`backend/.env`**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:clave@localhost:5432/foodstore_db` o `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Firma de los JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS con credenciales | `http://localhost:5173` |

`postgresql://` se convierte solo a `postgresql+psycopg2://`, el driver que usa SQLAlchemy.

**`frontend/.env`**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

## Funcionalidades

**Cliente**

- **Catálogo** (`/`, público): paginado en el servidor (`skip = página × limit`), con búsqueda por nombre, filtro por categoría y «Solo disponibles». Muestra un skeleton mientras carga, un estado vacío y uno de error con «Reintentar».
- **Carrito** (`/carrito`, público): cantidades, subtotales y total. Se guarda en el navegador y sigue ahí al recargar. La cantidad no puede superar el stock que tenía el producto al agregarlo; el backend vuelve a validar el stock al confirmar.
- **Checkout** (`/checkout`, con sesión): formulario de TanStack Form con la dirección de entrega (5 a 200 caracteres), la forma de pago (efectivo o transferencia) y notas opcionales. Envía `POST /pedidos`, vacía el carrito y lleva a «Mis pedidos». Si el cliente llega sin sesión, el login (o el registro) lo devuelve al checkout.
- **Mis pedidos** (`/mis-pedidos`, con sesión): pedidos propios paginados, con filtro por estado, detalle y «Cancelar» solo en `PENDIENTE`.
- **Registro e inicio de sesión** con TanStack Form, con las mismas validaciones que el backend. El registro inicia la sesión.

**Administrador** (`/admin/...`, solo rol `admin`)

- **Resumen**: tarjetas con los pedidos pendientes, en preparación, entregados y cancelados, los pedidos de hoy y los ingresos de los entregados. Cada tarjeta lleva a la tabla de pedidos filtrada.
- **Pedidos**: TanStack Table paginada en el servidor, con filtro por estado (también en la URL: `?estado=PENDIENTE`), detalle y botones para avanzar o cancelar según la máquina de estados.
- **Productos** y **Categorías**: ABM con TanStack Table (orden, búsqueda y paginación del lado del cliente; el panel pide `limit=100`) y TanStack Form en un modal. En productos, el botón «Stock» cambia el stock y la disponibilidad con `PATCH /productos/{id}/stock`. Las bajas son lógicas.
- **Usuarios**: tabla con usuario, nombre, email, rol y estado, con «Activar» y «Desactivar». La fila del admin de la sesión no tiene botón.

## Backend

### Estructura

```
backend/
├── app/
│   ├── main.py                 # FastAPI, CORS con credenciales, routers bajo /api/v1 y /health
│   ├── core/
│   │   ├── config.py           # Settings con pydantic-settings, leídas del .env
│   │   ├── database.py         # engine, create_all_tables y session_factory
│   │   ├── security.py         # Hash bcrypt, create_access_token y decode_access_token
│   │   ├── deps.py             # get_current_user (lee la cookie), get_current_active_user y require_role
│   │   ├── unit_of_work.py     # UnitOfWork: abre la sesión; commit, rollback y close en __exit__
│   │   ├── base_repository.py  # BaseRepository[T]: get_by_id, get_all, add y delete
│   │   └── tiempo.py           # Fecha y hora actual en UTC
│   ├── modules/
│   │   ├── auth/               # router, service y schemas (usa el modelo Usuario)
│   │   ├── usuarios/           # models, schemas, repository, unit_of_work, service y router
│   │   ├── categorias/         # la misma cadena de archivos
│   │   ├── productos/          # la misma cadena de archivos
│   │   └── pedidos/            # la misma cadena: Pedido, DetallePedido y las reglas RN-01 a RN-06
│   └── db/
│       └── seed.py             # Datos iniciales, idempotente
├── food_store.http             # Recorrido de la API con REST Client (75 peticiones)
├── requirements.txt            # Versiones fijadas
└── .env.example
```

### Capas y Unit of Work

Cada módulo sigue la cadena Router → Service → Unit of Work → Repository → Model, y ninguna capa importa de la de arriba:

- El **Router** valida el cuerpo con los schemas, resuelve la sesión y el rol con `Depends`, obtiene el Service con `Depends(get_<modulo>_service)` y traduce las excepciones de dominio a `HTTPException` (404, 409, 403 o 400).
- El **Service** aplica las reglas dentro de `with self.uow as uow:` y devuelve el schema de salida (`Modelo.model_validate(...)`) adentro del bloque.
- El **Unit of Work** de cada módulo expone los repositorios que comparten la sesión. El commit ocurre en su `__exit__`; si hubo una excepción, hace rollback. Ningún Service ni Router llama a `session.commit()`.
- Los **Repositories** heredan de `BaseRepository[T]` y solo hacen consultas (`get_by_nombre`, `search`, `list_by_usuario`, `count_by_estado`...).
- Ningún endpoint devuelve un modelo de tabla: las respuestas son schemas sin `table=True`, y `UserPublic` nunca incluye `hashed_password`.

### Modelo de datos

Las cinco entidades del UML (`Usuario`, `Categoria`, `Producto`, `Pedido` y `DetallePedido`), con las relaciones `Categoria.productos`/`Producto.categoria`, `Usuario.pedidos`/`Pedido.usuario`, `Pedido.items`/`DetallePedido.pedido` y `Producto.detalles`/`DetallePedido.producto`.

- **Baja lógica**: `activo` en categorías y productos y `disabled` en usuarios. Un registro dado de baja se trata como inexistente (404). La baja de una categoría no libera su nombre ni oculta sus productos.
- **Los pedidos no se borran**: se cancelan.
- **`DetallePedido` copia `nombre_producto` y `precio_unitario`**: si después cambia el precio del producto, el pedido conserva el de la compra.

### Reglas de negocio

- **RN-01, crear pedido**: al menos un ítem y sin productos repetidos. Por cada ítem se lee el producto con bloqueo de fila (`SELECT ... FOR UPDATE`), se verifica que exista, esté activo y disponible y tenga stock, se descuenta y se crea la línea con la copia del nombre y del precio. Todo ocurre en una transacción: si un ítem falla, no se guarda nada, tampoco el descuento de los anteriores. El `food_store.http` lo prueba (peticiones 23 y 24).
- **RN-02, máquina de estados**: `PENDIENTE → EN_PREPARACION | CANCELADO` y `EN_PREPARACION → ENTREGADO | CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales. El mapa `TRANSICIONES` vive en el service de pedidos, y una transición inválida responde 400.
- **RN-03, cancelar**: devuelve el stock de cada línea en la misma transacción que cambia el estado.
- **RN-04, permisos**: el cliente solo ve y cancela sus pedidos, y solo en `PENDIENTE`. El admin ve todos y avanza o cancela cualquiera que no sea terminal.
- **RN-05, inmutabilidad**: no hay endpoints para editar ni borrar pedidos.
- **RN-06, datos del pedido**: `forma_pago` es `EFECTIVO` o `TRANSFERENCIA` y `direccion_entrega` tiene entre 5 y 200 caracteres. Lo valida el schema (422).

### Endpoints (`/api/v1`)

| Recurso | Endpoints | Acceso |
|---|---|---|
| Auth | `POST /auth/register` (201, 409), `POST /auth/token` (cookie; 401, 400), `POST /auth/logout`, `GET /auth/me` | Público; `/me` con sesión |
| Usuarios | `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar` y `/desactivar` (404; 400 si el admin se desactiva a sí mismo) | `admin` |
| Categorías | `GET /categorias`, `GET /categorias/{id}` | Público |
| | `POST /categorias` (201, 409), `PUT /categorias/{id}` (404, 409), `DELETE /categorias/{id}` (204, 404) | `admin` |
| Productos | `GET /productos?skip&limit&search&categoria_id&disponible` → `{ total, items }`, `GET /productos/{id}` | Público |
| | `POST /productos` (201; 404 si la categoría no sirve), `PUT /productos/{id}`, `PATCH /productos/{id}/stock`, `DELETE /productos/{id}` (204) | `admin` |
| Pedidos | `POST /pedidos` (201; 404; 400), `GET /pedidos?skip&limit&estado` (propios o todos), `GET /pedidos/{id}` (404, 403), `PATCH /pedidos/{id}/cancelar` (dueño; 403, 400) | Con sesión |
| | `GET /pedidos/resumen`, `PATCH /pedidos/{id}/estado` (404, 400) | `admin` |

Comunes a todos: 401 sin sesión válida, 400 «Cuenta de usuario desactivada», 403 si el rol no alcanza y 422 si el cuerpo o los parámetros no pasan la validación. `PUT` es una actualización parcial: cambia los campos enviados y conserva los demás. Los listados paginados aceptan `skip` y `limit` (por defecto 0 y 20, máximo 100).

Para probar la API: `backend/food_store.http` con la extensión REST Client de VS Code (se corre en orden: cubre los casos felices, los códigos de error, el rollback y la restitución de stock), o Swagger en `/docs`.

## Frontend

### Estructura por features

```
frontend/src/
├── shared/                      # Transversal, sin lógica de negocio
│   ├── api/                     # axiosInstance (withCredentials + interceptor), handleApiError, queryClient
│   ├── ui/                      # Button, Card, Input, Modal y BadgeEstado
│   ├── components/              # Paginacion, Skeleton, EstadoVacio, EstadoError, DataTable y Toast
│   ├── layout/                  # Navbar y MainLayout
│   └── utils/formato.ts         # Precios en pesos y fechas en hora local
├── features/                    # Un dominio por carpeta: pages, components, hooks, api y types
│   ├── auth/                    # LoginPage, RegisterPage, UnauthorizedPage, useLogin, useRegistro
│   ├── categorias/              # AdminCategoriasPage, CategoriaForm, useCategorias
│   ├── productos/               # CatalogoPage, AdminProductosPage, ProductoCard, ProductoForm, StockForm, useProductos
│   ├── usuarios/                # AdminUsuariosPage, useUsuarios
│   └── pedidos/                 # CarritoPage, CheckoutPage, MisPedidosPage, AdminPedidosPage, AdminResumenPage,
│                                # usePedidos, useCrearPedido, useCambiarEstadoPedido, useCancelarPedido, useResumenPedidos
├── store/                       # authStore, cartStore y notificationStore (Zustand)
├── routes/                      # AppRouter (BrowserRouter) y ProtectedRoute
├── App.tsx                      # checkSession al montar, AppRouter y Toast
└── main.tsx                     # QueryClientProvider
```

Cada feature expone lo que usan las demás en su `index.ts` (por ejemplo, `@/features/categorias` exporta `useCategorias` y el tipo `Categoria`), y las features se importan entre sí solo a través de ese archivo. Los tipos usan los mismos nombres de campo que los schemas del backend (`precio_base`, `full_name`, `direccion_entrega`...). TypeScript corre con `strict: true` y sin `any`.

### Estado del servidor y del cliente

- **TanStack Query** maneja todo lo que viene de la API, con `queryKey` descriptivas: `['productos', filtros]`, `['categorias']`, `['pedidos', filtros]`, `['pedidos', 'resumen']` y `['usuarios']`. Las mutaciones invalidan lo que cambian: crear o cancelar un pedido invalida `pedidos` y también `productos`, porque cambió el stock. Ningún componente pide datos con `fetch` dentro de un `useEffect`: el único `useEffect` que llama a la API es `checkSession` al montar la app.
- **`authStore`** (Zustand con `persist` en `sessionStorage`): `usuario` (el `UserPublic` del backend: nombre, email y rol), `cargando`, `login`, `logout` y `checkSession`. `partialize` guarda solo `usuario`. El token nunca pasa por JavaScript.
- **`cartStore`** (Zustand con `persist` en `localStorage`): `items` (`producto_id`, `nombre`, `precio_unitario` y `cantidad`, más la imagen y el stock para mostrar la línea y limitar la cantidad), `agregar`, `quitar`, `cambiarCantidad`, `vaciar` y `total`.

### Sesión y rutas protegidas

- **Axios** (`shared/api/axiosInstance.ts`): `baseURL = VITE_API_URL` y `withCredentials: true`, así el navegador guarda la cookie del login y la manda en cada petición. Su interceptor de respuesta limpia el `authStore` ante un 401 (salvo en `/auth/token`, donde significa credenciales incorrectas, y en `/auth/me`) o ante un 400 «Cuenta de usuario desactivada», y avisa con un toast.
- **`ProtectedRoute`**: mientras `checkSession` confirma la sesión muestra «Verificando la sesión...» (así una recarga no manda al login), sin usuario redirige a `/login` y sin el rol a `/unauthorized`. El login vuelve a la pantalla que se había pedido.
- **Logout**: `POST /auth/logout`, que borra la cookie, limpia el `authStore` y la caché de TanStack Query y redirige a `/login`.
- Ocultar un botón no protege nada: la protección real está en el backend, que responde 401 y 403 en cada endpoint.

| Ruta | Acceso |
|---|---|
| `/`, `/carrito`, `/login`, `/register`, `/unauthorized` | Público |
| `/checkout`, `/mis-pedidos` | Con sesión |
| `/admin/resumen`, `/admin/pedidos`, `/admin/productos`, `/admin/categorias`, `/admin/usuarios` | `admin` |

## Verificación

- Backend: `food_store.http` (75 peticiones) da los códigos esperados con PostgreSQL y con SQLite, y confirma el descuento de stock, el rollback del pedido fallido y la restitución al cancelar.
- Frontend: `pnpm install`, `pnpm build` y `pnpm lint` sin errores ni avisos. El recorrido completo se probó en el navegador: catálogo, carrito, registro, checkout, cancelación con restitución de stock, panel del admin, vencimiento de sesión y cuenta desactivada.
