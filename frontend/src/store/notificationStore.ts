import { create } from "zustand";

export type TipoNotificacion = "exito" | "error";

interface NotificationStore {
  message: string;
  tipo: TipoNotificacion;
  show: boolean;
  // Cambia con cada aviso: asi un mensaje repetido vuelve a contar los 3 segundos
  id: number;
  showNotification: (message: string, tipo?: TipoNotificacion) => void;
  hideNotification: () => void;
}

// Una notificacion a la vez: un aviso nuevo reemplaza al anterior
export const useNotificationStore = create<NotificationStore>()((set) => ({
  message: "",
  tipo: "exito",
  show: false,
  id: 0,
  showNotification: (message, tipo = "exito") =>
    set((state) => ({ message, tipo, show: true, id: state.id + 1 })),
  hideNotification: () => set({ message: "", show: false }),
}));
