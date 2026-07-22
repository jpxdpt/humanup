"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout, KpiCard, Panel, Badge, EmptyState } from "@/components/dashboard";

export default function CeoDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-secondary font-body-md">A carregar...</div>}>
      <CeoDashboardContent />
    </Suspense>
  );
}

function CeoDashboardContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch {
      // silently fail
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "ceo") router.push("/login");
    else fetchData();
  }, [isAuthenticated, user, router, loading, fetchData]);

  if (loading || !isAuthenticated || user?.role !== "ceo") return null;

  const empresaNome = user?.empresaNome || "";
  const colaboradores = dashboardData?.colaboradores || [];
  const faturas = dashboardData?.faturas || [];
  const totalFaturado = faturas.filter((f: any) => f.estado === "pago").reduce((acc: number, f: any) => acc + Number(f.valor), 0);
  const porPagar = faturas.filter((f: any) => f.estado === "pendente" || f.estado === "em_atraso").reduce((acc: number, f: any) => acc + Number(f.valor), 0);

  return (
    <DashboardLayout>
      {tab === "dashboard" && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Área de Cliente</h2>
              <p className="font-body-sm text-body-sm text-secondary">{empresaNome}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-card-gap mb-margin-md">
            <KpiCard label="Participantes" value={String(colaboradores.length)} sub="Colaboradores na plataforma" icon="badge" />
            <KpiCard label="Índice de Felicidade" value="7.4/10" sub="↑ +0.3 este mês" icon="favorite" highlight="primary" />
            <KpiCard label="Engajamento" value="76%" sub="↑ +5% vs trimestre anterior" icon="trending_up" />
            <KpiCard label="Faturas" value={porPagar > 0 ? `€ ${porPagar}` : "Em dia"} sub={porPagar > 0 ? "Por pagar" : "Tudo regularizado"} icon="receipt_long" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-card-gap">
            <div className="xl:col-span-8 flex flex-col gap-card-gap">
              <Panel title="Roda da Vida Organizacional">
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-64 h-64">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#dbe4ed" strokeWidth="2" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="#dbe4ed" strokeWidth="2" />
                      <circle cx="50" cy="50" r="15" fill="none" stroke="#dbe4ed" strokeWidth="2" />
                      <path d="M50 5 A45 45 0 0 1 85.4 28.6 L50 50Z" fill="rgba(132,84,0,0.15)" stroke="#845400" strokeWidth="1.5" />
                      <path d="M50 50 L85.4 28.6 A45 45 0 0 1 95 50 L50 50Z" fill="rgba(132,84,0,0.3)" stroke="#845400" strokeWidth="1.5" />
                      <path d="M50 50 L95 50 A45 45 0 0 1 75.4 78.6 L50 50Z" fill="rgba(132,84,0,0.1)" stroke="#845400" strokeWidth="1.5" />
                      <text x="50" y="22" textAnchor="middle" fontSize="5" fill="#141d23" fontFamily="Inter">Motivação</text>
                      <text x="78" y="45" textAnchor="middle" fontSize="5" fill="#141d23" fontFamily="Inter">Satisfação</text>
                      <text x="70" y="72" textAnchor="middle" fontSize="5" fill="#141d23" fontFamily="Inter">Bem-Estar</text>
                      <text x="50" y="48" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#845400" fontFamily="Playfair Display">7.4</text>
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 font-body-sm text-body-sm text-secondary">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Motivação: 7.8</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Satisfação: 7.2</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Bem-Estar: 7.0</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Liderança: 7.5</div>
                </div>
              </Panel>

              <Panel title="Recomendações HumanUp">
                <div className="space-y-3">
                  <div className="border-l-3 border-primary bg-primary-fixed/30 rounded-r-lg p-3">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface mb-0.5">💡 Reforçar comunicação interna</p>
                    <p className="text-[13px] text-secondary font-light">A dimensão "Liderança" apresenta oportunidade de melhoria. Sugerimos sessões de feedback 360°.</p>
                  </div>
                  <div className="border-l-3 border-primary bg-primary-fixed/30 rounded-r-lg p-3">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface mb-0.5">💡 Programa de reconhecimento</p>
                    <p className="text-[13px] text-secondary font-light">Implementar um sistema de peer recognition para aumentar a motivação da equipa comercial.</p>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-4">
              <Panel title="Acções Rápidas">
                <div className="flex flex-col gap-3">
                  <QuickAction icon="assignment" label="Ver resultados" onClick={() => alert("Funcionalidade em desenvolvimento")} />
                  <QuickAction icon="description" label="Descarregar relatório" onClick={() => alert("Funcionalidade em desenvolvimento")} />
                  <QuickAction icon="forum" label="Contactar HumanUp" onClick={() => alert("Funcionalidade em desenvolvimento")} />
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}

      {tab === "equipa" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Equipa</h2>
            <p className="font-body-sm text-body-sm text-secondary">{colaboradores.length} colaboradores</p>
          </div>
          <Panel title="Colaboradores">
            {colaboradores.length === 0 ? (
              <EmptyState icon="groups" title="Nenhum colaborador encontrado." />
            ) : (
              <div className="space-y-3">
                {colaboradores.map((col: any) => (
                  <div key={col.id} className="flex items-center justify-between p-4 rounded-xl border border-surface-variant">
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">{col.nome}</div>
                      <div className="font-body-sm text-body-sm text-secondary mt-0.5">{col.cargo} · {col.departamento}</div>
                    </div>
                    <Badge variant={(col.estado || "ativo") as "ativo" | "inativo"}>{col.estado || "ativo"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {tab === "faturas" && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Faturas</h2>
              <p className="font-body-sm text-body-sm text-secondary">Total pago: € {totalFaturado}</p>
            </div>
          </div>
          <Panel title="Histórico">
            {faturas.length === 0 ? (
              <EmptyState icon="receipt_long" title="Nenhuma fatura disponível." />
            ) : (
              <div className="space-y-3">
                {faturas.map((fat: any) => (
                  <div key={fat.id} className="flex items-center justify-between p-4 rounded-xl border border-surface-variant">
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">{fat.referencia}</div>
                      <div className="font-body-sm text-body-sm text-secondary mt-0.5">{fat.descricao}</div>
                      <div className="font-body-sm text-body-sm text-tertiary">Vencimento: {fat.vencimento ? fat.vencimento.toString().split("T")[0] : ""}</div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="font-headline-md text-headline-md font-semibold text-primary">€ {Number(fat.valor).toFixed(2)}</div>
                      <Badge variant={fat.estado as "pago" | "pendente" | "em_atraso"}>{fat.estado}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {tab === "recursos" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Recursos</h2>
            <p className="font-body-sm text-body-sm text-secondary">Materiais de apoio</p>
          </div>
          <Panel title="Documentos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { titulo: "Guia de Bem-Estar", tipo: "PDF", cor: "bg-[#fee2e2] text-[#991b1b]" },
                { titulo: "Template de Feedback", tipo: "XLSX", cor: "bg-[#dcfce7] text-[#166534]" },
                { titulo: "Apresentação Resultados", tipo: "PPTX", cor: "bg-[#dbeafe] text-[#1e40af]" },
              ].map((r, i) => (
                <div key={i} onClick={() => alert("Funcionalidade em desenvolvimento")} className="flex items-center justify-between p-4 rounded-xl border border-surface-variant hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.cor}`}>{r.tipo}</span>
                    <span className="font-body-md text-body-md text-on-surface">{r.titulo}</span>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[18px]">download</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </DashboardLayout>
  );
}

function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4 rounded-lg border border-surface-variant hover:border-primary hover:bg-surface-bright transition-all text-left group cursor-pointer">
      <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <span className="font-button text-button text-on-surface">{label}</span>
    </button>
  );
}
