"use client";

import { Suspense, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout, KpiCard, Panel } from "@/components/dashboard";
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
import { ClientesTab } from "./ClientesTab";
import { animateEnter, slideUp, spring } from "@/lib/animations";

interface DashboardData {
  totalEmpresas: number;
  empresasAtivas: number;
  totalColaboradores: number;
  totalEnvios: number;
  faturasPendentes: number;
  totalPorReceber: number;
}

export default function AdminDashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-secondary font-body-md">A carregar...</div>}>
      <AdminDashboardContent initialData={initialData} />
    </Suspense>
  );
}

function AdminDashboardContent({ initialData }: { initialData: DashboardData }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get?.("tab") || "dashboard";
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "admin") router.push("/login");
  }, [isAuthenticated, user, router, loading]);

  useEffect(() => {
    if (tab === "dashboard" && dashboardRef.current) {
      animateEnter(dashboardRef.current, slideUp, spring.gentle);
    }
  }, [tab]);

  if (loading || !isAuthenticated || user?.role !== "admin") return null;

  const data = initialData || {};
  const empresas = data.totalEmpresas || 0;
  const colabs = data.totalColaboradores || 0;
  const envios = data.totalEnvios || 0;
  const faturasPendentes = data.faturasPendentes || 0;
  const totalPorReceber = data.totalPorReceber || 0;
  const ativas = data.empresasAtivas || 0;

  return (
    <DashboardLayout>
      <div key={tab} className="apple-tab-enter">
      {tab === "dashboard" && (
        <div ref={dashboardRef}>
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

          <Panel title="Atalhos">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all duration-150 text-center group cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-150">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <span className="font-button text-button text-on-surface">{item.label}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === "clientes" && <ClientesTab />}

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
      </div>
    </DashboardLayout>
  );
}
