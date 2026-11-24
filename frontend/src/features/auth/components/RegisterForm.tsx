import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import type { UserCreate } from "../types/auth.types";

interface RegisterFormProps {
  onSubmit: (datos: UserCreate) => void;
  enviando: boolean;
  // Por ejemplo el 409 de usuario o email repetido
  error: string | null;
}

type Valor = { value: string };

// Las mismas reglas que UserCreate en el backend
const validarUsername = ({ value }: Valor) => {
  const v = value.trim();
  if (v.length < 3) return "El usuario debe tener al menos 3 caracteres";
  if (v.length > 50) return "El usuario admite hasta 50 caracteres";
  if (!/^[A-Za-z0-9_.-]+$/.test(v)) return "Solo letras, números, punto, guion y guion bajo";
  return undefined;
};

const validarNombre = ({ value }: Valor) => {
  if (!value.trim()) return "El nombre es obligatorio";
  if (value.trim().length > 120) return "El nombre admite hasta 120 caracteres";
  return undefined;
};

const validarEmail = ({ value }: Valor) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "Ingresá un email válido";

// bcrypt usa hasta 72 bytes
const validarPassword = ({ value }: Valor) => {
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (new TextEncoder().encode(value).length > 72) return "La contraseña es demasiado larga";
  return undefined;
};

export function RegisterForm({ onSubmit, enviando, error }: RegisterFormProps) {
  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmar: "" },
    onSubmit: ({ value }) =>
      onSubmit({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
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

      <form.Field name="username" validators={{ onChange: validarUsername }}>
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
            ayuda="Con este nombre vas a iniciar sesión."
          />
        )}
      </form.Field>

      <form.Field name="full_name" validators={{ onChange: validarNombre }}>
        {(field) => (
          <Input
            id="full_name"
            label="Nombre y apellido"
            autoComplete="name"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Field name="email" validators={{ onChange: validarEmail }}>
        {(field) => (
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
          />
        )}
      </form.Field>

      <form.Field name="password" validators={{ onChange: validarPassword }}>
        {(field) => (
          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.errors}
            ayuda="Mínimo 8 caracteres."
          />
        )}
      </form.Field>

      {/* Se vuelve a validar cuando cambia la clave */}
      <form.Field
        name="confirmar"
        validators={{
          onChangeListenTo: ["password"],
          onChange: ({ value, fieldApi }) =>
            value === fieldApi.form.getFieldValue("password") ? undefined : "Las contraseñas no coinciden",
        }}
      >
        {(field) => (
          <Input
            id="confirmar"
            label="Repetir contraseña"
            type="password"
            autoComplete="new-password"
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
            {enviando ? "Creando la cuenta..." : "Crear cuenta"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
