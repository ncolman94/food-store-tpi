import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getMe, login, logout } from "@/features/auth/api/auth";
import type { LoginData, Usuario } from "@/features/auth/types/auth.types";
import { queryClient } from "@/shared/api/queryClient";

interface AuthState {
  usuario: Usuario | null;
  // true hasta que checkSession confirma (o descarta) la sesion al iniciar la app
  cargando: boolean;
  login: (datos: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  // La usa el interceptor cuando la sesion vence
  limpiarSesion: () => void;
}

// No hay campo token: el token viaja en la cookie HttpOnly, que JavaScript no puede leer
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      // Si las credenciales no sirven, el error sigue de largo hasta el formulario
      login: async (datos) => {
        await login(datos); // el servidor guarda la cookie
        set({ usuario: await getMe() });
      },

      logout: async () => {
        try {
          await logout(); // el servidor borra la cookie
        } finally {
          set({ usuario: null });
          // Lo que quedo en cache (pedidos, usuarios) era de esta sesion
          queryClient.clear();
        }
      },

      checkSession: async () => {
        try {
          set({ usuario: await getMe() });
        } catch {
          // 401: no hay cookie o vencio. 400: la cuenta fue desactivada
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      // Solo los datos del usuario; nunca el token ni el estado de carga
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);

export const useEsAdmin = () => useAuthStore((state) => state.usuario?.role === "admin");
