"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout, KpiCard, Panel, Badge, EmptyState } from "@/components/dashboard";

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-secondary font-body-md">A carregar...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
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
    if (!isAuthenticated || user?.role !== "admin") router.push("/login");
    else fetchData();
  }, [isAuthenticated, user, router, loading, fetchData]);

  if (loading || !isAuthenticated || user?.role !== "admin") return null;

  const empresas = dashboardData?.empresas || [];
  const faturas = dashboardData?.faturas || [];
  const envios = dashboardData?.envios || [];
  const agg = dashboardData?.aggregados || {};
  const totalEmpresas = agg.totalEmpresas || 0;
  const totalColabs = agg.totalColaboradores || 0;
  const totalAtivos = agg.totalAtivas || 0;
  const totalFaturasPendentes = agg.totalFaturasPendentes || 0;
  const totalPorReceber = agg.totalPorReceber || 0;

  return (
    <DashboardLayout>
      {tab === "dashboard" && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Painel Administrador</h2>
              <p className="font-body-sm text-body-sm text-secondary">
                HumanUp • Gestão interna da plataforma • <span className="text-primary font-medium">Administrador HumanUp</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container transition-colors font-button text-button px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Nova empresa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-card-gap mb-margin-md">
            <KpiCard label="Empresas Clientes" value={String(totalEmpresas)} sub={String(totalAtivos) + " ativas"} icon="domain" />
            <KpiCard label="Colaboradores" value={String(totalColabs)} sub={`em ${totalEmpresas} empresas`} icon="badge" />
            <KpiCard label="Questionários Ativos" value={String(envios.length)} sub={envios.length === 0 ? "Nenhum criado ainda" : "Em curso"} icon="assignment" highlight="primary" />
            <KpiCard label="Faturas Pendentes" value={String(totalFaturasPendentes)} sub={totalPorReceber > 0 ? `€ ${totalPorReceber}` : "Tudo regularizado"} icon="receipt_long" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-card-gap">
            <div className="xl:col-span-8 flex flex-col gap-card-gap">
              <Panel title="Respostas por Empresa" subtitle="Q3 2026">
                <EmptyState icon="insert_chart" title="Sem empresas ainda." />
              </Panel>

              <Panel title="Notificações">
                <EmptyState icon="notifications_active" title="Sem notificações recentes." />
              </Panel>
            </div>

            <div className="xl:col-span-4">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                  <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Acções Rápidas</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <QuickAction icon="domain_add" label="Nova empresa" onClick={() => alert("Funcionalidade em desenvolvimento")} />
                  <QuickAction icon="post_add" label="Novo questionário" onClick={() => alert("Funcionalidade em desenvolvimento")} />
                  <QuickAction icon="send" label="Enviar questionário" onClick={() => alert("Funcionalidade em desenvolvimento")} />
                  <QuickAction icon="receipt" label="Nova fatura" onClick={() => alert("Funcionalidade em desenvolvimento")} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "clientes" && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Clientes</h2>
              <p className="font-body-sm text-body-sm text-secondary">{totalEmpresas} empresas registadas</p>
            </div>
            <button className="bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container transition-colors font-button text-button px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nova empresa
            </button>
          </div>
          <Panel title="Empresas">
            <div className="space-y-3">
              {empresas.map((emp: any) => (
                <div key={emp.id} className="flex items-center justify-between p-4 rounded-xl border border-surface-variant hover:border-primary hover:bg-surface-bright transition-all">
                  <div className="flex-1">
                    <div className="font-body-md text-body-md font-semibold text-on-surface">{emp.nome}</div>
                    <div className="font-body-sm text-body-sm text-secondary mt-0.5">{emp.nif} · {emp.ncolab} colaboradores · {emp.pacote}</div>
                    <div className="font-body-sm text-body-sm text-tertiary">CEO: {emp.ceo_nome} · {emp.ceo_email}</div>
                  </div>
                  <Badge variant={emp.estado as "ativo" | "inativo"}>{emp.estado}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      {tab === "questionarios" && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Questionários</h2>
              <p className="font-body-sm text-body-sm text-secondary">Crie e gira os questionários enviados às empresas</p>
            </div>
            <button className="bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container transition-colors font-button text-button px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Novo questionário
            </button>
          </div>
          <Panel title="Envios Recentes">
            {envios.length === 0 ? (
              <EmptyState icon="assignment" title="Nenhum envio realizado." description="Crie um questionário e envie para uma empresa." />
            ) : (
              <div className="space-y-3">
                {envios.map((env: any) => (
                  <div key={env.id} className="flex items-center justify-between p-4 rounded-xl border border-surface-variant">
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">{env.quest_nome}</div>
                      <div className="font-body-sm text-body-sm text-secondary mt-0.5">{env.empresa_nome} · Código: {env.codigo}</div>
                      <div className="font-body-sm text-body-sm text-tertiary">Enviado: {env.data_envio} · Limite: {env.data_limite}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-headline-md text-headline-md font-semibold text-primary">{env.respondidos}/{env.total}</div>
                      <div className="font-body-sm text-body-sm text-secondary">{Math.round((env.respondidos / env.total) * 100)}% respondidas</div>
                      <div className="w-24 h-1.5 bg-surface-container rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(env.respondidos / env.total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {tab === "relatorios" && (
        <Panel title="Relatórios">
          <EmptyState icon="analytics" title="Nenhum relatório disponível." description="Os relatórios são gerados automaticamente após os questionários." />
        </Panel>
      )}

      {tab === "definicoes" && (
        <Panel title="Definições">
          <EmptyState icon="settings" title="Página em desenvolvimento." description="Configurações de perfil, email e administradores." />
        </Panel>
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
