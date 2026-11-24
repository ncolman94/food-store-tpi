import { useLocation } from "react-router-dom";
import type { Usuario } from "../types/auth.types";

interface EstadoDeRuta {
  from?: { pathname: string };
}

// Pantalla que se habia pedido antes de que ProtectedRoute mandara al login
export function useDestino() {
  const state = useLocation().state as EstadoDeRuta | null;
  const pedida = state?.from?.pathname;

  return {
    state,
    destinoPara: (usuario: Usuario) => pedida ?? (usuario.role === "admin" ? "/admin/resumen" : "/"),
  };
}
