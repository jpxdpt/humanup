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
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-bright transition-all text-center group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <span className="font-button text-button text-on-surface">{item.label}</span>
                </button>
              ))}
            </div>
          </Panel>
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
  const router = useRouter();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState({ nome: "", nif: "", pacote: "Essencial", estado: "ativo", ceo_nome: "", ceo_email: "", ceo_cargo: "", ceo_tel: "", ceo_password: "" });
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const res = await fetch("/api/admin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "empresa_list" }),
    });
    const data = await res.json();
    if (data.success) setEmpresas(data.data);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", nif: "", pacote: "Essencial", estado: "ativo", ceo_nome: "", ceo_email: "", ceo_cargo: "", ceo_tel: "", ceo_password: "" });
    setModalAberto(true);
  };

  const abrirEditar = (emp: any) => {
    setEditando(emp);
    setForm({ nome: emp.nome, nif: emp.nif, pacote: emp.pacote, estado: emp.estado, ceo_nome: emp.ceo_nome, ceo_email: emp.ceo_email, ceo_cargo: emp.ceo_cargo || "", ceo_tel: emp.ceo_tel || "", ceo_password: "" });
    setModalAberto(true);
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const action = editando ? "empresa_update" : "empresa_insert";
      const body: any = { action, ...form };
      if (editando) body.id = editando.id;
      const res = await fetch("/api/admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setToast(editando ? "Empresa atualizada" : "Empresa criada");
        setModalAberto(false);
        carregar();
      } else {
        setToast("Erro: " + (data.error || "desconhecido"));
      }
    } catch {
      setToast("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const verComo = async (emp: any, role: "ceo" | "gestor") => {
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id: emp.id, role }),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/dashboard/ceo");
    } else {
      setToast("Erro: " + (data.error || "desconhecido"));
    }
  };

  const eliminar = async (id: string, nome: string) => {
    if (!confirm(`Tem a certeza que deseja eliminar "${nome}"?`)) return;
    const res = await fetch("/api/admin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "empresa_delete", id }),
    });
    const data = await res.json();
    if (data.success) {
      setToast("Empresa eliminada");
      carregar();
    } else {
      setToast("Erro ao eliminar");
    }
  };

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface-container-lowest border border-outline-variant shadow-xl rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface animate-in slide-in-from-right">
          {toast}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-margin-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">Clientes</h2>
          <p className="font-body-sm text-body-sm text-secondary">{empresas.length} empresas registadas</p>
        </div>
        <button onClick={abrirNovo} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:brightness-110 transition-all font-button text-button cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo Cliente
        </button>
      </div>

      <Panel title="Empresas">
        {empresas.length === 0 ? (
          <EmptyState icon="domain" title="Nenhuma empresa registada." description={'Clique em "Novo Cliente" para adicionar a primeira.'} />
        ) : (
          <div className="space-y-3">
            {empresas.map((emp: any) => (
              <div key={emp.id} className="flex items-center justify-between p-4 rounded-xl border border-surface-variant hover:border-primary hover:bg-surface-bright transition-all group">
                <div className="flex-1">
                  <div className="font-body-md text-body-md font-semibold text-on-surface">{emp.nome}</div>
                  <div className="font-body-sm text-body-sm text-secondary mt-0.5">{emp.nif} &middot; {emp.ncolab} colaboradores &middot; {emp.pacote}</div>
                  <div className="font-body-sm text-body-sm text-tertiary">CEO: {emp.ceo_nome} &middot; {emp.ceo_email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={emp.estado as "ativo" | "inativo"}>{emp.estado}</Badge>
                  <button onClick={() => verComo(emp, "ceo")} className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100" title="Ver como CEO">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button onClick={() => verComo(emp, "gestor")} className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100" title="Ver como Gestor">
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                  </button>
                  <button onClick={() => abrirEditar(emp)} className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => eliminar(emp.id, emp.nome)} className="p-2 text-secondary hover:text-error hover:bg-error-container/20 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">{editando ? "Editar Cliente" : "Novo Cliente"}</h3>
              <button onClick={() => setModalAberto(false)} className="p-2 text-secondary hover:bg-surface-container rounded-lg cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Nome da empresa *</label>
                  <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: Minha Empresa Lda" />
                </div>
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">NIF *</label>
                  <input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="500000000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Pacote</label>
                  <select value={form.pacote} onChange={(e) => setForm({ ...form, pacote: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer">
                    <option value="Essencial">Essencial</option>
                    <option value="START-UP">START-UP</option>
                    <option value="GO-UP">GO-UP</option>
                    <option value="GROW-UP">GROW-UP</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Estado</label>
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-4">
                <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-3">CEO / Contacto Principal</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body-sm text-body-sm text-secondary block mb-1">Nome *</label>
                    <input value={form.ceo_nome} onChange={(e) => setForm({ ...form, ceo_nome: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Nome do CEO" />
                  </div>
                  <div>
                    <label className="font-body-sm text-body-sm text-secondary block mb-1">Email *</label>
                    <input value={form.ceo_email} onChange={(e) => setForm({ ...form, ceo_email: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="ceo@empresa.pt" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="font-body-sm text-body-sm text-secondary block mb-1">Cargo</label>
                    <input value={form.ceo_cargo} onChange={(e) => setForm({ ...form, ceo_cargo: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="CEO" />
                  </div>
                  <div>
                    <label className="font-body-sm text-body-sm text-secondary block mb-1">Telefone</label>
                    <input value={form.ceo_tel} onChange={(e) => setForm({ ...form, ceo_tel: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="+351 900 000 000" />
                  </div>
                </div>
                {!editando && (
                  <div className="mt-4">
                    <label className="font-body-sm text-body-sm text-secondary block mb-1">Password de acesso (CEO) *</label>
                    <input value={form.ceo_password} onChange={(e) => setForm({ ...form, ceo_password: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Min. 6 caracteres" />
                  </div>
                )}
                {editando && (
                  <div className="mt-4">
                    <label className="font-body-sm text-body-sm text-secondary block mb-1">Nova password (deixar vazio para manter)</label>
                    <input value={form.ceo_password} onChange={(e) => setForm({ ...form, ceo_password: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Nova password do CEO" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2.5 rounded-xl border border-outline-variant text-secondary hover:bg-surface-container transition-all font-button text-button cursor-pointer">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando || !form.nome || !form.nif || !form.ceo_nome || !form.ceo_email} className="px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:brightness-110 transition-all font-button text-button disabled:opacity-50 cursor-pointer flex items-center gap-2">
                {salvando ? <span className="material-symbols-outlined text-[18px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[18px]">check</span>}
                {editando ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
