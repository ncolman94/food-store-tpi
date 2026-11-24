import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  mensaje: string;
  // Accion sugerida, por ejemplo volver al catalogo
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <h2 className="font-semibold text-gray-900">{titulo}</h2>
      <p className="mt-1 text-sm text-gray-500">{mensaje}</p>
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}
