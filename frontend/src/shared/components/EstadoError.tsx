import { Button } from "@/shared/ui/Button";

interface EstadoErrorProps {
  titulo: string;
  mensaje: string;
  onRetry?: () => void;
}

export function EstadoError({ titulo, mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div role="alert" className="space-y-2 rounded-lg border border-error bg-error/5 p-4 text-error">
      <p className="font-semibold">{titulo}</p>
      <p className="text-sm">{mensaje}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
