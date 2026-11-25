import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  // Sin roles, alcanza con tener sesion
  allowedRoles?: Rol[];
}

// Ordena la navegacion; la proteccion real la aplica el backend con require_role
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const location = useLocation();

  // Todavia no volvio /auth/me: no se redirige, asi una recarga no manda al login
  if (cargando) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-16 text-gray-500">
        <span className="size-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        Verificando la sesión...
      </div>
    );
  }

  // Se guarda la pantalla pedida para volver a ella despues del login
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
