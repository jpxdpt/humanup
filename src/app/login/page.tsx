"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

type LoginStep = "select" | "admin" | "ceo" | "colaborador";

const ROLES: { key: LoginStep; title: string; desc: string; icon: string }[] = [
  { key: "admin", title: "Administrador", desc: "Gestão completa da plataforma, clientes e backoffice HumanUp", icon: "admin_panel_settings" },
  { key: "ceo", title: "CEO / Empresa", desc: "Área de cliente com dashboard, relatórios, faturas e comunicação", icon: "business" },
  { key: "colaborador", title: "Colaborador", desc: "Acesso com código de empresa + NIF para preencher inquéritos", icon: "assignment_ind" },
];

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nif, setNif] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginColaborador } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      if (step === "colaborador") {
        const ok = await loginColaborador(codigo, nif);
        if (!ok) { setErro("Código ou NIF inválidos."); setLoading(false); return; }
        router.push("/dashboard/colaborador");
      } else {
        const role = step === "admin" ? "admin" : "ceo";
        const ok = await login(role, email, password);
        if (!ok) { setErro("Credenciais inválidas."); setLoading(false); return; }
        router.push(role === "admin" ? "/dashboard/admin" : "/dashboard/ceo");
      }
    } catch {
      setErro("Erro ao fazer login.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant h-16 flex items-center px-6 md:px-12 gap-6">
        <Link href="/" className="flex items-center flex-shrink-0 gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-base">H</div>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">HumanUp</span>
        </Link>
        <div className="flex-1" />
        <Link href="/" className="font-button text-button text-secondary hover:text-primary transition-colors">
          ← Voltar ao site
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-12">
        <div className="w-full max-w-[860px]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Iniciar Sessão</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">Selecione o tipo de acesso para continuar.</p>
          </div>

          {step === "select" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setStep(r.key)}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 text-left cursor-pointer transition-all hover:border-primary hover:shadow-md group"
                >
                  <div className="w-[52px] h-[52px] rounded-xl bg-surface-container flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-2xl">{r.icon}</span>
                  </div>
                  <h3 className="font-label-caps text-label-caps text-on-surface font-semibold mb-1">{r.title}</h3>
                  <p className="font-body-sm text-body-sm text-secondary leading-relaxed">{r.desc}</p>
                </button>
              ))}
            </div>
          )}

          {(step === "admin" || step === "ceo") && (
            <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6">
                {step === "admin" ? "Acesso Administrador" : "Área de Cliente — CEO"}
              </h3>

              {erro && (
                <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-4 font-body-sm text-body-sm">
                  {erro}
                </div>
              )}

              <div className="mb-4">
                <label className="font-label-caps text-label-caps text-secondary mb-1.5 block" htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="email@empresa.pt" required />
              </div>

              <div className="mb-6">
                <label className="font-label-caps text-label-caps text-secondary mb-1.5 block" htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="••••••••" required />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-button text-button rounded-lg px-5 py-3 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? "⏳ Entrar..." : "Entrar →"}
              </button>

              <button type="button" onClick={() => setStep("select")}
                className="block mx-auto mt-4 font-body-sm text-body-sm text-secondary hover:text-primary transition-colors cursor-pointer">
                ← Escolher outro tipo de acesso
              </button>
            </form>
          )}

          {step === "colaborador" && (
            <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Acesso Colaborador</h3>
              <p className="font-body-sm text-body-sm text-secondary mb-4">
                O código de empresa e as instruções são enviados por email. A sua senha de acesso é o seu NIF.
              </p>

              <div className="bg-primary-fixed/40 border border-primary/20 text-on-primary-container text-sm rounded-lg px-4 py-3 mb-5 font-body-sm text-body-sm">
                As suas respostas são completamente anónimas.
              </div>

              {erro && (
                <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-4 font-body-sm text-body-sm">
                  {erro}
                </div>
              )}

              <div className="mb-4">
                <label className="font-label-caps text-label-caps text-secondary mb-1.5 block" htmlFor="codigo">Código de acesso</label>
                <input id="codigo" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="Ex: PULSE-2026-Q1" required />
              </div>

              <div className="mb-6">
                <label className="font-label-caps text-label-caps text-secondary mb-1.5 block" htmlFor="nif">Senha (NIF)</label>
                <input id="nif" type="password" value={nif} onChange={(e) => setNif(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="123456789" required />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-button text-button rounded-lg px-5 py-3 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? "⏳ A verificar..." : "Aceder ao Inquérito →"}
              </button>

              <button type="button" onClick={() => setStep("select")}
                className="block mx-auto mt-4 font-body-sm text-body-sm text-secondary hover:text-primary transition-colors cursor-pointer">
                ← Escolher outro tipo de acesso
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
