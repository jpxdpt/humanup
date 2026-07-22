"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout, KpiCard, Panel, Badge, EmptyState } from "@/components/dashboard";
import {
  QuestionarioBuilder,
  EnvioQuestionarios,
  MensagensAdmin,
  ImportarColaboradores,
  RelatoriosEnviados,
  DocumentosAdmin,
  PacotesAdmin,
  DimensoesAdmin,
  DefinicoesAdmin,
} from "@/components/admin-features";

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-secondary font-body-md">A carregar...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

const TABS = [
  { id: "dashboard", icon: "dashboard", label: "Painel" },
  { id: "clientes", icon: "groups", label: "Clientes" },
  { id: "questionarios", icon: "description", label: "Questionarios" },
  { id: "envios", icon: "send", label: "Envios" },
  { id: "colaboradores", icon: "person_add", label: "Importar" },
  { id: "mensagens", icon: "forum", label: "Mensagens" },
  { id: "relatorios", icon: "analytics", label: "Relatorios" },
  { id: "documentos", icon: "folder", label: "Documentos" },
  { id: "pacotes", icon: "inventory_2", label: "Pacotes" },
  { id: "dimensoes", icon: "donut_large", label: "Dimensoes" },
  { id: "definicoes", icon: "settings", label: "Definicoes" },
];

function AdminDashboardContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dashboard_admin" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setDashboardData(data.data);
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

  const data = dashboardData || {};
  const empresas = data.totalEmpresas || 0;
  const colabs = data.totalColaboradores || 0;
  const envios = data.totalEnvios || 0;
  const faturasPendentes = data.faturasPendentes || 0;
  const totalPorReceber = data.totalPorReceber || 0;
  const ativas = data.empresasAtivas || 0;

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <DashboardLayout>
      {tab === "dashboard" && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Painel Administrador</h2>
              <p className="font-body-sm text-body-sm text-secondary">
                HumanUp &middot; Gestao interna da plataforma &middot; <span className="text-primary font-medium">Administrador HumanUp</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-card-gap mb-margin-md">
            <KpiCard label="Empresas Clientes" value={String(empresas)} sub={String(ativas) + " ativas"} icon="domain" />
            <KpiCard label="Colaboradores" value={String(colabs)} sub={"em " + empresas + " empresas"} icon="badge" />
            <KpiCard label="Questionarios Ativos" value={String(envios)} sub={envios === 0 ? "Nenhum criado ainda" : "Em curso"} icon="assignment" highlight="primary" />
            <KpiCard label="Faturas Pendentes" value={String(faturasPendentes)} sub={totalPorReceber > 0 ? "\u20AC " + totalPorReceber : "Tudo regularizado"} icon="receipt_long" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-card-gap">
            <div className="xl:col-span-8 flex flex-col gap-card-gap">
              <Panel title="Bem-vindo ao HumanUp" subtitle="Painel de administracao">
                <div className="flex items-center gap-4 p-4 bg-primary-container/20 rounded-lg border border-primary/20">
                  <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
                  <div>
                    <p className="font-body-md text-body-md text-on-surface mb-1">
                      Utilize o menu acima para navegar entre as seccoes.
                    </p>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Crie questionarios, envie para as empresas, importe colaboradores e acompanhe os resultados.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-4">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                  <h3 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Atalhos</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "description", label: "Criar questionario", tab: "questionarios" },
                    { icon: "send", label: "Enviar questionario", tab: "envios" },
                    { icon: "person_add", label: "Importar colaboradores", tab: "colaboradores" },
                    { icon: "forum", label: "Mensagens", tab: "mensagens" },
                    { icon: "settings", label: "Definicoes", tab: "definicoes" },
                  ].map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => router.push("/dashboard/admin?tab=" + item.tab)}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      </div>
                      <span className="font-button text-button text-on-surface">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "clientes" && (
        <ClientesTab />
      )}

      {tab === "questionarios" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Questionarios</h2>
            <p className="font-body-sm text-body-sm text-secondary">Crie e gere os questionarios de bem-estar</p>
          </div>
          <QuestionarioBuilder />
        </>
      )}

      {tab === "envios" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Envios</h2>
            <p className="font-body-sm text-body-sm text-secondary">Envie questionarios para as empresas</p>
          </div>
          <EnvioQuestionarios />
        </>
      )}

      {tab === "colaboradores" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Importar Colaboradores</h2>
            <p className="font-body-sm text-body-sm text-secondary">Adicione colaboradores em massa via ficheiro CSV</p>
          </div>
          <ImportarColaboradores />
        </>
      )}

      {tab === "mensagens" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Mensagens</h2>
            <p className="font-body-sm text-body-sm text-secondary">Comunique diretamente com os CEOs das empresas</p>
          </div>
          <MensagensAdmin />
        </>
      )}

      {tab === "relatorios" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Relatorios</h2>
            <p className="font-body-sm text-body-sm text-secondary">Acompanhe as taxas de resposta dos questionarios enviados</p>
          </div>
          <RelatoriosEnviados />
        </>
      )}

      {tab === "documentos" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Documentos</h2>
            <p className="font-body-sm text-body-sm text-secondary">Materiais de apoio para partilhar com os CEOs</p>
          </div>
          <DocumentosAdmin />
        </>
      )}

      {tab === "pacotes" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Pacotes / Planos</h2>
            <p className="font-body-sm text-body-sm text-secondary">Configure os planos disponiveis para as empresas</p>
          </div>
          <PacotesAdmin />
        </>
      )}

      {tab === "dimensoes" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Dimensoes</h2>
            <p className="font-body-sm text-body-sm text-secondary">Personalize as dimensoes da Roda da Vida Organizacional</p>
          </div>
          <DimensoesAdmin />
        </>
      )}

      {tab === "definicoes" && (
        <>
          <div className="mb-margin-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Definicoes</h2>
            <p className="font-body-sm text-body-sm text-secondary">Configure o seu perfil de administrador</p>
          </div>
          <DefinicoesAdmin />
        </>
      )}
    </DashboardLayout>
  );
}

function ClientesTab() {
  const [empresas, setEmpresas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/empresas")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEmpresas(res.empresas || []);
      });
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Clientes</h2>
          <p className="font-body-sm text-body-sm text-secondary">{empresas.length} empresas registadas</p>
        </div>
      </div>
      <Panel title="Empresas">
        {empresas.length === 0 ? (
          <EmptyState icon="domain" title="Nenhuma empresa registada." description="As empresas aparecerao aqui apos serem adicionadas." />
        ) : (
          <div className="space-y-3">
            {empresas.map((emp: any) => (
              <div key={emp.id} className="flex items-center justify-between p-4 rounded-xl border border-surface-variant hover:border-primary hover:bg-surface-bright transition-all">
                <div className="flex-1">
                  <div className="font-body-md text-body-md font-semibold text-on-surface">{emp.nome}</div>
                  <div className="font-body-sm text-body-sm text-secondary mt-0.5">{emp.nif} &middot; {emp.ncolab} colaboradores &middot; {emp.pacote}</div>
                  <div className="font-body-sm text-body-sm text-tertiary">CEO: {emp.ceo_nome} &middot; {emp.ceo_email}</div>
                </div>
                <Badge variant={emp.estado as "ativo" | "inativo"}>{emp.estado}</Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
