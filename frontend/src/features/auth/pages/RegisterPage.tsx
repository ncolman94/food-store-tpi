import { Link, Navigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { Card } from "@/shared/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { RegisterForm } from "../components/RegisterForm";
import { useDestino } from "../hooks/useDestino";
import { useRegistro } from "../hooks/useRegistro";

export function RegisterPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const registro = useRegistro();
  const { state, destinoPara } = useDestino();

  if (usuario) return <Navigate to={destinoPara(usuario)} replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-500">Registrate para hacer pedidos y seguir su estado.</p>
        <RegisterForm
          onSubmit={(datos) => registro.mutate(datos)}
          enviando={registro.isPending}
          error={registro.error ? handleApiError(registro.error) : null}
        />
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" state={state} className="font-semibold text-brand hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
