export interface Empresa {
  id: string;
  nome: string;
  nif: string;
  pacote: "Essencial" | "Crescimento" | "Enterprise";
  ncolab: number;
  locs: string[];
  deps: string[];
  morada: string;
  valor: string;
  estado: "ativo" | "pendente" | "inativo";
  ceo: {
    nome: string;
    email: string;
    cargo: string;
    tel: string;
    pass: string;
  };
  created_at: string;
  expStr: string;
  anos: number;
}

export interface Colaborador {
  id: string;
  empresa_id: string;
  empresa_nome: string;
  nome: string;
  email: string;
  nif: string;
  localizacao: string;
  departamento: string;
  cargo: string;
  estado: "ativo" | "pendente" | "inativo";
}

export interface Fatura {
  id: string;
  empresa_id: string;
  empresa_nome: string;
  referencia: string;
  valor: number;
  data_emissao: string;
  vencimento: string;
  estado: "pago" | "pendente" | "em_atraso";
  descricao: string;
}

export interface Envio {
  id: string;
  empresa_id: string;
  empresa_nome: string;
  quest_id: string;
  quest_nome: string;
  codigo: string;
  estado: "ativo" | "expirado";
  data_envio: string;
  data_limite: string;
  total: number;
  respondidos: number;
}

export interface Questionario {
  id: string;
  titulo: string;
  tipo: string;
  anonimato: string;
  periodicidade: string;
  perguntas: Pergunta[];
  estado: "rascunho" | "ativo" | "arquivado";
}

export interface Pergunta {
  id: string;
  texto: string;
  tipo: "escala" | "multipla" | "texto" | "nps";
  dimensao: string;
  obrigatoria: boolean;
  opcoes: string[];
}

export interface Admin {
  id?: string;
  nome: string;
  email: string;
  cargo: string;
  tel: string;
  pass: string;
  passTemp?: boolean;
}

// ── Mock Data ──

export const mockEmpresas: Empresa[] = [
  {
    id: "emp-1",
    nome: "TechSolutions SA",
    nif: "501234567",
    pacote: "Crescimento",
    ncolab: 45,
    locs: ["Porto — Sede", "Lisboa — Filial"],
    deps: ["Recursos Humanos", "Tecnologia", "Comercial"],
    morada: "Rua da Alegria, 123, 4000-001 Porto",
    valor: "1500",
    estado: "ativo",
    ceo: { nome: "Maria João Ferreira", email: "mjferreira@techsolutions.pt", cargo: "CEO", tel: "+351 912 345 678", pass: "hup123" },
    created_at: "2025-09-01",
    expStr: "setembro 2026",
    anos: 1,
  },
  {
    id: "emp-2",
    nome: "SaúdePlus Lda",
    nif: "502345678",
    pacote: "Enterprise",
    ncolab: 120,
    locs: ["Braga", "Coimbra", "Faro"],
    deps: ["Clínica", "Administrativo", "Marketing"],
    morada: "Av. Central, 500, 4700-001 Braga",
    valor: "3500",
    estado: "ativo",
    ceo: { nome: "Pedro Santos", email: "psantos@saudeplus.pt", cargo: "Diretor Geral", tel: "+351 913 456 789", pass: "hup456" },
    created_at: "2025-06-15",
    expStr: "junho 2028",
    anos: 3,
  },
  {
    id: "emp-3",
    nome: "InnovaTech Lda",
    nif: "503456789",
    pacote: "Essencial",
    ncolab: 15,
    locs: ["Aveiro"],
    deps: ["Equipa Principal"],
    morada: "Rua da Inovação, 50, 3800-001 Aveiro",
    valor: "800",
    estado: "pendente",
    ceo: { nome: "Ana Costa", email: "acosta@innovatech.pt", cargo: "CEO", tel: "+351 914 567 890", pass: "hup789" },
    created_at: "2026-01-10",
    expStr: "janeiro 2027",
    anos: 1,
  },
];

export const mockColaboradores: Colaborador[] = [
  { id: "col-1", empresa_id: "emp-1", empresa_nome: "TechSolutions SA", nome: "João Silva", email: "jsilva@techsolutions.pt", nif: "123456789", localizacao: "Porto — Sede", departamento: "Tecnologia", cargo: "Desenvolvedor", estado: "ativo" },
  { id: "col-2", empresa_id: "emp-1", empresa_nome: "TechSolutions SA", nome: "Maria Costa", email: "mcosta@techsolutions.pt", nif: "234567890", localizacao: "Lisboa — Filial", departamento: "Comercial", cargo: "Account Manager", estado: "ativo" },
  { id: "col-3", empresa_id: "emp-1", empresa_nome: "TechSolutions SA", nome: "Rui Mendes", email: "rmendes@techsolutions.pt", nif: "345678901", localizacao: "Porto — Sede", departamento: "Recursos Humanos", cargo: "RH Generalista", estado: "ativo" },
  { id: "col-4", empresa_id: "emp-2", empresa_nome: "SaúdePlus Lda", nome: "Carla Sousa", email: "csousa@saudeplus.pt", nif: "456789012", localizacao: "Braga", departamento: "Clínica", cargo: "Enfermeira", estado: "ativo" },
  { id: "col-5", empresa_id: "emp-2", empresa_nome: "SaúdePlus Lda", nome: "Miguel Oliveira", email: "moliveira@saudeplus.pt", nif: "567890123", localizacao: "Coimbra", departamento: "Administrativo", cargo: "Rececionista", estado: "ativo" },
];

