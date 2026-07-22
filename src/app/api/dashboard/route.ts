import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  if (session.role === "colaborador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const db = await getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS envios (
      id SERIAL PRIMARY KEY,
      empresa_id TEXT NOT NULL,
      quest_nome TEXT NOT NULL,
      codigo TEXT NOT NULL,
      estado TEXT DEFAULT 'ativo',
      data_envio DATE DEFAULT CURRENT_DATE,
      data_limite DATE,
      total INTEGER DEFAULT 0,
      respondidos INTEGER DEFAULT 0
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS faturas (
      id SERIAL PRIMARY KEY,
      empresa_id TEXT NOT NULL,
      empresa_nome TEXT DEFAULT '',
      referencia TEXT DEFAULT '',
      valor DECIMAL(10,2) DEFAULT 0,
      data_emissao DATE DEFAULT CURRENT_DATE,
      vencimento DATE,
      estado TEXT DEFAULT 'pendente',
      descricao TEXT DEFAULT ''
    )
  `);

  if (session.role === "admin") {
    const empresas = await db.query("SELECT * FROM empresas ORDER BY nome");
    const colaboradores = await db.query("SELECT * FROM colaboradores ORDER BY nome");
    const faturas = await db.query("SELECT * FROM faturas ORDER BY data_emissao DESC");
    const envios = await db.query("SELECT * FROM envios ORDER BY data_envio DESC");

    const totalEmpresas = empresas.rowCount || 0;
    const totalAtivas = empresas.rows.filter((e: { estado: string }) => e.estado === "ativo").length;
    const totalColaboradores = colaboradores.rowCount || 0;

    const faturasPendentes = faturas.rows.filter((f: { estado: string }) => f.estado === "pendente" || f.estado === "em_atraso");
    const totalFaturasPendentes = faturasPendentes.length;
    const totalPorReceber = faturasPendentes.reduce((acc: number, f: { valor: string }) => acc + Number(f.valor), 0);

    return NextResponse.json({
      empresas: empresas.rows,
      colaboradores: colaboradores.rows,
      faturas: faturas.rows,
      envios: envios.rows,
      aggregados: {
        totalEmpresas,
        totalAtivas,
        totalColaboradores,
        totalFaturasPendentes,
        totalPorReceber,
      },
    });
  }

  if (session.role === "ceo") {
    const empresaId = session.empresaId;
    if (!empresaId) {
      return NextResponse.json({ error: "Empresa não identificada" }, { status: 400 });
    }

    const colaboradores = await db.query("SELECT * FROM colaboradores WHERE empresa_id = $1 ORDER BY nome", [empresaId]);
    const faturas = await db.query("SELECT * FROM faturas WHERE empresa_id = $1 ORDER BY data_emissao DESC", [empresaId]);
    const envios = await db.query("SELECT * FROM envios WHERE empresa_id = $1 ORDER BY data_envio DESC", [empresaId]);

    return NextResponse.json({
      colaboradores: colaboradores.rows,
      faturas: faturas.rows,
      envios: envios.rows,
    });
  }

  return NextResponse.json({ error: "Role inválida" }, { status: 400 });
}
