import { api } from "@/shared/api/axiosInstance";
import type { Categoria, CategoriaCreate, CategoriaUpdate } from "../types/categoria.types";

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}

export async function crearCategoria(categoria: CategoriaCreate): Promise<Categoria> {
  const { data } = await api.post<Categoria>("/categorias", categoria);
  return data;
}

export async function actualizarCategoria(id: number, cambios: CategoriaUpdate): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, cambios);
  return data;
}

// 204 sin cuerpo
export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
