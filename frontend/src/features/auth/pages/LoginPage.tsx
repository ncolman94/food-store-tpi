import { Link, Navigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { Card } from "@/shared/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { LoginForm } from "../components/LoginForm";
import { useDestino } from "../hooks/useDestino";
import { useLogin } from "../hooks/useLogin";

export function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const login = useLogin();
  const { state, destinoPara } = useDestino();

  // Con la sesion confirmada se vuelve a la pantalla pedida
  if (usuario) return <Navigate to={destinoPara(usuario)} replace />;

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-gray-500">Ingresá con tu usuario para confirmar pedidos.</p>
        <LoginForm
          onSubmit={(datos) => login.mutate(datos)}
          enviando={login.isPending}
          error={login.error ? handleApiError(login.error) : null}
        />
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{" "}
          {/* Se pasa el state para volver a la misma pantalla despues del registro */}
          <Link to="/register" state={state} className="font-semibold text-brand hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
