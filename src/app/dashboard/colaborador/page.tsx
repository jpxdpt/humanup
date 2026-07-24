"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { DashboardLayout, EmptyState } from "@/components/dashboard";
import { AppleButton } from "@/components/ui/AppleButton";
import { animateEnter, slideUp, spring } from "@/lib/animations";

interface Pergunta {
  id: string;
  texto: string;
  tipo: string;
}

interface Questionario {
  perguntas: Pergunta[];
}

interface EnvioColaborador {
  id: string;
  quest_nome: string;
  questionario: Questionario;
}

export default function ColaboradorDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"" | "submitting" | "success" | "error">("");
  const [envio, setEnvio] = useState<EnvioColaborador | null | "loading">("loading");
  const [toast, setToast] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "colaborador") { router.push("/login"); return; }
    if (!user?.envioId) { setEnvio(null); return; }
    fetch(`/api/respostas?envio_id=${user.envioId}`)
      .then((r) => r.json())
      .then((data) => setEnvio(data.envio || null))
      .catch(() => setEnvio(null));
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    if (envio && envio !== "loading" && formRef.current) {
      animateEnter(formRef.current, slideUp, spring.gentle);
    }
  }, [envio]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading || !isAuthenticated || user?.role !== "colaborador") return null;

  if (envio === "loading") {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto flex items-center justify-center py-24">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!envio) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-12">
          <EmptyState icon="assignment_late" title="Nenhum questionário disponível" description="De momento não tem nenhum questionário para responder." />
        </div>
      </DashboardLayout>
    );
  }

  const perguntas = envio.questionario?.perguntas?.filter((p: Pergunta) => p.texto.trim()) || [];
  const totalPerguntas = perguntas.length;
  const progresso = Object.keys(respostas).length;
  const jaSubmeteu = status === "success";

  function responder(id: string, valor: string) {
    if (jaSubmeteu) return;
    setRespostas((prev) => ({ ...prev, [id]: valor }));
  }

  async function submeter() {
    setStatus("submitting");
    try {
      const res = await fetch("/api/respostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas }),
      });
      if (!res.ok) throw new Error("Erro ao submeter");
      setStatus("success");
      setToast("Questionário submetido com sucesso!");
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setStatus("error");
      setToast("Erro ao submeter o questionário.");
    }
  }

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface-container-lowest border border-outline-variant shadow-xl rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface animate-in slide-in-from-right">
          {toast}
        </div>
      )}

      <div ref={formRef} className="max-w-3xl mx-auto">
        <div className="mb-margin-md">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">assignment</span>
            </div>
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{envio.quest_nome || "Inquérito"}</h2>
              <p className="font-body-sm text-body-sm text-secondary">
                As suas respostas são completamente anónimas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-margin-md bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
          <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(progresso / totalPerguntas) * 100}%` }} />
          </div>
          <span className="font-body-sm text-body-sm text-secondary whitespace-nowrap">
            <span className="font-medium text-on-surface">{progresso}</span>/{totalPerguntas}
          </span>
        </div>

        <div className="space-y-4 mb-margin-md">
          {perguntas.map((pq, i) => (
            <div key={pq.id} className={`bg-surface-container-lowest rounded-xl border p-6 transition-all ${respostas[pq.id] ? "border-primary" : "border-outline-variant"}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className="font-label-caps text-label-caps text-primary bg-primary-fixed/40 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="font-body-md text-body-md font-medium text-on-surface">{pq.texto}</p>
              </div>

              {pq.tipo === "escala" && (
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => responder(pq.id, String(n))}
                      disabled={jaSubmeteu}
                      className={`w-10 h-10 rounded-lg font-label-caps text-label-caps transition-all cursor-pointer disabled:cursor-not-allowed ${
                        respostas[pq.id] === String(n)
                          ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
                          : "bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary hover:bg-surface-bright"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {pq.tipo === "nps" && (
                <div className="flex gap-1.5 flex-wrap">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => responder(pq.id, String(n))}
                      disabled={jaSubmeteu}
                      className={`w-9 h-9 rounded-lg text-[10px] font-semibold transition-all cursor-pointer disabled:cursor-not-allowed ${
                        respostas[pq.id] === String(n)
                          ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
                          : "bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary hover:bg-surface-bright"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {pq.tipo === "texto" && (
                <textarea
                  value={respostas[pq.id] || ""}
                  onChange={(e) => responder(pq.id, e.target.value)}
                  disabled={jaSubmeteu}
                  className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container resize-none disabled:opacity-50"
                  rows={3}
                  placeholder="Partilhe a sua opinião (opcional)..."
                />
              )}
            </div>
          ))}
        </div>

        {status === "success" && (
          <div className="mb-margin-md p-4 bg-[#dcfce7] text-[#166534] rounded-xl font-body-md text-body-md text-center border border-[#bbf7d0]">
            Questionário submetido com sucesso! As suas respostas são anónimas.
          </div>
        )}
        {status === "error" && (
          <div className="mb-margin-md p-4 bg-[#fee2e2] text-[#991b1b] rounded-xl font-body-md text-body-md text-center border border-[#fecaca]">
            Erro ao submeter o questionário. Tente novamente.
          </div>
        )}

        <AppleButton
          onClick={submeter}
          disabled={progresso < totalPerguntas || status === "submitting" || jaSubmeteu}
          size="lg"
          icon={jaSubmeteu ? "check_circle" : status === "submitting" ? "sync" : "send"}
          className="w-full"
        >
          {jaSubmeteu ? "Submetido" : status === "submitting" ? "A submeter..." : progresso < totalPerguntas ? `Responda todas as perguntas (${progresso}/${totalPerguntas})` : "Submeter Questionário"}
        </AppleButton>
      </div>
    </DashboardLayout>
  );
}