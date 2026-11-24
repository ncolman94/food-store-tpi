import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

// Unica instancia de Axios de la app
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 10000,
  // El navegador guarda la cookie HttpOnly del login y la manda en cada peticion
  withCredentials: true,
});

// En el login un 401 es "credenciales incorrectas" y /auth/me lo maneja checkSession
const RUTAS_DE_AUTH = ["/auth/token", "/auth/me"];
const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const url = error.config?.url ?? "";
    const status = error.response?.status;
    const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
    const desactivada = status === 400 && error.response?.data?.detail === CUENTA_DESACTIVADA;

    if (!esDeAuth && (status === 401 || desactivada)) {
      // Sin usuario en el store, ProtectedRoute lleva al login
      useAuthStore.getState().limpiarSesion();
      useNotificationStore
        .getState()
        .showNotification(
          desactivada ? "Tu cuenta fue desactivada." : "La sesión venció. Volvé a iniciar sesión.",
          "error"
        );
    }

    // El error sigue de largo para que el hook o el componente tambien se entere
    return Promise.reject(error);
  }
);
