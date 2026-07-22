"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (password.length < 6) {
      setErro("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErro("As passwords não coincidem.");
      return;
    }

    if (!token) {
      setErro("Token de recuperação inválido.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Ocorreu um erro.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setErro("Erro de rede. Verifique a sua ligação.");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-2xl">check</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Password redefinida</h2>
        <p className="font-body-md text-body-md text-secondary mb-6">
          A sua password foi alterada com sucesso.
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary text-on-primary font-button text-button rounded-lg px-5 py-3 transition-all hover:opacity-90"
        >
          Ir para o login →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Redefinir Password</h2>
      <p className="font-body-sm text-body-sm text-secondary mb-6">
        Escolha uma nova password para a sua conta.
      </p>

      {erro && (
        <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3 mb-4 font-body-sm text-body-sm">
          {erro}
        </div>
      )}

      <div className="mb-4">
        <label className="font-label-caps text-label-caps text-secondary mb-1.5 block" htmlFor="password">Nova password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
          placeholder="••••••••" required />
      </div>

      <div className="mb-6">
        <label className="font-label-caps text-label-caps text-secondary mb-1.5 block" htmlFor="confirmPassword">Confirmar nova password</label>
        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
          placeholder="••••••••" required />
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-primary text-on-primary font-button text-button rounded-lg px-5 py-3 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
        {loading ? "⏳ A redefinir..." : "Redefinir password →"}
      </button>

      <Link href="/login"
        className="block text-center mt-4 font-body-sm text-body-sm text-secondary hover:text-primary transition-colors">
        ← Voltar ao login
      </Link>
    </form>
  );
}

export default function RedefinirPasswordPage() {
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
              <span className="material-symbols-outlined text-3xl">lock_open</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Redefinir Password</h1>
          </div>

          <Suspense fallback={
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm text-center">
              <p className="font-body-md text-body-md text-secondary">A carregar...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
