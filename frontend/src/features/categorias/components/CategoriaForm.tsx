import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Campo, Input } from "@/shared/ui/Input";
import type { Categoria, CategoriaCreate } from "../types/categoria.types";

interface CategoriaFormProps {
  // null para una categoria nueva
  categoria: Categoria | null;
  onSubmit: (valores: CategoriaCreate) => void;
  onCancelar: () => void;
  guardando: boolean;
  error: string | null;
}

const validarNombre = ({ value }: { value: string }) => {
  const largo = value.trim().length;
  if (largo < 2) return "El nombre debe tener al menos 2 caracteres";
  if (largo > 100) return "El nombre admite hasta 100 caracteres";
  return undefined;
};

export function CategoriaForm({ categoria, onSubmit, onCancelar, guardando, error }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    } satisfies CategoriaCreate,
    onSubmit: ({ value }) => onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() }),
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
        name="descripcion"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? "La descripción admite hasta 500 caracteres" : undefined),
        }}
      >
        {(field) => (
          <Campo id="descripcion" label="Descripción (opcional)" errores={field.state.meta.errors}>
            <textarea
              id="descripcion"
              rows={3}
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
