import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

// Instancia unica: se crea afuera de los componentes para no perder la cache
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Un 4xx (sin sesion, sin permiso, inexistente) no se arregla reintentando
      retry: (failureCount, error) =>
        failureCount < 2 && !(isAxiosError(error) && (error.response?.status ?? 500) < 500),
      refetchOnWindowFocus: false,
    },
  },
});