export const mockFaturas: Fatura[] = [
  { id: "fat-1", empresa_id: "emp-1", empresa_nome: "TechSolutions SA", referencia: "FT-2026-001", valor: 1500, data_emissao: "2026-01-01", vencimento: "2026-01-31", estado: "pago", descricao: "Pacote Crescimento — Janeiro 2026" },
  { id: "fat-2", empresa_id: "emp-1", empresa_nome: "TechSolutions SA", referencia: "FT-2026-002", valor: 1500, data_emissao: "2026-02-01", vencimento: "2026-02-28", estado: "pendente", descricao: "Pacote Crescimento — Fevereiro 2026" },
  { id: "fat-3", empresa_id: "emp-2", empresa_nome: "SaúdePlus Lda", referencia: "FT-2026-003", valor: 3500, data_emissao: "2026-01-01", vencimento: "2026-01-31", estado: "pago", descricao: "Pacote Enterprise — Janeiro 2026" },
  { id: "fat-4", empresa_id: "emp-2", empresa_nome: "SaúdePlus Lda", referencia: "FT-2026-004", valor: 3500, data_emissao: "2026-02-01", vencimento: "2026-02-28", estado: "pendente", descricao: "Pacote Enterprise — Fevereiro 2026" },
  { id: "fat-5", empresa_id: "emp-2", empresa_nome: "SaúdePlus Lda", referencia: "FT-2026-005", valor: 3500, data_emissao: "2025-11-01", vencimento: "2025-11-30", estado: "em_atraso", descricao: "Pacote Enterprise — Novembro 2025" },
];

export const mockEnvios: Envio[] = [
  { id: "env-1", empresa_id: "emp-1", empresa_nome: "TechSolutions SA", quest_id: "q-1", quest_nome: "Pulse 2026-Q1", codigo: "PULSE-2026-Q1", estado: "ativo", data_envio: "2026-01-15", data_limite: "2026-02-15", total: 45, respondidos: 23 },
  { id: "env-2", empresa_id: "emp-2", empresa_nome: "SaúdePlus Lda", quest_id: "q-1", quest_nome: "Pulse 2026-Q1", codigo: "PULSE-SP-2026", estado: "ativo", data_envio: "2026-01-20", data_limite: "2026-02-20", total: 120, respondidos: 58 },
];

export const mockQuestionarios: Questionario[] = [
  {
    id: "q-1",
    titulo: "Pulse 2026-Q1",
    tipo: "Pulse",
    anonimato: "Total",
    periodicidade: "Trimestral",
    estado: "ativo",
    perguntas: [
      { id: "pq-1", texto: "Sinto-me motivado(a) no meu trabalho atual.", tipo: "escala", dimensao: "Motivação", obrigatoria: true, opcoes: [] },
      { id: "pq-2", texto: "Recomendaria a minha empresa como um bom local para trabalhar.", tipo: "nps", dimensao: "Satisfação", obrigatoria: true, opcoes: [] },
      { id: "pq-3", texto: "A minha carga de trabalho é adequada.", tipo: "escala", dimensao: "Bem-Estar", obrigatoria: true, opcoes: [] },
      { id: "pq-4", texto: "Sinto que sou valorizado(a) pela liderança.", tipo: "escala", dimensao: "Liderança", obrigatoria: true, opcoes: [] },
      { id: "pq-5", texto: "O que poderia melhorar o seu bem-estar no trabalho?", tipo: "texto", dimensao: "Geral", obrigatoria: false, opcoes: [] },
    ],
  },
];

export const mockAdmins: Admin[] = [
  { id: "admin-1", nome: "Diogo Coelho", email: "dcoelho@humanup.pt", cargo: "Administrador", tel: "+351 912 345 678", pass: "dcup2026" },
];

// ── Mock DB Layer (swap to Supabase later) ──

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const db = {
  async get<T>(_table: string, data: T[]): Promise<T[]> {
    await delay(100);
    return data;
  },
  async getById<T extends { id: string }>(_table: string, id: string, data: T[]): Promise<T | null> {
    await delay(50);
    return data.find((d) => d.id === id) || null;
  },
  async insert<T>(_table: string, item: T, data: T[]): Promise<T> {
    await delay(100);
    data.push(item);
    return item;
  },
  async update<T extends { id: string }>(_table: string, id: string, updates: Partial<T>, data: T[]): Promise<T | null> {
    await delay(100);
    const idx = data.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates };
    return data[idx];
  },
  async delete<T extends { id: string }>(_table: string, id: string, data: T[]): Promise<boolean> {
    await delay(50);
    const idx = data.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    data.splice(idx, 1);
    return true;
  },
};
