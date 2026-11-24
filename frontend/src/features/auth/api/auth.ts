import { api } from "@/shared/api/axiosInstance";
import type { LoginData, MensajeRespuesta, UserCreate, Usuario } from "../types/auth.types";

// Formulario OAuth2: el servidor responde con la cookie HttpOnly y el cuerpo no trae el token
export async function login({ username, password }: LoginData): Promise<MensajeRespuesta> {
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post<MensajeRespuesta>("/auth/token", form);
  return data;
}

export async function logout(): Promise<MensajeRespuesta> {
  const { data } = await api.post<MensajeRespuesta>("/auth/logout");
  return data;
}

export async function getMe(): Promise<Usuario> {
  const { data } = await api.get<Usuario>("/auth/me");
  return data;
}

export async function registrar(usuario: UserCreate): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/auth/register", usuario);
  return data;
}
