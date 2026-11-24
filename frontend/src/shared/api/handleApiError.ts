import axios from "axios";

interface ErrorDeValidacion {
  loc?: (string | number)[];
  msg?: string;
}

// Convierte el error de la API en un mensaje para la pantalla
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) return "Ocurrió un error inesperado.";
  if (error.code === "ECONNABORTED") return "El servidor tardó demasiado en responder.";
  if (!error.response) return "No se pudo conectar con el servidor.";

  const { status, data } = error.response;
  const detail = (data as { detail?: unknown } | undefined)?.detail;

  // 400, 404 y 409 traen el mensaje del Service en detail
  if (typeof detail === "string") return detail;

  switch (status) {
    case 401:
      return "La sesión venció. Volvé a iniciar sesión.";
    case 403:
      return "No tenés permisos para realizar esta acción.";
    case 422: {
      // El 422 de FastAPI trae una lista con el campo y el motivo
      const primero = Array.isArray(detail) ? (detail[0] as ErrorDeValidacion) : undefined;
      const campo = primero?.loc?.at(-1);
      return primero?.msg
        ? `Dato inválido${campo ? ` en ${campo}` : ""}: ${primero.msg}`
        : "Los datos enviados no son válidos.";
    }
  }
  if (status < 500) return "No se pudo completar la operación.";
  return "Error del servidor. Intentá de nuevo más tarde.";
}
