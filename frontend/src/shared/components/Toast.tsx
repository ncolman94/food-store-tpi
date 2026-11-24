import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

// Se monta una sola vez, en App.tsx. Cualquier parte de la app avisa con showNotification
export function Toast() {
  const message = useNotificationStore((state) => state.message);
  const tipo = useNotificationStore((state) => state.tipo);
  const show = useNotificationStore((state) => state.show);
  const id = useNotificationStore((state) => state.id);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  // Se oculta sola a los 3 segundos; un aviso nuevo vuelve a empezar la cuenta
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(hideNotification, 3000);
    return () => clearTimeout(timer);
  }, [show, id, hideNotification]);

  if (!show) return null;

  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`fixed right-4 bottom-4 z-30 flex max-w-sm items-start gap-3 rounded-lg border-l-4 bg-gray-900 px-4 py-3 text-sm text-white shadow-lg ${
        tipo === "error" ? "border-error" : "border-success"
      }`}
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={hideNotification}
        aria-label="Cerrar aviso"
        className="leading-none opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
