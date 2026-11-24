import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Usuario } from "@/features/auth";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { activarUsuario, desactivarUsuario, getUsuarios } from "../api/usuarios";

export const usuariosKey = ["usuarios"] as const;

export function useUsuarios() {
  return useQuery({ queryKey: usuariosKey, queryFn: getUsuarios });
}

// Activar y desactivar son idempotentes en el backend: responden 200 aunque no cambie nada
export function useUsuarioMutations() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const invalidar = () => queryClient.invalidateQueries({ queryKey: usuariosKey });
  const avisarError = (e: unknown) => showNotification(handleApiError(e), "error");

  const activar = useMutation({
    mutationFn: (usuario: Usuario) => activarUsuario(usuario.id),
    onSuccess: (usuario) => {
      invalidar();
      showNotification(`${usuario.username} está activo`);
    },
    onError: avisarError,
  });

  const desactivar = useMutation({
    mutationFn: (usuario: Usuario) => desactivarUsuario(usuario.id),
    onSuccess: (usuario) => {
      invalidar();
      showNotification(`${usuario.username} fue desactivado`);
    },
    onError: avisarError,
  });

  return { activar, desactivar };
}
