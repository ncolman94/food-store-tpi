import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import type { Producto, ProductoStockUpdate } from "../types/producto.types";

interface StockFormProps {
  producto: Producto;
  onSubmit: (cambios: ProductoStockUpdate) => void;
  onCancelar: () => void;
  guardando: boolean;
  error: string | null;
}

export function StockForm({ producto, onSubmit, onCancelar, guardando, error }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {error && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isInteger(value) && value >= 0 ? undefined : "El stock es un entero mayor o igual a 0",
        }}
      >
        {(field) => (
          <Input
            id="stock"
            label="Unidades en stock"
            type="number"
            min={0}
            step={1}
            autoFocus
            value={Number.isNaN(field.state.value) ? "" : String(field.state.value)}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            errores={field.state.meta.errors}
            ayuda="Los pedidos descuentan stock y las cancelaciones lo devuelven."
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 accent-brand"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando || !canSubmit}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
