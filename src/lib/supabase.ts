import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Tables =
  | "empresas"
  | "colaboradores"
  | "faturas"
  | "envios"
  | "mensagens"
  | "documentos"
  | "relatorios"
  | "respostas"
  | "plano_acao"
  | "admins"
  | "questionarios";
