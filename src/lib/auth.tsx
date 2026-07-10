"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { mockAdmins, mockEmpresas, mockColaboradores, type Admin, type Empresa, type Colaborador } from "./db";

export type UserRole = "admin" | "ceo" | "colaborador";

export interface AuthUser {
  role: UserRole;
  nome: string;
  email?: string;
  empresaNome?: string;
  empresaId?: string;
  colaborador?: Colaborador;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<boolean>;
  loginColaborador: (codigo: string, nif: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("hup_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("hup_user"); }
    }
  }, []);

  const login = useCallback(async (role: UserRole, email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));

    if (role === "admin") {
      const admin = mockAdmins.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.pass === password);
      if (!admin) return false;
      const u: AuthUser = { role: "admin", nome: admin.nome, email: admin.email };
      setUser(u);
      localStorage.setItem("hup_user", JSON.stringify(u));
      return true;
    }

    if (role === "ceo") {
      const empresa = mockEmpresas.find((e) => e.ceo.email.toLowerCase() === email.toLowerCase() && e.ceo.pass === password);
      if (!empresa) return false;
      const u: AuthUser = { role: "ceo", nome: empresa.ceo.nome, email: empresa.ceo.email, empresaNome: empresa.nome, empresaId: empresa.id };
      setUser(u);
      localStorage.setItem("hup_user", JSON.stringify(u));
      return true;
    }

    return false;
  }, []);

  const loginColaborador = useCallback(async (codigo: string, nif: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    const colab = mockColaboradores.find((c) => c.nif === nif);
    if (!colab) return false;
    const empresa = mockEmpresas.find((e) => e.id === colab.empresa_id);
    const u: AuthUser = {
      role: "colaborador",
      nome: colab.nome,
      email: colab.email,
      empresaNome: empresa?.nome,
      empresaId: empresa?.id,
      colaborador: colab,
    };
    setUser(u);
    localStorage.setItem("hup_user", JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("hup_user");
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginColaborador, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
