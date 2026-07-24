"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout, KpiCard, Panel, Badge, EmptyState } from "@/components/dashboard";
import { AppleButton } from "@/components/ui/AppleButton";
import { animateEnter, slideUp, spring } from "@/lib/animations";

interface CeoDashboardClientProps {
  empresaNome: string;
  colaboradores: Array<{
    id: string;
    nome: string;
    cargo: string;
    departamento: string;
    estado: string;
  }>;
  faturas: Array<{
    id: number;
    referencia: string;
    descricao: string;
    valor: string;
    vencimento: string | null;
    estado: "pago" | "pendente" | "em_atraso";
  }>;
  totalFaturado: number;
  porPagar: number;
}

export default function CeoDashboardClient(props: CeoDashboardClientProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-secondary font-body-md">A carregar...</div>}>
      <CeoDashboardContent {...props} />
    </Suspense>
  );
}

function CeoDashboardContent({
  empresaNome,
  colaboradores,
  faturas,
  totalFaturado,
  porPagar,
}: CeoDashboardClientProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<string | null>(null);

  const isCeoOrGestor = user?.role === "ceo" || user?.role === "gestor";

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !isCeoOrGestor) router.push("/login");
  }, [isAuthenticated, user, router, loading, isCeoOrGestor]);

  useEffect(() => {
    if (tab === "dashboard" && dashboardRef.current) {
      animateEnter(dashboardRef.current, slideUp, spring.gentle);
    }
  }, [tab]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading || !isAuthenticated || !isCeoOrGestor) return null;

  function msg(txt: string) {
    setToast(txt);
  }

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface-container-lowest border border-outline-variant shadow-xl rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface animate-in slide-in-from-right">
          {toast}
        </div>
      )}

      <div key={tab} className="apple-tab-enter">
      {tab === "dashboard" && (
        <div ref={dashboardRef}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Área de Cliente</h2>
              <p className="font-body-sm text-body-sm text-secondary">
                {empresaNome} &middot; <span className="text-primary font-medium">{user?.role === "gestor" ? "Gestor" : "CEO"}</span>
              </p>
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
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface mb-0.5">Reforçar comunicação interna</p>
                    <p className="text-[13px] text-secondary font-light">A dimensão &quot;Liderança&quot; apresenta oportunidade de melhoria. Sugerimos sessões de feedback 360°.</p>
                  </div>
                  <div className="border-l-3 border-primary bg-primary-fixed/30 rounded-r-lg p-3">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface mb-0.5">Programa de reconhecimento</p>
                    <p className="text-[13px] text-secondary font-light">Implementar um sistema de peer recognition para aumentar a motivação da equipa comercial.</p>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-4">
              <Panel title="Acções Rápidas">
                <div className="flex flex-col gap-3">
                  <button onClick={() => msg("Funcionalidade em desenvolvimento")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all text-left group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-150">
                      <span className="material-symbols-outlined text-[18px]">assignment</span>
                    </div>
                    <span className="font-button text-button text-on-surface">Ver resultados</span>
                  </button>
                  <button onClick={() => msg("Funcionalidade em desenvolvimento")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all text-left group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-150">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <span className="font-button text-button text-on-surface">Descarregar relatório</span>
                  </button>
                  <button onClick={() => msg("Funcionalidade em desenvolvimento")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all text-left group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-150">
                      <span className="material-symbols-outlined text-[18px]">forum</span>
                    </div>
                    <span className="font-button text-button text-on-surface">Contactar HumanUp</span>
                  </button>
                </div>
              </Panel>
            </div>
          </div>
        </div>
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
              <div className="space-y-2">
                {colaboradores.map((col) => (
                  <div key={col.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </div>
                      <div>
                        <div className="font-body-md text-body-md font-medium text-on-surface">{col.nome}</div>
                        <div className="font-body-sm text-body-sm text-secondary">{col.cargo} &middot; {col.departamento}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={(col.estado || "ativo") as "ativo" | "inativo"}>{col.estado || "ativo"}</Badge>
                    </div>
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
              <p className="font-body-sm text-body-sm text-secondary">Total pago: € {totalFaturado.toFixed(2)}</p>
            </div>
          </div>
          <Panel title="Histórico">
            {faturas.length === 0 ? (
              <EmptyState icon="receipt_long" title="Nenhuma fatura disponível." />
            ) : (
              <div className="space-y-2">
                {faturas.map((fat) => (
                  <div key={fat.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">receipt</span>
                      </div>
                      <div>
                        <div className="font-body-md text-body-md font-medium text-on-surface">{fat.referencia}</div>
                        <div className="font-body-sm text-body-sm text-secondary">{fat.descricao}</div>
                        <div className="font-body-sm text-body-sm text-tertiary">Vencimento: {fat.vencimento ? fat.vencimento.toString().split("T")[0] : ""}</div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="font-headline-sm text-headline-sm font-semibold text-primary">€ {Number(fat.valor).toFixed(2)}</div>
                      <Badge variant={fat.estado}>{fat.estado}</Badge>
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
                <div key={i} onClick={() => msg("Funcionalidade em desenvolvimento")} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <span className={`font-label-caps text-label-caps font-bold px-2 py-0.5 rounded ${r.cor}`}>{r.tipo}</span>
                    <span className="font-body-md text-body-md text-on-surface">{r.titulo}</span>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[18px] group-hover:text-primary transition-colors">download</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
      </div>
    </DashboardLayout>
  );
}