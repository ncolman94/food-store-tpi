import type { Categoria } from "@/features/categorias";

// ProductoRead
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
  activo: boolean;
  categoria: Categoria;
}

// ProductoCreate; ProductoUpdate acepta los mismos campos, todos opcionales
export interface ProductoCreate {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export type ProductoUpdate = Partial<ProductoCreate>;

export interface ProductoStockUpdate {
  stock?: number;
  disponible?: boolean;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

// Query de GET /productos
export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
