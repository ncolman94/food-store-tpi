# Carga inicial: el admin, un cliente de prueba, categorias y productos con stock.
# Es idempotente: se puede correr varias veces sin duplicar nada.
# Uso, desde la carpeta backend: python -m app.db.seed

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    # username, full_name, email, contrasena, rol
    ("admin", "Administrador Food Store", "admin@foodstore.com", "Admin1234!", "admin"),
    ("cliente", "Cliente de Prueba", "cliente@foodstore.com", "Cliente1234!", "user"),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra con masa casera"),
    ("Hamburguesas", "Hamburguesas de carne con papas"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Postres caseros"),
]


def imagen(texto: str, color: str) -> str:
    return f"https://placehold.co/600x400/{color}/ffffff?text={texto.replace(' ', '+')}"


PRODUCTOS = [
    # nombre, descripcion, precio, stock, categoria, color de la imagen
    ("Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20, "Pizzas", "e11d48"),
    ("Pizza Napolitana", "Muzzarella, tomate en rodajas, ajo y orégano", 10800, 15, "Pizzas", "e11d48"),
    ("Pizza Fugazzeta", "Muzzarella y cebolla caramelizada", 10200, 12, "Pizzas", "e11d48"),
    ("Hamburguesa Clásica", "Medallón de carne, lechuga, tomate y papas", 8900, 25, "Hamburguesas", "d97706"),
    ("Hamburguesa Doble Cheddar", "Doble medallón, doble cheddar y panceta", 11500, 10, "Hamburguesas", "d97706"),
    ("Empanada de Carne", "Carne cortada a cuchillo, cebolla y huevo", 1500, 60, "Empanadas", "16a34a"),
    ("Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 60, "Empanadas", "16a34a"),
    ("Coca-Cola 1,5 L", "Gaseosa línea", 3200, 30, "Bebidas", "2563eb"),
    ("Agua sin gas 500 ml", "Agua mineral", 1200, 40, "Bebidas", "2563eb"),
    ("Cerveza artesanal 500 ml", "Rubia, tirada", 4200, 3, "Bebidas", "2563eb"),
    ("Flan con dulce de leche", "Flan casero de vainilla", 3500, 8, "Postres", "7c3aed"),
    ("Brownie con helado", "Brownie de chocolate con helado de crema", 4800, 6, "Postres", "7c3aed"),
]


def run() -> None:
    create_all_tables()
    with Session(engine) as session:
        for username, full_name, email, password, role in USUARIOS:
            if session.exec(select(Usuario).where(Usuario.username == username)).first() is None:
                session.add(
                    Usuario(
                        username=username,
                        full_name=full_name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )
                print(f"  [+] Usuario {username} ({role})")

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                print(f"  [+] Categoría {nombre}")
            categorias[nombre] = categoria

        for nombre, descripcion, precio, stock, categoria, color in PRODUCTOS:
            if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=imagen(nombre, color),
                        categoria_id=categorias[categoria].id,
                    )
                )
                print(f"  [+] Producto {nombre}")

        session.commit()
    print("Seed terminado")


if __name__ == "__main__":
    run()
