import { useEffect } from "react";
import { AppRouter } from "@/routes/AppRouter";
import { Toast } from "@/shared/components/Toast";
import { useAuthStore } from "@/store/authStore";

function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  // Unica llamada en un useEffect: GET /auth/me con la cookie que manda el navegador
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
