import type { InputHTMLAttributes, ReactNode } from "react";

interface CampoProps {
  id: string;
  label: string;
  // field.state.meta.errors de TanStack Form
  errores?: (string | undefined)[];
  ayuda?: string;
  children: ReactNode;
}

// Etiqueta, control y mensajes de error. Sirve para select, textarea o grupos de radios
export function Campo({ id, label, errores = [], ayuda, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {ayuda && <p className="text-xs text-gray-500">{ayuda}</p>}
      {errores.map((error) =>
        error ? (
          <p key={error} className="text-xs text-error">
            {error}
          </p>
        ) : null
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  errores?: (string | undefined)[];
  ayuda?: string;
}

export function Input({ id, label, errores = [], ayuda, className = "", ...props }: InputProps) {
  const conError = errores.some(Boolean);
  return (
    <Campo id={id} label={label} errores={errores} ayuda={ayuda}>
      <input id={id} aria-invalid={conError} className={`input ${className}`} {...props} />
    </Campo>
  );
}
