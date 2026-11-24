import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, useEsAdmin } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 transition hover:bg-white/15 ${isActive ? "bg-white/20" : ""}`;

const enlaceAdmin = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 transition ${
    isActive ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const PANEL = [
  { to: "/admin/resumen", texto: "Resumen" },
  { to: "/admin/pedidos", texto: "Pedidos" },
  { to: "/admin/productos", texto: "Productos" },
  { to: "/admin/categorias", texto: "Categorías" },
  { to: "/admin/usuarios", texto: "Usuarios" },
];

export function Navbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const esAdmin = useEsAdmin();
  const unidades = useCartStore((state) => state.items.reduce((suma, item) => suma + item.cantidad, 0));
  const showNotification = useNotificationStore((state) => state.showNotification);
  const navigate = useNavigate();
  const enElPanel = useLocation().pathname.startsWith("/admin");

  const cerrarSesion = async () => {
    await logout();
    navigate("/login", { replace: true });
    showNotification("Sesión cerrada");
  };

  return (
    <header className="sticky top-0 z-10 shadow">
      <nav className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            🍕 Food Store
          </Link>

          <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
            <NavLink to="/" end className={enlace}>
              Catálogo
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={enlace}>
                Mis pedidos
              </NavLink>
            )}
            {/* Ocultar el enlace no protege la ruta: eso lo hacen ProtectedRoute y el backend */}
            {esAdmin && (
              <NavLink to="/admin/resumen" className={() => enlace({ isActive: enElPanel })}>
                Panel
              </NavLink>
            )}
            <NavLink to="/carrito" className={enlace}>
              Carrito
              {unidades > 0 && (
                <span className="ml-1.5 rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-brand">
                  {unidades}
                </span>
              )}
            </NavLink>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {usuario ? (
              <>
                <div className="text-right leading-tight">
                  <p className="font-semibold">{usuario.full_name}</p>
                  <p className="text-xs text-white/80">
                    {usuario.username} · {usuario.role === "admin" ? "Administrador" : "Cliente"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="rounded-lg border border-white/60 px-3 py-1.5 font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex gap-1 font-medium">
                <NavLink to="/login" className={enlace}>
                  Iniciar sesión
                </NavLink>
                <NavLink to="/register" className={enlace}>
                  Registrarse
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>

      {esAdmin && enElPanel && (
        <nav aria-label="Panel de administración" className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2 text-sm font-medium">
            {PANEL.map(({ to, texto }) => (
              <NavLink key={to} to={to} className={enlaceAdmin}>
                {texto}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
