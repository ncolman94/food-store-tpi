import { useEffect, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  ancho?: "md" | "lg";
}

export function Modal({ isOpen, titulo, onClose, children, ancho = "md" }: ModalProps) {
  // Mientras esta abierto, Escape lo cierra
  useEffect(() => {
    if (!isOpen) return;
    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className={`flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${
          ancho === "lg" ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="titulo-modal" className="text-xl font-semibold text-gray-900">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg px-2 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
