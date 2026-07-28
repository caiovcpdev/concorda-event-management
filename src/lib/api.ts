import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/types/api";

const TOKEN_KEY = "concordaai_token";
const EXPIRACAO_KEY = "concordaai_expiracao";

export const tokenStorage = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string, expiracao?: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (expiracao) localStorage.setItem(EXPIRACAO_KEY, expiracao);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRACAO_KEY);
  },
  expiracao: () => (typeof window === "undefined" ? null : localStorage.getItem(EXPIRACAO_KEY)),
};

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://localhost:7138";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function extractError(err: unknown): string {
  const ax = err as AxiosError<ApiResponse<unknown>>;
  const msgs = ax.response?.data?.errors;
  if (msgs && msgs.length) return msgs.join(", ");
  return ax.message || "Erro inesperado";
}

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  if (!res.data.success || res.data.data === null || res.data.data === undefined) {
    throw new Error((res.data.errors ?? ["Erro na requisição"]).join(", "));
  }
  return res.data.data;
}
