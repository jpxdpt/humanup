"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";

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

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "colaborador") { router.push("/login"); return; }
    if (!user?.envioId) { setEnvio(null); return; }
    fetch(`/api/respostas?envio_id=${user.envioId}`)
      .then((r) => r.json())
      .then((data) => setEnvio(data.envio || null))
      .catch(() => setEnvio(null));
  }, [isAuthenticated, user, router, loading]);

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
        <div className="max-w-3xl mx-auto text-center py-24">
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-4">assignment_late</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Nenhum questionário disponível</h2>
          <p className="font-body-md text-body-md text-secondary">De momento não tem nenhum questionário para responder.</p>
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
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Inquérito de Bem-Estar</h2>
          <p className="font-body-sm text-body-sm text-secondary">
            As suas respostas são completamente anónimas. Obrigado pela participação.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
          <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(progresso / totalPerguntas) * 100}%` }} />
          </div>
          <span className="font-body-sm text-body-sm text-secondary whitespace-nowrap">{progresso}/{totalPerguntas}</span>
        </div>

        <div className="space-y-4">
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
                      className={`w-9 h-9 rounded-lg font-label-caps text-label-caps transition-all cursor-pointer disabled:cursor-not-allowed ${
                        respostas[pq.id] === String(n)
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary"
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
                      className={`w-8 h-8 rounded-lg text-[10px] font-semibold transition-all cursor-pointer disabled:cursor-not-allowed ${
                        respostas[pq.id] === String(n)
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary"
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
          <div className="mt-4 p-4 bg-[#dcfce7] text-[#166534] rounded-lg font-body-md text-body-md text-center">
            ✓ Questionário submetido com sucesso! As suas respostas são anónimas. A redirecionar...
          </div>
        )}
        {status === "error" && (
          <div className="mt-4 p-4 bg-[#fee2e2] text-[#991b1b] rounded-lg font-body-md text-body-md text-center">
            Erro ao submeter o questionário. Tente novamente.
          </div>
        )}

        <button
          onClick={submeter}
          disabled={progresso < totalPerguntas || status === "submitting" || jaSubmeteu}
          className="mt-8 w-full bg-primary text-on-primary font-button text-button rounded-lg px-6 py-3.5 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {jaSubmeteu ? "✓ Submetido" : status === "submitting" ? "A submeter..." : progresso < totalPerguntas ? `Responda todas as perguntas (${progresso}/${totalPerguntas})` : "Submeter Questionário"}
        </button>
      </div>
    </DashboardLayout>
  );
}
