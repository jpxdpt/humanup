import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/db-server";

export interface AdminDashboardStats {
  totalEmpresas: number;
  empresasAtivas: number;
  totalColaboradores: number;
  totalEnvios: number;
  faturasPendentes: number;
  totalPorReceber: number;
}

export const getAdminDashboardStats = unstable_cache(
  async (): Promise<AdminDashboardStats> => {
    const db = await getDb();
    const [empresasResult, colabsResult, enviosResult, empresasAtivas] = await Promise.all([
      db.query("SELECT COUNT(*) FROM empresas"),
      db.query("SELECT COUNT(*) FROM colaboradores"),
      db.query("SELECT COUNT(*) FROM envios"),
      db.query("SELECT COUNT(*) FROM empresas WHERE estado = 'ativo'"),
    ]);

    return {
      totalEmpresas: parseInt(empresasResult.rows[0].count),
      empresasAtivas: parseInt(empresasAtivas.rows[0].count),
      totalColaboradores: parseInt(colabsResult.rows[0].count),
      totalEnvios: parseInt(enviosResult.rows[0].count),
      faturasPendentes: 0,
      totalPorReceber: 0,
    };
  },
  ["admin-dashboard-stats"],
  { revalidate: 60, tags: ["admin-dashboard-stats"] }
);

export interface CeoDashboardData {
  empresaId: string;
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

export const getCeoDashboardData = unstable_cache(
  async (empresaId: string, empresaNome: string): Promise<CeoDashboardData> => {
    const db = await getDb();
    const [colaboradoresResult, faturasResult] = await Promise.all([
      db.query(
        "SELECT id, nome, cargo, departamento, estado FROM colaboradores WHERE empresa_id = $1 ORDER BY nome LIMIT 50",
        [empresaId]
      ),
      db.query(
        "SELECT id, referencia, descricao, valor, vencimento, estado FROM faturas WHERE empresa_id = $1 ORDER BY data_emissao DESC LIMIT 50",
        [empresaId]
      ),
    ]);

    const colaboradores = colaboradoresResult.rows;
    const faturas = faturasResult.rows;
    const totalFaturado = faturas
      .filter((f: { estado: string }) => f.estado === "pago")
      .reduce((acc: number, f: { valor: string }) => acc + Number(f.valor), 0);
    const porPagar = faturas
      .filter((f: { estado: string }) => f.estado === "pendente" || f.estado === "em_atraso")
      .reduce((acc: number, f: { valor: string }) => acc + Number(f.valor), 0);

    return {
      empresaId,
      empresaNome,
      colaboradores,
      faturas,
      totalFaturado,
      porPagar,
    };
  },
  ["ceo-dashboard-data"],
  { revalidate: 60, tags: ["ceo-dashboard-data"] }
);
