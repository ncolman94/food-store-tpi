import { Link } from "react-router-dom";
import { EstadoVacio } from "@/shared/components/EstadoVacio";

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="No tenés permiso para ver esta página"
      mensaje="Esta sección es solo para administradores."
      accion={
        <Link to="/" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
          Volver al catálogo
        </Link>
      }
    />
  );
}
