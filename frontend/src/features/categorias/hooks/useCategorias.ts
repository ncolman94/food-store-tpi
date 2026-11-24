import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from "../api/categorias";
import type { Categoria, CategoriaUpdate } from "../types/categoria.types";

export const categoriasKey = ["categorias"] as const;

// Lectura publica: la usan el filtro del catalogo y el formulario de productos
export function useCategorias() {
  return useQuery({ queryKey: categoriasKey, queryFn: getCategorias });
}

// Alta, edicion y baja del panel. Despues de cada una se invalida el listado
export function useCategoriaMutations() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const invalidar = () => queryClient.invalidateQueries({ queryKey: categoriasKey });

  const crear = useMutation({
    mutationFn: crearCategoria,
    onSuccess: (categoria) => {
      invalidar();
      showNotification(`Categoría «${categoria.nombre}» creada`);
    },
  });

  const editar = useMutation({
    mutationFn: ({ id, cambios }: { id: number; cambios: CategoriaUpdate }) => actualizarCategoria(id, cambios),
    onSuccess: (categoria) => {
      invalidar();
      // Los productos muestran el nombre de su categoria
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification(`Categoría «${categoria.nombre}» actualizada`);
    },
  });

  const eliminar = useMutation({
    mutationFn: (categoria: Categoria) => eliminarCategoria(categoria.id),
    onSuccess: (_, categoria) => {
      invalidar();
      showNotification(`Categoría «${categoria.nombre}» dada de baja`);
    },
  });

  return { crear, editar, eliminar };
}
