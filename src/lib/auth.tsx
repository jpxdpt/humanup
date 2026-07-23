"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "ceo" | "gestor" | "colaborador";

export interface AuthUser {
  role: UserRole;
  nome: string;
  email?: string;
  empresaNome?: string;
  empresaId?: string;
  envioId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<boolean>;
  loginColaborador: (codigo: string, nif: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (role: UserRole, email: string, password: string): Promise<boolean> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, email, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setUser(data);
    return true;
  }, []);

  const loginColaborador = useCallback(async (codigo: string, nif: string): Promise<boolean> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "colaborador", codigo, nif }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setUser(data);
    return true;
  }, []);

  const logout = useCallback(() => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      setUser(null);
      router.push("/");
    });
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, loginColaborador, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
