export type Rol = "user" | "admin";

// UserPublic del backend: nunca trae hashed_password
export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// UserCreate
export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface MensajeRespuesta {
  message: string;
}
