"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Panel, Badge, EmptyState } from "@/components/dashboard";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface Questionario {
  id: string;
  titulo: string;
  tipo: string;
  badge: string;
  estado: string;
  perguntas: Pergunta[];
  created_at: string;
}

interface Pergunta {
  tipo: string;
  texto: string;
  dim: string;
  obrig: string;
  opcoes: string[];
}

interface Empresa {
  id: string;
  nome: string;
}

interface Envio {
  id: string;
  empresa_id: string;
  quest_id: string;
  codigo: string;
  estado: string;
  total_colabs: number;
  respostas: number;
  data_envio: string;
  data_limite: string;
  empresa_nome: string;
  quest_nome: string;
  destinatarios?: Colaborador[];
}

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  nif: string;
  localizacao: string;
  departamento: string;
  cargo: string;
  estado: string;
  respondido?: boolean;
}

interface Mensagem {
  id: number;
  empresa_id: string;
  de: string;
  texto: string;
  anexos: string[];
  lida: boolean;
  created_at: string;
}

interface Documento {
  id: number;
  tipo: string;
  nome: string;
  descricao: string;
  url: string;
  created_at: string;
}

interface Pacote {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
}

interface Dimensao {
  id: number;
  nome: string;
  cor: string;
  icone: string;
  descricao: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionFn = (action: string, body?: Record<string, unknown>) => Promise<any>;

function useAdminApi() {
  const call = useCallback<ActionFn>(async (action, body = {}) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    return res.json();
  }, []);
  return call;
}

const TIPO_OPTIONS = [
  { value: "pulse", label: "Pulse" },
  { value: "diagnostico", label: "Diagnostico" },
  { value: "burnout", label: "Burnout" },
  { value: "lideranca", label: "Lideranca" },
  { value: "clima", label: "Clima" },
  { value: "saude", label: "Saude" },
  { value: "nps", label: "NPS" },
  { value: "outro", label: "Outro" },
];

const BADGE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PRO: { bg: "#F5A623", color: "#fff", label: "PRO" },
  RAPIDO: { bg: "#dcfce7", color: "#166534", label: "RAPIDO" },
  CLINICO: { bg: "#fee2e2", color: "#991b1b", label: "CLINICO" },
  NOVO: { bg: "#dbeafe", color: "#1e40af", label: "NOVO" },
  BETA: { bg: "#f3e8ff", color: "#6b21a8", label: "BETA" },
};

