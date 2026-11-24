// CategoriaRead
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// CategoriaCreate; CategoriaUpdate acepta los mismos campos, todos opcionales
export interface CategoriaCreate {
  nombre: string;
  descripcion: string;
}

export type CategoriaUpdate = Partial<CategoriaCreate>;
