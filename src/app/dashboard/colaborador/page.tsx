"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { DashboardLayout, Panel } from "@/components/dashboard";

export default function ColaboradorDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "colaborador") router.push("/login");
  }, [isAuthenticated, user, router, loading]);

  if (loading || !isAuthenticated || user?.role !== "colaborador") return null;

  const perguntas = [
    { id: "q1", texto: "Sinto-me motivado(a) no meu trabalho atual.", tipo: "escala" },
    { id: "q2", texto: "Recomendaria a minha empresa como um bom local para trabalhar.", tipo: "nps" },
    { id: "q3", texto: "A minha carga de trabalho é adequada.", tipo: "escala" },
    { id: "q4", texto: "Sinto que sou valorizado(a) pela liderança.", tipo: "escala" },
    { id: "q5", texto: "Como descreveria o ambiente de trabalho na sua equipa?", tipo: "texto" },
  ];

  const totalPerguntas = perguntas.length;
  const progresso = Object.keys(respostas).length;

  function responder(id: string, valor: string) {
    setRespostas((prev) => ({ ...prev, [id]: valor }));
  }

  async function submeter() {
    alert("✓ Questionário submetido com sucesso! As suas respostas são anónimas.");
    router.push("/");
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
                      className={`w-9 h-9 rounded-lg font-label-caps text-label-caps transition-all cursor-pointer ${
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
                      className={`w-8 h-8 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
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
                  className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
                  rows={3}
                  placeholder="Partilhe a sua opinião (opcional)..."
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={submeter}
          disabled={progresso < totalPerguntas}
          className="mt-8 w-full bg-primary text-on-primary font-button text-button rounded-lg px-6 py-3.5 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {progresso < totalPerguntas ? `Responda todas as perguntas (${progresso}/${totalPerguntas})` : "✓ Submeter Questionário"}
        </button>
      </div>
    </DashboardLayout>
  );
}
