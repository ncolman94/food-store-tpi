import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

// Navbar arriba y la pagina de la ruta abajo
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Food Store · Programación IV · UTN
      </footer>
    </div>
  );
}
