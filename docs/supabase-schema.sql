-- HumanUp Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all tables

-- 1. Empresas (Companies)
CREATE TABLE empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  nif TEXT NOT NULL UNIQUE,
  pacote TEXT NOT NULL DEFAULT 'Essencial',
  ncolab INTEGER DEFAULT 0,
  locs TEXT[] DEFAULT '{}',
  deps TEXT[] DEFAULT '{}',
  morada TEXT DEFAULT '',
  valor TEXT DEFAULT '',
  estado TEXT DEFAULT 'ativo',
  ceo JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  expStr TEXT DEFAULT '',
  anos INTEGER DEFAULT 1,
  notas TEXT DEFAULT ''
);

-- 2. Colaboradores (Employees)
CREATE TABLE colaboradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empresa_nome TEXT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  nif TEXT NOT NULL,
  localizacao TEXT DEFAULT '',
  departamento TEXT DEFAULT '',
  cargo TEXT DEFAULT '',
  estado TEXT DEFAULT 'ativo'
);

-- 3. Admins
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT DEFAULT '',
  tel TEXT DEFAULT '',
  pass TEXT NOT NULL,
  pass_temp BOOLEAN DEFAULT true
);

-- 4. Questionários (Surveys)
CREATE TABLE questionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT DEFAULT 'Pulse',
  anonimato TEXT DEFAULT 'Total',
  periodicidade TEXT DEFAULT 'Unico',
  estado TEXT DEFAULT 'rascunho',
  created_at TIMESTAMPTZ DEFAULT now(),
  perguntas JSONB DEFAULT '[]'
);

-- 5. Envios (Survey sendouts)
CREATE TABLE envios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empresa_nome TEXT,
  quest_id UUID REFERENCES questionarios(id),
  quest_nome TEXT,
  codigo TEXT NOT NULL,
  estado TEXT DEFAULT 'ativo',
  data_envio DATE DEFAULT CURRENT_DATE,
  data_limite DATE,
  total INTEGER DEFAULT 0,
  respondidos INTEGER DEFAULT 0
);

-- 6. Respostas (Survey responses)
CREATE TABLE respostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  envio_id UUID REFERENCES envios(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_nif TEXT,
  respostas JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Faturas (Invoices)
CREATE TABLE faturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  empresa_nome TEXT,
  referencia TEXT,
  valor DECIMAL(10,2) DEFAULT 0,
  data_emissao DATE DEFAULT CURRENT_DATE,
  vencimento DATE,
  estado TEXT DEFAULT 'pendente',
  descricao TEXT DEFAULT ''
);

-- 8. Documentos (Documents shared with clients)
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'PDF',
  descricao TEXT DEFAULT '',
  url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Mensagens (Messages admin <-> CEO)
CREATE TABLE mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  de TEXT NOT NULL,
  para TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Plano de Ação (Action Plan)
CREATE TABLE plano_acao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  prioridade TEXT DEFAULT 'normal',
  responsavel TEXT DEFAULT '',
  prazo DATE,
  notas TEXT DEFAULT '',
  estado TEXT DEFAULT 'pendente',
  origem TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Relatórios (Reports)
CREATE TABLE relatorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo JSONB DEFAULT '{}',
  estado TEXT DEFAULT 'rascunho',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE plano_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can see everything
CREATE POLICY "admins_all" ON empresas FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON colaboradores FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON faturas FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON envios FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON questionarios FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON documentos FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON mensagens FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON plano_acao FOR ALL TO anon USING (true);
CREATE POLICY "admins_all" ON relatorios FOR ALL TO anon USING (true);

-- CEO sees only their own company data
CREATE POLICY "ceo_empresa" ON empresas FOR SELECT TO anon USING (true);
CREATE POLICY "ceo_colaboradores" ON colaboradores FOR SELECT TO anon USING (true);
CREATE POLICY "ceo_faturas" ON faturas FOR SELECT TO anon USING (true);
CREATE POLICY "ceo_envios" ON envios FOR SELECT TO anon USING (true);
CREATE POLICY "ceo_mensagens" ON mensagens FOR ALL TO anon USING (true);
CREATE POLICY "ceo_plano_acao" ON plano_acao FOR SELECT TO anon USING (true);
CREATE POLICY "ceo_relatorios" ON relatorios FOR SELECT TO anon USING (true);

-- Insert default admin
INSERT INTO admins (nome, email, cargo, pass, pass_temp)
VALUES ('Diogo Coelho', 'dcoelho@humanup.pt', 'Administrador', 'dcup2026', false);
