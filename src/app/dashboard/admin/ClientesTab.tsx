"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Panel, Badge, EmptyState } from "@/components/dashboard";
import { PaginationControls } from "@/components/PaginationControls";

interface Empresa {
  id: string;
  nome: string;
  nif: string;
  pacote: string;
  estado: "ativo" | "inativo";
  ncolab: number;
  ceo_nome: string;
  ceo_email: string;
  ceo_cargo?: string;
  ceo_tel?: string;
}

interface EmpresaForm {
  nome: string;
  nif: string;
  pacote: string;
  estado: string;
  ceo_nome: string;
  ceo_email: string;
  ceo_cargo: string;
  ceo_tel: string;
  ceo_password: string;
}

const EMPTY_FORM: EmpresaForm = {
  nome: "",
  nif: "",
  pacote: "Essencial",
  estado: "ativo",
  ceo_nome: "",
  ceo_email: "",
  ceo_cargo: "",
  ceo_tel: "",
  ceo_password: "",
};

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  nif: string;
  localizacao: string;
  departamento: string;
  cargo: string;
  estado: string;
  access_code_hash?: string;
}

interface ColabForm {
  nome: string;
  email: string;
  nif: string;
  localizacao: string;
  departamento: string;
  cargo: string;
}

const COLAB_EMPTY: ColabForm = {
  nome: "",
  email: "",
  nif: "",
  localizacao: "",
  departamento: "",
  cargo: "",
};

