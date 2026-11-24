import { useState } from "react";

interface ImagenProductoProps {
  url: string | null;
  nombre: string;
  className?: string;
}

// Sin imagen_url, o si la imagen no carga, se muestra un recuadro con la inicial
export function ImagenProducto({ url, nombre, className = "" }: ImagenProductoProps) {
  const [fallo, setFallo] = useState(false);

  if (!url || fallo) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center bg-orange-100 text-2xl font-bold text-brand ${className}`}
      >
        {nombre.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={nombre}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`bg-gray-100 object-cover ${className}`}
    />
  );
}