const DIM_CORES: Record<string, { bg: string; color: string; border: string }> = {
  gold: { bg: "rgba(245,166,35,0.1)", color: "#845400", border: "rgba(245,166,35,0.3)" },
  blue: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  green: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  purple: { bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" },
  orange: { bg: "#ffedd5", color: "#9a3412", border: "#fed7aa" },
  red: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
};

const TIPO_LABELS: Record<string, string> = {
  escala: "Escala 1-10",
  escolha: "Escolha multipla",
  texto: "Texto livre",
  nps: "NPS 0-10",
};

const TIPO_COLORS: Record<string, string> = {
  escala: "bg-[#dbeafe] text-[#1e40af]",
  escolha: "bg-[#dcfce7] text-[#166534]",
  texto: "bg-[#fef3c7] text-[#92400e]",
  nps: "bg-[#f3e8ff] text-[#6b21a8]",
};

function LabelCaps({ children }: { children: React.ReactNode }) {
  return <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">{children}</span>;
}

// ─── QUESTIONARIO BUILDER ───

export function QuestionarioBuilder() {
  const api = useAdminApi();
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [dimensoes, setDimensoes] = useState<Dimensao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Questionario | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("pulse");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    const [qRes, dRes] = await Promise.all([api("questionario_list"), api("dimensao_list")]);
    if (qRes.success) setQuestionarios(qRes.data);
    if (dRes.success) setDimensoes(dRes.data);
    setLoading(false);
  }, [api]);

  useEffect(() => { carregar(); }, [carregar]);

  function novaPergunta(tipoP: string) {
    setPerguntas([...perguntas, { tipo: tipoP, texto: "", dim: "", obrig: "sim", opcoes: tipoP === "escolha" ? ["Opcao 1", "Opcao 2"] : [] }]);
    setEditIdx(perguntas.length);
  }

  function removerPergunta(i: number) {
    const nova = perguntas.filter((_, idx) => idx !== i);
    setPerguntas(nova);
    if (editIdx === i) setEditIdx(null);
    else if (editIdx !== null && editIdx > i) setEditIdx(editIdx - 1);
  }

  function moverPergunta(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= perguntas.length) return;
    const nova = [...perguntas];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    setPerguntas(nova);
    if (editIdx === i) setEditIdx(j);
    else if (editIdx === j) setEditIdx(i);
  }

  function dragStart(e: React.DragEvent, i: number) {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  }

  function dragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function drop(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const nova = [...perguntas];
    const [movida] = nova.splice(dragIdx, 1);
    nova.splice(i, 0, movida);
    setPerguntas(nova);
    if (editIdx === dragIdx) setEditIdx(i);
    else if (editIdx !== null) {
      if (dragIdx < editIdx && i >= editIdx) setEditIdx(editIdx - 1);
      else if (dragIdx > editIdx && i <= editIdx) setEditIdx(editIdx + 1);
    }
    setDragIdx(null);
  }

  async function guardar() {
    const pFiltradas = perguntas.filter((p) => p.texto.trim());
    if (!titulo.trim()) { toast.error("Introduza o titulo do questionario."); return; }
    if (!pFiltradas.length) { toast.error("Adicione pelo menos 1 pergunta."); return; }
    const semDim = pFiltradas.filter((p) => !p.dim.trim());
    if (semDim.length) { toast.error(`A dimensao e obrigatoria. Pergunta(s) sem dimensao: ${semDim.map((_, i) => i + 1).join(", ")}`); return; }
    if (editando) {
      const res = await api("questionario_update", { id: editando.id, titulo: titulo.trim(), tipo, perguntas: pFiltradas });
      if (res.success) toast.success("Questionario atualizado.");
    } else {
      const res = await api("questionario_insert", { titulo: titulo.trim(), tipo, perguntas: pFiltradas });
      if (res.success) toast.success("Questionario criado.");
    }
    setMostrarForm(false);
    setEditando(null);
    setTitulo("");
    setTipo("pulse");
    setPerguntas([]);
    setEditIdx(null);
    carregar();
  }

  function editar(q: Questionario) {
    setEditando(q);
    setTitulo(q.titulo);
    setTipo(q.tipo);
    setPerguntas(Array.isArray(q.perguntas) ? q.perguntas : []);
    setMostrarForm(true);
    setEditIdx(null);
  }

  async function eliminar(id: string) {
    if (!confirm("Tem certeza que deseja eliminar este questionario?")) return;
    await api("questionario_delete", { id });
    carregar();
    toast.success("Questionario eliminado.");
  }

  if (loading) return <div className="text-center py-8 text-secondary font-body-md">A carregar...</div>;

  const pergFiltradas = perguntas.filter((p) => p.texto.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body-sm text-body-sm text-secondary">{questionarios.length} questionario(s)</p>
        </div>
        <button onClick={() => { setMostrarForm(true); setEditando(null); setTitulo(""); setTipo("pulse"); setPerguntas([]); setEditIdx(null); }} className="bg-primary text-on-primary font-button text-button px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo questionario
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-5">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            {editando ? "Editar questionario" : "Novo questionario"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Titulo</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: Pulse Check Mensal" />
            </div>
            <div className="form-field">
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
                {TIPO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <LabelCaps>Perguntas ({pergFiltradas.length})</LabelCaps>
              <div className="flex gap-2">
                <button onClick={() => novaPergunta("escala")} className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">add</span> Escala 1-10
                </button>
                <button onClick={() => novaPergunta("escolha")} className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">add</span> Escolha
                </button>
                <button onClick={() => novaPergunta("texto")} className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">add</span> Texto
                </button>
                <button onClick={() => novaPergunta("nps")} className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">add</span> NPS
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pergFiltradas.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-outline-variant rounded-lg">
                  <span className="material-symbols-outlined text-3xl text-secondary/50 mb-2">help_outline</span>
                  <p className="text-body-sm text-secondary">Nenhuma pergunta. Clique num tipo acima para adicionar.</p>
                </div>
              )}
              {pergFiltradas.map((p, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => dragStart(e, i)}
                  onDragOver={dragOver}
                  onDrop={(e) => drop(e, i)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-default transition-all ${editIdx === i ? "border-primary bg-primary-container/20" : "border-outline-variant bg-surface-container-lowest"}`}
                >
                  <div className="cursor-grab text-secondary/50">
                    <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                  </div>
                  <span className="w-6 h-6 rounded bg-surface-container text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface truncate">{p.texto || <em className="text-error text-[13px]">Texto em falta</em>}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIPO_COLORS[p.tipo] || "bg-surface-container text-secondary"}`}>{TIPO_LABELS[p.tipo] || p.tipo}</span>
                      {p.dim && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-secondary">{p.dim}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moverPergunta(i, -1)} disabled={i === 0} className="text-[11px] text-secondary hover:text-on-surface p-0.5 disabled:opacity-20 cursor-pointer"><span className="material-symbols-outlined text-[14px]">arrow_upward</span></button>
                    <button onClick={() => moverPergunta(i, 1)} disabled={i === pergFiltradas.length - 1} className="text-[11px] text-secondary hover:text-on-surface p-0.5 disabled:opacity-20 cursor-pointer"><span className="material-symbols-outlined text-[14px]">arrow_downward</span></button>
                  </div>
                  <button onClick={() => setEditIdx(editIdx === i ? null : i)} className="p-1.5 text-secondary hover:bg-surface-container rounded-lg cursor-pointer"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  <button onClick={() => removerPergunta(i)} className="p-1.5 text-error hover:bg-error-container/30 rounded-lg cursor-pointer"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              ))}
            </div>
          </div>

          {editIdx !== null && perguntas[editIdx] && (
            <div className="bg-surface-container rounded-lg p-4 space-y-3 border border-outline-variant">
              <div className="flex items-center justify-between">
                <LabelCaps>Editar pergunta {editIdx + 1}</LabelCaps>
                <button onClick={() => setEditIdx(null)} className="text-secondary hover:text-on-surface cursor-pointer"><span className="material-symbols-outlined text-[18px]">close</span></button>
              </div>
              <div>
                <label className="font-body-sm text-body-sm text-secondary block mb-1">Texto da pergunta</label>
                <textarea value={perguntas[editIdx].texto} onChange={(e) => { const nova = [...perguntas]; nova[editIdx] = { ...nova[editIdx], texto: e.target.value }; setPerguntas(nova); }} className="w-full border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Dimensao *</label>
                  <select value={perguntas[editIdx].dim} onChange={(e) => { const nova = [...perguntas]; nova[editIdx] = { ...nova[editIdx], dim: e.target.value }; setPerguntas(nova); }} className="w-full border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
                    <option value="">Selecionar dimensao</option>
                    {dimensoes.map((d) => <option key={d.id} value={d.nome}>{d.nome}</option>)}
                  </select>
                  {dimensoes.length === 0 && <p className="text-[12px] text-error mt-1">Crie dimensoes em Definicoes &gt; Dimensoes primeiro.</p>}
                </div>
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Obrigatoria</label>
                  <select value={perguntas[editIdx].obrig} onChange={(e) => { const nova = [...perguntas]; nova[editIdx] = { ...nova[editIdx], obrig: e.target.value }; setPerguntas(nova); }} className="w-full border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
                    <option value="sim">Sim</option>
                    <option value="nao">Nao</option>
                  </select>
                </div>
              </div>
              {perguntas[editIdx].tipo === "escolha" && (
                <div>
                  <label className="font-body-sm text-body-sm text-secondary block mb-1">Opcoes</label>
                  <div className="space-y-2">
                    {perguntas[editIdx].opcoes.map((op, oi) => (
                      <div key={oi} className="flex gap-2 items-center">
                        <input value={op} onChange={(e) => { const nova = [...perguntas]; const ops = [...nova[editIdx].opcoes]; ops[oi] = e.target.value; nova[editIdx] = { ...nova[editIdx], opcoes: ops }; setPerguntas(nova); }} className="flex-1 border border-outline-variant rounded-lg px-3 py-1.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" />
                        <button onClick={() => { const nova = [...perguntas]; nova[editIdx] = { ...nova[editIdx], opcoes: nova[editIdx].opcoes.filter((_, j) => j !== oi) }; setPerguntas(nova); }} className="text-error cursor-pointer"><span className="material-symbols-outlined text-[16px]">remove_circle</span></button>
                      </div>
                    ))}
                    <button onClick={() => { const nova = [...perguntas]; nova[editIdx] = { ...nova[editIdx], opcoes: [...nova[editIdx].opcoes, "Nova opcao"] }; setPerguntas(nova); }} className="text-primary text-[13px] font-medium cursor-pointer flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add</span> Adicionar opcao
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={guardar} className="bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
              {editando ? "Atualizar questionario" : "Criar questionario"}
            </button>
            <button onClick={() => { setMostrarForm(false); setEditando(null); setTitulo(""); setTipo("pulse"); setPerguntas([]); setEditIdx(null); }} className="border border-outline-variant text-on-surface font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <Panel title="Questionarios">
        {questionarios.length === 0 ? (
          <EmptyState icon="description" title="Nenhum questionario criado." description="Crie o primeiro questionario para comecar." />
        ) : (
          <div className="space-y-2">
            {questionarios.map((q) => {
              const pCount = Array.isArray(q.perguntas) ? q.perguntas.filter((p) => p.texto.trim()).length : 0;
              return (
                <div key={q.id} className="flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">{q.titulo}</span>
                      {q.badge && BADGE_STYLES[q.badge] && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: BADGE_STYLES[q.badge].bg, color: BADGE_STYLES[q.badge].color }}>{BADGE_STYLES[q.badge].label}</span>
                      )}
                    </div>
                    <div className="font-body-sm text-body-sm text-secondary mt-0.5">
                      {TIPO_OPTIONS.find((o) => o.value === q.tipo)?.label || q.tipo} &middot; {pCount} perguntas
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={q.estado as "ativo" | "inativo" | "rascunho"}>{q.estado}</Badge>
                    <button onClick={() => editar(q)} className="p-1.5 text-secondary hover:bg-surface-container rounded-lg cursor-pointer"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                    <button onClick={() => eliminar(q.id)} className="p-1.5 text-error hover:bg-error-container/30 rounded-lg cursor-pointer"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── ENVIO DE QUESTIONARIOS ───

export function EnvioQuestionarios() {
  const api = useAdminApi();
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [empresaId, setEmpresaId] = useState("");
  const [questId, setQuestId] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [colaboradorId, setColaboradorId] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [codigoGerado, setCodigoGerado] = useState("");
  const [envioExpandido, setEnvioExpandido] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const [eRes, qRes, envRes] = await Promise.all([
      api("questionario_list"),
      fetch("/api/dashboard/empresas").then((r) => r.json()),
      api("envio_list"),
    ]);
    if (qRes.success) setEmpresas(qRes.empresas || []);
    if (eRes.success) setQuestionarios(eRes.data);
    if (envRes.success) setEnvios(envRes.data);
    setLoading(false);
  }, [api]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!empresaId) { setColaboradores([]); setLocalizacao(""); setDepartamento(""); setColaboradorId(""); return; }
    api("colaborador_list", { empresa_id: empresaId }).then((res) => {
      if (res.success) setColaboradores(res.data);
    });
  }, [empresaId, api]);

  const localizacoes = Array.from(new Set(colaboradores.map((c) => c.localizacao).filter(Boolean)));
  const departamentos = Array.from(new Set(colaboradores.map((c) => c.departamento).filter(Boolean)));

  const colaboradoresFiltrados = colaboradores.filter((c) => {
    return (!localizacao || c.localizacao === localizacao) && (!departamento || c.departamento === departamento);
  });

  async function enviar() {
    if (!empresaId) { toast.error("Selecione uma empresa."); return; }
    if (!questId) { toast.error("Selecione um questionario."); return; }
    const destIds = colaboradorId ? [colaboradorId] : colaboradoresFiltrados.map((c) => c.id);
    if (!destIds.length) { toast.error("Nenhum destinatario selecionado."); return; }
    const prefixo = "HUP";
    // eslint-disable-next-line react-hooks/purity
    const sufixo = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codigo = `${prefixo}-${sufixo}`;
    setCodigoGerado(codigo);
    const res = await api("envio_insert", {
      empresa_id: empresaId,
      quest_id: questId,
      codigo,
      data_limite: dataLimite || null,
      colaborador_ids: destIds,
    });
    if (res.success) {
      toast.success(`Questionario enviado para ${destIds.length} colaborador(es)! Codigo: ${codigo}`);
      setMostrarForm(false);
      setEmpresaId("");
      setQuestId("");
      setLocalizacao("");
      setDepartamento("");
      setColaboradorId("");
      setDataLimite("");
      setCodigoGerado("");
      carregar();
    }
  }

  async function reenviar(env: Envio) {
    const res = await api("envio_reenviar", { id: env.id });
    if (res.success) {
      toast.success(`Questionario reenviado com o codigo ${env.codigo}`);
      carregar();
    }
  }

  if (loading) return <div className="text-center py-8 text-secondary font-body-md">A carregar...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-body-sm text-body-sm text-secondary">{envios.length} envio(s)</p>
        <button onClick={() => setMostrarForm(true)} className="bg-primary text-on-primary font-button text-button px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">send</span>
          Novo envio
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Novo envio de questionario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Questionario *</label>
              <select value={questId} onChange={(e) => setQuestId(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
                <option value="">Selecionar questionario</option>
                {questionarios.filter((q) => q.estado === "ativo").map((q) => <option key={q.id} value={q.id}>{q.titulo}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Empresa *</label>
              <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
                <option value="">Selecionar empresa</option>
                {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Localizacao</label>
              <select value={localizacao} onChange={(e) => { setLocalizacao(e.target.value); setColaboradorId(""); }} disabled={!empresaId} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container disabled:opacity-40">
                <option value="">Todas as localizacoes</option>
                {localizacoes.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Departamento</label>
              <select value={departamento} onChange={(e) => { setDepartamento(e.target.value); setColaboradorId(""); }} disabled={!empresaId} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container disabled:opacity-40">
                <option value="">Todos os departamentos</option>
                {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Enviar apenas para (opcional)</label>
              <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} disabled={!empresaId} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container disabled:opacity-40">
                <option value="">Todos os colaboradores filtrados ({colaboradoresFiltrados.length})</option>
                {colaboradoresFiltrados.map((c) => <option key={c.id} value={c.id}>{c.nome} · {c.email} · {c.departamento || "Sem departamento"} · {c.localizacao || "Sem localizacao"}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Data limite (opcional)</label>
              <input type="date" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" />
            </div>
          </div>
          {codigoGerado && (
            <div className="bg-primary-container/30 border border-primary/30 rounded-lg p-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">link</span>
              <div>
                <p className="font-body-sm text-body-sm font-medium">Codigo de acesso: <strong className="text-primary">{codigoGerado}</strong></p>
                <p className="text-[12px] text-secondary">Partilhe este codigo com os colaboradores para acederem ao questionario.</p>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={enviar} className="bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span> Enviar questionario
            </button>
            <button onClick={() => { setMostrarForm(false); setCodigoGerado(""); }} className="border border-outline-variant text-on-surface font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:bg-surface-container transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <Panel title="Envios realizados">
        {envios.length === 0 ? (
          <EmptyState icon="send" title="Nenhum envio realizado." description="Crie um questionario e envie para uma empresa." />
        ) : (
          <div className="space-y-2">
            {envios.map((env) => (
              <div key={env.id} className="rounded-lg border border-outline-variant overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="font-body-md text-body-md font-semibold text-on-surface">{env.quest_nome || "---"}</div>
                    <div className="font-body-sm text-body-sm text-secondary mt-0.5">{env.empresa_nome} &middot; Codigo: <strong>{env.codigo}</strong></div>
                    <div className="font-body-sm text-body-sm text-tertiary">Enviado: {new Date(env.data_envio).toLocaleDateString("pt-PT")}{env.data_limite ? " · Limite: " + new Date(env.data_limite).toLocaleDateString("pt-PT") : ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-headline-md text-headline-md font-semibold text-primary">{env.respostas}/{env.total_colabs}</div>
                    <div className="font-body-sm text-body-sm text-secondary">{env.total_colabs > 0 ? Math.round((env.respostas / env.total_colabs) * 100) : 0}% respondidas</div>
                    <div className="w-24 h-1.5 bg-surface-container rounded-full mt-1 overflow-hidden ml-auto">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${env.total_colabs > 0 ? (env.respostas / env.total_colabs) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button onClick={() => setEnvioExpandido(envioExpandido === env.id ? null : env.id)} className="p-1.5 text-secondary hover:bg-surface-container rounded-lg cursor-pointer" title="Ver destinatarios">
                      <span className="material-symbols-outlined text-[18px]">{envioExpandido === env.id ? "expand_less" : "expand_more"}</span>
                    </button>
                    <button onClick={() => reenviar(env)} className="p-1.5 text-primary hover:bg-primary-container/30 rounded-lg cursor-pointer" title="Reenviar">
                      <span className="material-symbols-outlined text-[18px]">replay</span>
                    </button>
                    <button onClick={async () => { await api("envio_delete", { id: env.id }); carregar(); }} className="p-1.5 text-error hover:bg-error-container/30 rounded-lg cursor-pointer" title="Eliminar">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                {envioExpandido === env.id && (
                  <div className="border-t border-outline-variant px-4 py-3 bg-surface-container/30">
                    <p className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-2">Destinatarios ({env.destinatarios?.length || 0})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {env.destinatarios?.map((d) => (
                        <div key={d.id} className="flex items-center gap-2 text-body-sm">
                          <span className={`w-2 h-2 rounded-full ${d.respondido ? "bg-[#22c55e]" : "bg-surface-container"}`} />
                          <span className="text-on-surface">{d.nome}</span>
                          <span className="text-secondary text-[12px]">{d.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── MENSAGENS ADMIN/CEO ───

export function MensagensAdmin() {
  const api = useAdminApi();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtiva, setEmpresaAtiva] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [unread, setUnread] = useState(0);
  const chatEnd = useRef<HTMLDivElement>(null);

  const carregarEmpresas = useCallback(async () => {
    const res = await fetch("/api/dashboard/empresas").then((r) => r.json());
    if (res.success) setEmpresas(res.empresas || []);
  }, []);

  const carregarMensagens = useCallback(async (empId: string) => {
    if (!empId) return;
    const res = await api("mensagem_list", { empresa_id: empId });
    if (res.success) setMensagens(res.data);
  }, [api]);

  useEffect(() => { carregarEmpresas(); }, [carregarEmpresas]);

  useEffect(() => {
    if (empresaAtiva) carregarMensagens(empresaAtiva);
  }, [empresaAtiva, carregarMensagens]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (empresaAtiva) carregarMensagens(empresaAtiva);
      const res = await api("mensagem_unread_count");
      if (res.success) setUnread(res.count);
    }, 10000);
    return () => clearInterval(interval);
  }, [empresaAtiva, api, carregarMensagens]);

  async function enviarMensagem() {
    if (!empresaAtiva || !texto.trim()) return;
    await api("mensagem_insert", { empresa_id: empresaAtiva, de: "admin", texto: texto.trim() });
    setTexto("");
    carregarMensagens(empresaAtiva);
  }

  async function marcarLidas() {
    if (!empresaAtiva) return;
    await api("mensagem_mark_read", { empresa_id: empresaAtiva });
    carregarMensagens(empresaAtiva);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
      <div className="lg:w-72 flex-shrink-0 border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden flex flex-col">
        <div className="p-4 border-b border-surface-variant flex items-center justify-between">
          <LabelCaps>Conversas</LabelCaps>
          {unread > 0 && <span className="bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">{unread} nova(s)</span>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {empresas.map((emp) => (
            <button
              key={emp.id}
              onClick={() => { setEmpresaAtiva(emp.id); marcarLidas(); }}
              className={`w-full text-left px-4 py-3 border-b border-surface-variant hover:bg-surface-container transition-colors cursor-pointer ${empresaAtiva === emp.id ? "bg-primary-container/20 border-l-3 border-l-primary" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[12px] font-bold">{emp.nome.charAt(0)}</div>
                <span className="font-body-md text-body-md font-medium text-on-surface">{emp.nome}</span>
              </div>
            </button>
          ))}
          {empresas.length === 0 && <div className="text-center py-6 text-secondary text-body-sm">Sem empresas.</div>}
        </div>
      </div>

      <div className="flex-1 border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden flex flex-col">
        {!empresaAtiva ? (
          <div className="flex-1 flex items-center justify-center text-secondary">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2">forum</span>
              <p className="font-body-md">Selecione uma empresa para iniciar conversa</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-surface-variant flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[12px] font-bold">
                {empresas.find((e) => e.id === empresaAtiva)?.nome?.charAt(0) || "?"}
              </div>
              <span className="font-body-md text-body-md font-medium text-on-surface">{empresas.find((e) => e.id === empresaAtiva)?.nome}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mensagens.length === 0 && (
                <div className="text-center py-8 text-secondary">
                  <span className="material-symbols-outlined text-3xl mb-2">chat</span>
                  <p className="font-body-sm">Nenhuma mensagem ainda. Inicie a conversa.</p>
                </div>
              )}
              {mensagens.map((m) => (
                <div key={m.id} className={`flex ${m.de === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl ${m.de === "admin" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"}`}>
                    <p className="font-body-md text-body-md">{m.texto}</p>
                    <p className="text-[11px] mt-1 opacity-60">{new Date(m.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>

            <div className="p-4 border-t border-surface-variant flex gap-2">
              <input value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") enviarMensagem(); }} className="flex-1 border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Escreva uma mensagem..." />
              <button onClick={enviarMensagem} disabled={!texto.trim()} className="bg-primary text-on-primary p-2.5 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><span className="material-symbols-outlined">send</span></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── IMPORTAR COLABORADORES ───

export function ImportarColaboradores() {
  const api = useAdminApi();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState("");
  const [colaboradores, setColaboradores] = useState<{ nome: string; email: string; nif: string; localizacao: string; departamento: string; cargo: string }[]>([]);
  const [resultados, setResultados] = useState<{ nome: string; nif: string; success: boolean; codigo?: string; error?: string }[] | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/empresas").then((r) => r.json()).then((res) => {
      if (res.success) setEmpresas(res.empresas || []);
    });
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) { toast.error("Ficheiro vazio ou formato invalido."); return; }
      const parsed = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        return {
          nome: cols[0] || "",
          email: cols[1] || "",
          nif: cols[2] || "",
          localizacao: cols[3] || "",
          departamento: cols[4] || "",
          cargo: cols[5] || "",
        };
      }).filter((c) => c.nome && c.nif);
      if (!parsed.length) { toast.error("Nenhum colaborador valido encontrado."); return; }
      setColaboradores(parsed);
      toast.success(parsed.length + " colaborador(es) carregados.");
    };
    reader.readAsText(file);
  }

  async function importar() {
    if (!empresaId) { toast.error("Selecione uma empresa."); return; }
    if (!colaboradores.length) { toast.error("Carregue um ficheiro primeiro."); return; }
    const res = await api("colaborador_import", { empresa_id: empresaId, colaboradores });
    if (res.success) {
      setResultados(res.results);
      toast.success("Importacao concluida.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Importar colaboradores</h3>
        <p className="font-body-sm text-body-sm text-secondary">Formato CSV: Nome, Email, NIF, Departamento, Cargo (1 por linha, cabecalho na primeira linha).</p>
        <a
          href="data:text/csv;charset=utf-8,Nome,Email,NIF,Localizacao,Departamento,Cargo%0AAna Silva,ana.silva@empresa.pt,123456789,Porto,Recursos Humanos,Analista%0A"
          download="template_colaboradores.csv"
          className="inline-flex items-center gap-2 text-primary font-body-md text-body-md hover:underline cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Descarregar template CSV
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Empresa</label>
            <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
              <option value="">Selecionar empresa</option>
              {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Ficheiro CSV</label>
            <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-secondary">upload_file</span>
              <span className="font-body-md text-body-md text-secondary">{colaboradores.length ? colaboradores.length + " colaborador(es)" : "Selecionar ficheiro..."}</span>
              <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>

        {colaboradores.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-lg">
            {colaboradores.map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-outline-variant last:border-b-0">
                <span className="material-symbols-outlined text-secondary text-[16px]">person</span>
                <span className="font-body-md text-body-md flex-1">{c.nome}</span>
                <span className="font-body-sm text-body-sm text-secondary">{c.nif}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={importar} disabled={!empresaId || !colaboradores.length} className="bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
          Importar {colaboradores.length} colaborador(es)
        </button>
      </div>

      {resultados && (
        <Panel title="Resultado da importacao">
          <div className="space-y-1">
            {resultados.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${r.success ? "bg-[#dcfce7]/50" : "bg-[#fee2e2]/50"}`}>
                <span className={`material-symbols-outlined text-[16px] ${r.success ? "text-[#166534]" : "text-[#991b1b]"}`}>{r.success ? "check_circle" : "error"}</span>
                <span className="font-body-md text-body-md">{r.nome}</span>
                <span className="font-body-sm text-body-sm text-secondary">{r.nif}</span>
                {r.codigo && <span className="font-body-sm text-body-sm text-primary ml-auto">Codigo: {r.codigo}</span>}
                {r.error && <span className="font-body-sm text-body-sm text-error ml-auto">{r.error}</span>}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ─── RELATORIOS ───

export function RelatoriosEnviados() {
  const api = useAdminApi();
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("envio_list").then((res) => {
      if (res.success) setEnvios(res.data);
      setLoading(false);
    });
  }, [api]);

  if (loading) return <div className="text-center py-8 text-secondary font-body-md">A carregar...</div>;

  return (
    <Panel title="Relatorios dos envios">
      {envios.length === 0 ? (
        <EmptyState icon="analytics" title="Nenhum relatorio disponivel." description="Os relatorios sao gerados apos os questionarios serem respondidos." />
      ) : (
        <div className="space-y-3">
          {envios.map((env) => (
            <div key={env.id} className="flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">{env.quest_nome || "---"}</div>
                  <div className="font-body-sm text-body-sm text-secondary">{env.empresa_nome} &middot; {env.respostas}/{env.total_colabs} respostas</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${env.total_colabs > 0 ? (env.respostas / env.total_colabs) * 100 : 0}%` }} />
                </div>
                <span className="font-body-sm text-body-sm text-secondary min-w-[40px] text-right">{env.total_colabs > 0 ? Math.round((env.respostas / env.total_colabs) * 100) : 0}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── DOCUMENTOS ───

export function DocumentosAdmin() {
  const api = useAdminApi();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("PDF");
  const [descricao, setDescricao] = useState("");
  const [ficheiro, setFicheiro] = useState<File | null>(null);
  const [aCarregar, setACarregar] = useState(false);

  const carregar = useCallback(async () => {
    const res = await api("documento_list");
    if (res.success) setDocumentos(res.data);
  }, [api]);

  useEffect(() => { carregar(); }, [carregar]);

  async function guardar() {
    if (!nome.trim()) { toast.error("Introduza o nome do documento."); return; }
    setACarregar(true);
    try {
      let url = "";
      if (ficheiro) {
        const formData = new FormData();
        formData.append("file", ficheiro);
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const upData = await upRes.json();
        if (!upRes.ok) { toast.error(upData.error || "Erro ao carregar ficheiro."); return; }
        url = upData.url;
      }
      await api("documento_insert", { tipo, nome: nome.trim(), descricao: descricao.trim(), url });
      setMostrarForm(false);
      setNome("");
      setDescricao("");
      setFicheiro(null);
      toast.success("Documento adicionado.");
      carregar();
    } finally {
      setACarregar(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body-sm text-body-sm text-secondary">{documentos.length} documento(s)</p>
        <button onClick={() => setMostrarForm(true)} className="bg-primary text-on-primary font-button text-button px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo documento
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Novo documento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Nome</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: Guia de Lideranca" />
            </div>
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
                <option value="PDF">PDF</option>
                <option value="PPTX">PPTX</option>
                <option value="XLSX">XLSX</option>
                <option value="DOCX">DOCX</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Descricao</label>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Descricao do documento" />
            </div>
            <div className="md:col-span-2">
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Ficheiro *</label>
              <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-secondary">upload_file</span>
                <span className="font-body-md text-body-md text-secondary">{ficheiro ? ficheiro.name : "Selecionar ficheiro..."}</span>
                <input type="file" accept=".pdf,.docx,.xlsx,.pptx,.csv" onChange={(e) => setFicheiro(e.target.files?.[0] || null)} className="hidden" />
              </label>
              <p className="text-[12px] text-secondary mt-1">PDF, DOCX, XLSX, PPTX ou CSV (max 32MB).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={guardar} disabled={aCarregar || !ficheiro} className="bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">{aCarregar ? "A carregar..." : "Adicionar"}</button>
            <button onClick={() => { setMostrarForm(false); setFicheiro(null); }} className="border border-outline-variant text-on-surface font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:bg-surface-container transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <Panel title="Documentos">
        {documentos.length === 0 ? (
          <EmptyState icon="folder" title="Nenhum documento." description="Adicione documentos para partilhar com os CEOs." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documentos.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.tipo === "PDF" ? "bg-[#fee2e2] text-[#991b1b]" : d.tipo === "PPTX" ? "bg-[#dbeafe] text-[#1e40af]" : d.tipo === "XLSX" ? "bg-[#dcfce7] text-[#166534]" : "bg-surface-container text-secondary"}`}>{d.tipo}</span>
                  <div>
                    <p className="font-body-md text-body-md font-medium text-on-surface">{d.nome}</p>
                    {d.descricao && <p className="font-body-sm text-body-sm text-secondary">{d.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 text-primary hover:bg-primary-container/30 rounded-lg cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </a>
                  )}
                  <button onClick={async () => { await api("documento_delete", { id: d.id }); carregar(); }} className="p-1.5 text-error hover:bg-error-container/30 rounded-lg cursor-pointer"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── PACOTES ───

export function PacotesAdmin() {
  const api = useAdminApi();
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");

  const carregar = useCallback(async () => {
    const res = await api("pacote_list");
    if (res.success) setPacotes(res.data);
  }, [api]);

  useEffect(() => { carregar(); }, [carregar]);

  function editar(p: Pacote) {
    setEditando(p.id);
    setNome(p.nome);
    setDescricao(p.descricao);
    setPreco(p.preco);
  }

  async function guardar() {
    if (!nome.trim()) { toast.error("Introduza o nome do pacote."); return; }
    const id = editando || `pacote-${Date.now()}`;
    await api("pacote_upsert", { id, nome: nome.trim(), descricao: descricao.trim(), preco: preco.trim() || "€ 0" });
    setEditando(null);
    setNome("");
    setDescricao("");
    setPreco("");
    toast.success("Pacote guardado.");
    carregar();
  }

  async function eliminar(id: string) {
    if (!confirm("Tem certeza que deseja eliminar este pacote?")) return;
    await api("pacote_delete", { id });
    carregar();
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{editando ? "Editar pacote" : "Novo pacote"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: Essencial" />
          </div>
          <div>
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Preco</label>
            <input value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: € 290" />
          </div>
          <div className="md:col-span-3">
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Descricao</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Descricao do pacote" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={guardar} className="bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
            {editando ? "Atualizar pacote" : "Criar pacote"}
          </button>
          {editando && <button onClick={() => { setEditando(null); setNome(""); setDescricao(""); setPreco(""); }} className="border border-outline-variant text-on-surface font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:bg-surface-container transition-colors">Cancelar</button>}
        </div>
      </div>

      <Panel title="Pacotes / Planos">
        {pacotes.length === 0 ? (
          <EmptyState icon="inventory_2" title="Nenhum pacote configurado." description="Crie pacotes para associar as empresas." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pacotes.map((p) => (
              <div key={p.id} className="p-5 rounded-xl border border-outline-variant hover:border-primary transition-colors">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{p.nome}</h4>
                <p className="font-body-sm text-body-sm text-secondary mb-3">{p.descricao}</p>
                <p className="font-headline-md text-headline-md font-bold text-primary mb-4">{p.preco}</p>
                <div className="flex gap-2">
                  <button onClick={() => editar(p)} className="flex-1 border border-outline-variant text-on-surface font-button text-button py-2 rounded-lg cursor-pointer hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-[16px] align-middle mr-1">edit</span> Editar</button>
                  <button onClick={() => eliminar(p.id)} className="p-2 text-error hover:bg-error-container/30 rounded-lg cursor-pointer"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── DIMENSOES ───

export function DimensoesAdmin() {
  const api = useAdminApi();
  const [dimensoes, setDimensoes] = useState<Dimensao[]>([]);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("gold");
  const [descricao, setDescricao] = useState("");

  const carregar = useCallback(async () => {
    const res = await api("dimensao_list");
    if (res.success) setDimensoes(res.data);
  }, [api]);

  useEffect(() => { carregar(); }, [carregar]);

  async function adicionar() {
    if (!nome.trim()) { toast.error("Introduza o nome da dimensao."); return; }
    const res = await api("dimensao_insert", { nome: nome.trim(), cor, descricao: descricao.trim() });
    if (res.success) {
      setNome("");
      setDescricao("");
      toast.success("Dimensao adicionada.");
      carregar();
    }
  }

  async function eliminar(id: number) {
    await api("dimensao_delete", { id });
    carregar();
  }

  const CORES = [
    { value: "gold", label: "Gold" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
    { value: "orange", label: "Orange" },
    { value: "red", label: "Red" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Adicionar dimensao</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Ex: Bem-estar" />
          </div>
          <div>
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Cor</label>
            <select value={cor} onChange={(e) => setCor(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container">
              {CORES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="font-body-sm text-body-sm text-secondary block mb-1">Descricao</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Descricao" />
          </div>
        </div>
        <button onClick={adicionar} className="bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> Adicionar dimensao
        </button>
      </div>

      <Panel title="Dimensoes da Roda da Vida">
        {dimensoes.length === 0 ? (
          <EmptyState icon="donut_large" title="Nenhuma dimensao configurada." description="As dimensoes sao usadas na Roda da Vida Organizacional." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dimensoes.map((d) => {
              const cores = DIM_CORES[d.cor] || DIM_CORES.gold;
              return (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: cores.bg, border: `1px solid ${cores.border}` }}>
                  <div>
                    <p className="font-body-md text-body-md font-semibold" style={{ color: cores.color }}>{d.nome}</p>
                    {d.descricao && <p className="font-body-sm text-body-sm text-secondary">{d.descricao}</p>}
                  </div>
                  <button onClick={() => eliminar(d.id)} className="p-1.5" style={{ color: cores.color }}>
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── DEFINICOES ───

export function DefinicoesAdmin() {
  const api = useAdminApi();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [passwordNova, setPasswordNova] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.nome) setNome(user.nome);
    if (user?.email) setEmail(user.email);
  }, [user]);

  async function guardar() {
    if (!nome.trim()) { toast.error("Introduza o nome."); return; }
    if (passwordNova) {
      if (passwordNova.length < 12) { toast.error("A nova password deve ter pelo menos 12 caracteres."); return; }
      if (passwordNova !== passwordConfirm) { toast.error("As passwords nao coincidem."); return; }
    }
    setSaving(true);
    const body: Record<string, unknown> = { id: "admin-1", nome: nome.trim(), email: email.trim() };
    if (passwordNova) body.password = passwordNova;
    const res = await api("admin_update", body as any);
    if (res.success) toast.success("Definicoes atualizadas.");
    else toast.error("Erro ao guardar.");
    setSaving(false);
    setPasswordNova("");
    setPasswordConfirm("");
  }

  function forcaPassword(val: string) {
    let score = 0;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  const score = forcaPassword(passwordNova);
  const labels = ["Muito fraca", "Fraca", "Razoavel", "Boa", "Forte"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#22c55e"];

  return (
    <div className="max-w-2xl space-y-6">
      <Panel title="Perfil">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Nome</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" />
            </div>
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Alterar password">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Nova password</label>
              <input type="password" value={passwordNova} onChange={(e) => setPasswordNova(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Min. 12 caracteres" />
              {passwordNova && (
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(score / 4) * 100}%`, background: colors[score] || "#ef4444" }} />
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: colors[score] || "#ef4444" }}>{labels[score] || "Muito fraca"}</p>
                </div>
              )}
            </div>
            <div>
              <label className="font-body-sm text-body-sm text-secondary block mb-1">Confirmar nova password</label>
              <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="w-full border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-container" />
            </div>
          </div>
        </div>
      </Panel>

      <button onClick={guardar} disabled={saving} className="bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? "A guardar..." : "Guardar alteracoes"}
      </button>
    </div>
  );
}
