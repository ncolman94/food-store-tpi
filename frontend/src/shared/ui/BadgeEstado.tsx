type Estado = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";

const estilos: Record<Estado, { texto: string; clases: string }> = {
  PENDIENTE: { texto: "Pendiente", clases: "bg-amber-100 text-amber-800 ring-amber-200" },
  EN_PREPARACION: { texto: "En preparación", clases: "bg-sky-100 text-sky-800 ring-sky-200" },
  ENTREGADO: { texto: "Entregado", clases: "bg-green-100 text-green-800 ring-green-200" },
  CANCELADO: { texto: "Cancelado", clases: "bg-gray-100 text-gray-600 ring-gray-200" },
};

export function BadgeEstado({ estado }: { estado: Estado }) {
  const { texto, clases } = estilos[estado];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${clases}`}>
      {texto}
    </span>
  );
}
