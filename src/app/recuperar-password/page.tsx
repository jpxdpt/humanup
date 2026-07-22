"use client";

import { useState } from "react";
import Link from "next/link";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "ceo">("admin");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        setErro("Ocorreu um erro. Tente novamente.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setErro("Erro de rede. Verifique a sua ligação.");
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
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">lock_reset</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Recuperar Password</h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Insira o seu email para receber instruções de recuperação.
            </p>
          </div>

          {sent ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl">check</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface mb-6">
                Se o email existir na nossa base de dados, receberá instruções para recuperar a password.
              </p>
              <Link
                href="/login"
                className="inline-block bg-primary text-on-primary font-button text-button rounded-lg px-5 py-3 transition-all hover:opacity-90"
              >
                ← Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
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
                <label className="font-label-caps text-label-caps text-secondary mb-1.5 block">Tipo de conta</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setRole("admin")}
                    className={`flex-1 px-4 py-2.5 rounded-lg border font-button text-button transition-all cursor-pointer ${
                      role === "admin"
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container-lowest text-secondary border-outline-variant hover:border-primary"
                    }`}>
                    Administrador
                  </button>
                  <button type="button" onClick={() => setRole("ceo")}
                    className={`flex-1 px-4 py-2.5 rounded-lg border font-button text-button transition-all cursor-pointer ${
                      role === "ceo"
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container-lowest text-secondary border-outline-variant hover:border-primary"
                    }`}>
                    CEO / Empresa
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-button text-button rounded-lg px-5 py-3 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? "⏳ A enviar..." : "Enviar instruções →"}
              </button>

              <Link href="/login"
                className="block text-center mt-4 font-body-sm text-body-sm text-secondary hover:text-primary transition-colors">
                ← Voltar ao login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
