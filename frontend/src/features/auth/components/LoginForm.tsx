import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import type { LoginData } from "../types/auth.types";

interface LoginFormProps {
  onSubmit: (datos: LoginData) => void;
  enviando: boolean;
  // Mensaje del backend: credenciales incorrectas o cuenta desactivada
  error: string | null;
}

const requerido =
  (mensaje: string) =>
  ({ value }: { value: string }) =>
    value.trim() ? undefined : mensaje;

export function LoginForm({ onSubmit, enviando, error }: LoginFormProps) {
  const form = useForm({
    defaultValues: { username: "", password: "" } satisfies LoginData,
    onSubmit: ({ value }) => onSubmit({ username: value.username.trim(), password: value.password }),
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

      <form.Field name="username" validators={{ onChange: requerido("El usuario es obligatorio") }}>
        {(field) => (
          <Input
            id="username"
            label="Usuario"
            autoComplete="username"
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Field name="password" validators={{ onChange: requerido("La contraseña es obligatoria") }}>
        {(field) => (
          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit || enviando} className="mt-2">
            {enviando ? "Ingresando..." : "Ingresar"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
