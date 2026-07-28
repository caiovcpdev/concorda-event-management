import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStorage, unwrap } from "./api";
import type { ApiResponse, JwtClaims, LoginResponse, Perfil } from "@/types/api";

interface AuthUser {
  id?: string;
  email?: string;
  role?: Perfil | Perfil[];
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: Perfil | Perfil[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json))) as JwtClaims;
  } catch {
    return null;
  }
}

function claimsToUser(c: JwtClaims | null): AuthUser | null {
  if (!c) return null;
  const nameid =
    (c["nameid"] as string) ||
    (c["nameidentifier"] as string) ||
    (c["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] as string);
  const email =
    (c["email"] as string) ||
    (c["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string);
  const role =
    (c["role"] as Perfil | Perfil[]) ||
    (c["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as Perfil | Perfil[]);
  return { id: nameid, email, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [user, setUser] = useState<AuthUser | null>(() => claimsToUser(decodeJwt(tokenStorage.get() ?? "")));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const exp = tokenStorage.expiracao();
    if (exp && new Date(exp).getTime() < Date.now()) {
      tokenStorage.clear();
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const data = await unwrap<LoginResponse>(
        api.post<ApiResponse<LoginResponse>>("/auth/login", { email, senha }),
      );
      tokenStorage.set(data.token, data.expiracao);
      setToken(data.token);
      setUser(claimsToUser(decodeJwt(data.token)));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: Perfil | Perfil[]) => {
    if (!user?.role) return false;
    const need = Array.isArray(role) ? role : [role];
    const have = Array.isArray(user.role) ? user.role : [user.role];
    return need.some((r) => have.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, loading, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
