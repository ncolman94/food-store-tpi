import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { registrar } from "../api/auth";
import type { UserCreate } from "../types/auth.types";

// Registra la cuenta (rol user) y despues inicia la sesion con los mismos datos
export function useRegistro() {
  const login = useAuthStore((state) => state.login);
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation({
    mutationFn: async (datos: UserCreate) => {
      const usuario = await registrar(datos);
      await login({ username: datos.username, password: datos.password });
      return usuario;
    },
    onSuccess: (usuario) => showNotification(`Cuenta creada. ¡Bienvenido/a, ${usuario.full_name}!`),
  });
}
