import { Link } from "react-router-dom";

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  color: string;
  // Lleva a la tabla de pedidos con ese filtro
  to?: string;
}

export function TarjetaResumen({ titulo, valor, color, to }: TarjetaResumenProps) {
  const contenido = (
    <>
      <p className="text-sm font-medium text-gray-500">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{valor}</p>
    </>
  );
  const clases = `block rounded-xl border border-gray-200 border-l-4 bg-white p-5 shadow-sm ${color}`;

  return to ? (
    <Link to={to} className={`${clases} transition hover:shadow-md`}>
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  );
}
