import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/features/categorias";
import { Button } from "@/shared/ui/Button";
import { Campo, Input } from "@/shared/ui/Input";
import type { Producto, ProductoCreate } from "../types/producto.types";

interface ProductoFormProps {
  // null para un producto nuevo
  producto: Producto | null;
  categorias: Categoria[];
  onSubmit: (valores: ProductoCreate) => void;
  onCancelar: () => void;
  guardando: boolean;
  error: string | null;
}

// Un input numerico vacio da NaN; se muestra vacio
const numeroEnInput = (valor: number) => (Number.isNaN(valor) ? "" : String(valor));

const validarNombre = ({ value }: { value: string }) => {
  if (!value.trim()) return "El nombre es obligatorio";
  if (value.trim().length > 150) return "El nombre admite hasta 150 caracteres";
  return undefined;
};

const validarPrecio = ({ value }: { value: number }) => {
  if (Number.isNaN(value)) return "Ingresá el precio";
  if (value < 0) return "El precio no puede ser negativo";
  return undefined;
};

const validarStock = ({ value }: { value: number }) => {
  if (Number.isNaN(value)) return "Ingresá el stock";
  if (!Number.isInteger(value) || value < 0) return "El stock es un entero mayor o igual a 0";
  return undefined;
};

const validarUrl = ({ value }: { value: string }) =>
  !value.trim() || /^https?:\/\/\S+$/.test(value.trim()) ? undefined : "La URL debe empezar con http:// o https://";

export function ProductoForm({ producto, categorias, onSubmit, onCancelar, guardando, error }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto?.precio_base ?? Number.NaN,
      imagen_url: producto?.imagen_url ?? "",
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: ({ value }) =>
      onSubmit({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        imagen_url: value.imagen_url.trim() || null,
      }),
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

      <form.Field name="nombre" validators={{ onChange: validarNombre }}>
        {(field) => (
          <Input
            id="nombre"
            label="Nombre"
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : "Elegí una categoría") }}
      >
        {(field) => (
          <Campo id="categoria_id" label="Categoría" errores={field.state.meta.errors}>
            <select
              id="categoria_id"
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              aria-invalid={field.state.meta.errors.length > 0}
              className="input"
            >
              <option value="">Elegí una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </Campo>
        )}
      </form.Field>

      <form.Field name="precio_base" validators={{ onChange: validarPrecio }}>
        {(field) => (
          <Input
            id="precio_base"
            label="Precio base ($)"
            type="number"
            min={0}
            step="0.01"
            value={numeroEnInput(field.state.value)}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Field
        name="descripcion"
        validators={{
          onChange: ({ value }) => (value.length > 1000 ? "La descripción admite hasta 1000 caracteres" : undefined),
        }}
      >
        {(field) => (
          <Campo id="descripcion" label="Descripción (opcional)" errores={field.state.meta.errors}>
            <textarea
              id="descripcion"
              rows={2}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="input"
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="imagen_url" validators={{ onChange: validarUrl }}>
        {(field) => (
          <Input
            id="imagen_url"
            label="URL de la imagen (opcional)"
            type="url"
            placeholder="https://..."
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      {/* Al editar, el stock y la disponibilidad se cambian con el boton Stock (PATCH) */}
      {!producto && (
        <div className="grid grid-cols-2 items-start gap-4">
          <form.Field name="stock" validators={{ onChange: validarStock }}>
            {(field) => (
              <Input
                id="stock"
                label="Stock inicial"
                type="number"
                min={0}
                step={1}
                value={numeroEnInput(field.state.value)}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>
          <form.Field name="disponible">
            {(field) => (
              <label className="mt-7 flex items-center gap-2 text-sm text-gray-700">
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
        </div>
      )}

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
