import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Campo, Input } from "@/shared/ui/Input";
import { ETIQUETA_PAGO } from "../types/estados";
import type { FormaPago } from "../types/pedido.types";

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  onSubmit: (datos: DatosCheckout) => void;
  enviando: boolean;
  // Por ejemplo, stock insuficiente
  error: string | null;
}

const FORMAS_PAGO: FormaPago[] = ["EFECTIVO", "TRANSFERENCIA"];

// RN-06: la direccion tiene entre 5 y 200 caracteres
const validarDireccion = ({ value }: { value: string }) => {
  const largo = value.trim().length;
  if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
  if (largo > 200) return "La dirección admite hasta 200 caracteres";
  return undefined;
};

export function CheckoutForm({ onSubmit, enviando, error }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" } as DatosCheckout,
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      {error && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <form.Field name="direccion_entrega" validators={{ onChange: validarDireccion }}>
        {(field) => (
          <Input
            id="direccion_entrega"
            label="Dirección de entrega"
            autoComplete="street-address"
            placeholder="Calle, número, piso y departamento"
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-gray-700">Forma de pago</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {FORMAS_PAGO.map((forma) => (
                <label
                  key={forma}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                    field.state.value === forma ? "border-brand bg-brand/5" : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    value={forma}
                    checked={field.state.value === forma}
                    onChange={() => field.handleChange(forma)}
                    className="accent-brand"
                  />
                  <span>
                    <span className="block font-semibold">{ETIQUETA_PAGO[forma]}</span>
                    <span className="text-xs text-gray-500">
                      {forma === "EFECTIVO" ? "Pagás al recibir el pedido" : "Te pasamos los datos por mensaje"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? "Las notas admiten hasta 500 caracteres" : undefined) }}
      >
        {(field) => (
          <Campo id="notas" label="Notas (opcional)" errores={field.state.meta.errors}>
            <textarea
              id="notas"
              rows={3}
              placeholder="Timbre, referencias, sin cebolla..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="input"
            />
          </Campo>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit || enviando}>
            {enviando ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
