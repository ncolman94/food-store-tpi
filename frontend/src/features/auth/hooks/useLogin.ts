import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

// login del authStore como mutacion, para tener isPending y error en el formulario
export function useLogin() {
  const login = useAuthStore((state) => state.login);
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation({
    mutationFn: login,
    onSuccess: () => showNotification(`¡Hola, ${useAuthStore.getState().usuario?.full_name ?? ""}!`),
  });
}