export function ClientesTab() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [form, setForm] = useState<EmpresaForm>(EMPTY_FORM);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_LIMIT = 10;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [colabs, setColabs] = useState<Colaborador[]>([]);
  const [colabLoading, setColabLoading] = useState(false);
  const [colabModal, setColabModal] = useState(false);
  const [colabEditando, setColabEditando] = useState<Colaborador | null>(null);
  const [colabForm, setColabForm] = useState<ColabForm>(COLAB_EMPTY);
  const [colabSalvando, setColabSalvando] = useState(false);
  const [colabCodigo, setColabCodigo] = useState("");

  const api = useCallback(async (action: string, body: Record<string, unknown> = {}) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    return res.json();
  }, []);

  const carregar = useCallback(async (off = offset) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "empresa_list", limit: PAGE_LIMIT, offset: off }),
    });
    const data = await res.json();
    if (data.success) { setEmpresas(data.data); setTotal(data.count || 0); }
  }, [offset]);

  useEffect(() => { carregar(offset); }, [carregar, offset]);

  const carregarColabs = useCallback(async (empresaId: string) => {
    setColabLoading(true);
    const res = await api("colaborador_list", { empresa_id: empresaId, limit: 200, offset: 0 });
    if (res.success) setColabs(res.data);
    setColabLoading(false);
  }, [api]);

  useEffect(() => {
    if (expandedId) carregarColabs(expandedId);
    else setColabs([]);
  }, [expandedId, carregarColabs]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(EMPTY_FORM);
    setModalAberto(true);
  };

  const abrirEditar = (emp: Empresa) => {
    setEditando(emp);
    setForm({
      nome: emp.nome,
      nif: emp.nif,
      pacote: emp.pacote,
      estado: emp.estado,
      ceo_nome: emp.ceo_nome,
      ceo_email: emp.ceo_email,
      ceo_cargo: emp.ceo_cargo || "",
      ceo_tel: emp.ceo_tel || "",
      ceo_password: "",
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const action = editando ? "empresa_update" : "empresa_insert";
      const body: Record<string, unknown> = { action, ...form };
      if (editando) body.id = editando.id;
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const verComo = async (emp: Empresa, role: "ceo" | "gestor") => {
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "empresa_delete", id }),
    });
    const data = await res.json();
    if (data.success) {
      setToast("Empresa eliminada");
      if (expandedId === id) setExpandedId(null);
      carregar();
    } else {
      setToast("Erro ao eliminar");
    }
  };

  const abrirNovoColab = () => {
    setColabEditando(null);
    setColabForm(COLAB_EMPTY);
    setColabCodigo("");
    setColabModal(true);
  };

  const abrirEditarColab = (c: Colaborador) => {
    setColabEditando(c);
    setColabForm({
      nome: c.nome,
      email: c.email,
      nif: c.nif,
      localizacao: c.localizacao || "",
      departamento: c.departamento || "",
      cargo: c.cargo || "",
    });
    setColabCodigo("");
    setColabModal(true);
  };

  const salvarColab = async () => {
    if (!expandedId) return;
    setColabSalvando(true);
    try {
      const action = colabEditando ? "colaborador_update" : "colaborador_insert";
      const body: Record<string, unknown> = { action, ...colabForm };
      if (colabEditando) body.id = colabEditando.id;
      else body.empresa_id = expandedId;
      const res = await api(action, colabEditando
        ? { id: colabEditando.id, ...colabForm }
        : { empresa_id: expandedId, ...colabForm }
      );
      if (res.success) {
        setToast(colabEditando ? "Colaborador atualizado" : "Colaborador criado");
        setColabModal(false);
        setColabCodigo(res.codigo || "");
        carregarColabs(expandedId);
        carregar();
      } else {
        setToast("Erro: " + (res.error || "desconhecido"));
      }
    } catch {
      setToast("Erro ao salvar colaborador");
    } finally {
      setColabSalvando(false);
    }
  };

  const eliminarColab = async (id: string, nome: string) => {
    if (!confirm(`Eliminar colaborador "${nome}"?`)) return;
    const res = await api("colaborador_delete", { id });
    if (res.success) {
      setToast("Colaborador eliminado");
      if (expandedId) carregarColabs(expandedId);
      carregar();
    } else {
      setToast("Erro ao eliminar colaborador");
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
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
          <div className="space-y-2">
            {empresas.map((emp) => {
              const expanded = expandedId === emp.id;
              return (
                <div key={emp.id}>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-surface-variant hover:border-primary hover:bg-surface-bright transition-all group cursor-pointer" onClick={() => setExpandedId(expanded ? null : emp.id)}>
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`material-symbols-outlined text-secondary transition-transform ${expanded ? "rotate-90" : ""}`}>chevron_right</span>
                      <div>
                        <div className="font-body-md text-body-md font-semibold text-on-surface">{emp.nome}</div>
                        <div className="font-body-sm text-body-sm text-secondary mt-0.5">{emp.nif} &middot; {emp.ncolab} colaboradores &middot; {emp.pacote}</div>
                        <div className="font-body-sm text-body-sm text-tertiary">CEO: {emp.ceo_nome} &middot; {emp.ceo_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Badge variant={emp.estado}>{emp.estado}</Badge>
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
                  {expanded && (
                    <div className="ml-6 pl-4 border-l-2 border-primary-container bg-surface-bright/30 rounded-b-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-body-sm text-body-sm text-secondary">{colabs.length} colaborador(es)</span>
                        <button onClick={abrirNovoColab} className="flex items-center gap-1 text-primary font-button text-button cursor-pointer hover:underline">
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          Adicionar
                        </button>
                      </div>
                      {colabLoading ? (
                        <div className="text-center py-4 text-secondary font-body-sm">A carregar...</div>
                      ) : colabs.length === 0 ? (
                        <div className="text-center py-4 text-secondary font-body-sm">Nenhum colaborador. Adicione um novo.</div>
                      ) : (
                        <div className="space-y-1">
                          {colabs.map((c) => (
                            <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-container transition-colors group/colab">
                              <div className="flex-1">
                                <div className="font-body-md text-body-md">{c.nome}</div>
                                <div className="font-body-sm text-body-sm text-secondary">
                                  {c.nif} &middot; {c.email}
                                  {c.localizacao && <span> &middot; {c.localizacao}</span>}
                                  {c.departamento && <span> &middot; {c.departamento}</span>}
                                  {c.cargo && <span> &middot; {c.cargo}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/colab:opacity-100 transition-opacity">
                                <button onClick={() => abrirEditarColab(c)} className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg cursor-pointer">
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>
                                <button onClick={() => eliminarColab(c.id, c.nome)} className="p-1.5 text-secondary hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer">
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <PaginationControls offset={offset} limit={PAGE_LIMIT} total={total} onChange={setOffset} />
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

      {colabModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setColabModal(false)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">{colabEditando ? "Editar Colaborador" : "Novo Colaborador"}</h3>
              <button onClick={() => setColabModal(false)} className="p-2 text-secondary hover:bg-surface-container rounded-lg cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-body-sm text-body-sm text-secondary block mb-1">Nome *</label>
                <input value={colabForm.nome} onChange={(e) => setColabForm({ ...colabForm, nome: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Nome do colaborador" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Email</label>
                  <input value={colabForm.email} onChange={(e) => setColabForm({ ...colabForm, email: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="email@empresa.pt" />
                </div>
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">NIF *</label>
                  <input value={colabForm.nif} onChange={(e) => setColabForm({ ...colabForm, nif: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="123456789" />
                </div>
              </div>
              <div>
                <label className="font-body-sm text-body-sm text-secondary block mb-1">Localização</label>
                <input value={colabForm.localizacao} onChange={(e) => setColabForm({ ...colabForm, localizacao: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: Porto, Lisboa, Coimbra" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Departamento</label>
                  <input value={colabForm.departamento} onChange={(e) => setColabForm({ ...colabForm, departamento: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: RH, Vendas" />
                </div>
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Cargo</label>
                  <input value={colabForm.cargo} onChange={(e) => setColabForm({ ...colabForm, cargo: e.target.value })} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: Analista" />
                </div>
              </div>

              {colabCodigo && (
                <div className="bg-primary-container/20 border border-primary-container rounded-lg p-3">
                  <p className="font-body-sm text-body-sm text-primary font-semibold">Código de acesso: {colabCodigo}</p>
                  <p className="font-body-sm text-body-sm text-secondary mt-1">Guarde este código. É necessário para o colaborador fazer login.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
              <button onClick={() => setColabModal(false)} className="px-4 py-2.5 rounded-xl border border-outline-variant text-secondary hover:bg-surface-container transition-all font-button text-button cursor-pointer">
                Cancelar
              </button>
              <button onClick={salvarColab} disabled={colabSalvando || !colabForm.nome || !colabForm.nif} className="px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:brightness-110 transition-all font-button text-button disabled:opacity-50 cursor-pointer flex items-center gap-2">
                {colabSalvando ? <span className="material-symbols-outlined text-[18px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[18px]">check</span>}
                {colabEditando ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}