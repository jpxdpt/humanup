import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

function parsePagination(searchParams: URLSearchParams) {
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 200);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
  return { limit, offset };
}

export async function GET(request: NextRequest) {
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
  const { limit, offset } = parsePagination(request.nextUrl.searchParams);

  if (session.role === "admin") {
    const [empresas, colaboradores, faturas, envios] = await Promise.all([
      db.query("SELECT * FROM empresas ORDER BY nome LIMIT $1 OFFSET $2", [limit, offset]),
      db.query("SELECT * FROM colaboradores ORDER BY nome LIMIT $1 OFFSET $2", [limit, offset]),
      db.query("SELECT * FROM faturas ORDER BY data_emissao DESC LIMIT $1 OFFSET $2", [limit, offset]),
      db.query("SELECT * FROM envios ORDER BY data_envio DESC LIMIT $1 OFFSET $2", [limit, offset]),
    ]);

    const [empresasCount, colaboradoresCount, faturasCount, enviosCount] = await Promise.all([
      db.query("SELECT COUNT(*) FROM empresas"),
      db.query("SELECT COUNT(*) FROM colaboradores"),
      db.query("SELECT COUNT(*) FROM faturas"),
      db.query("SELECT COUNT(*) FROM envios"),
    ]);

    const totalEmpresas = parseInt(empresasCount.rows[0].count);
    const totalAtivas = empresas.rows.filter((e: { estado: string }) => e.estado === "ativo").length;
    const totalColaboradores = parseInt(colaboradoresCount.rows[0].count);

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
      pagination: {
        limit,
        offset,
        empresasCount: totalEmpresas,
        colaboradoresCount: totalColaboradores,
        faturasCount: parseInt(faturasCount.rows[0].count),
        enviosCount: parseInt(enviosCount.rows[0].count),
      },
    });
  }

  if (session.role === "ceo") {
    const empresaId = session.empresaId;
    if (!empresaId) {
      return NextResponse.json({ error: "Empresa não identificada" }, { status: 400 });
    }

    const [colaboradores, faturas, envios] = await Promise.all([
      db.query("SELECT * FROM colaboradores WHERE empresa_id = $1 ORDER BY nome LIMIT $2 OFFSET $3", [empresaId, limit, offset]),
      db.query("SELECT * FROM faturas WHERE empresa_id = $1 ORDER BY data_emissao DESC LIMIT $2 OFFSET $3", [empresaId, limit, offset]),
      db.query("SELECT * FROM envios WHERE empresa_id = $1 ORDER BY data_envio DESC LIMIT $2 OFFSET $3", [empresaId, limit, offset]),
    ]);

    const [colaboradoresCount, faturasCount, enviosCount] = await Promise.all([
      db.query("SELECT COUNT(*) FROM colaboradores WHERE empresa_id = $1", [empresaId]),
      db.query("SELECT COUNT(*) FROM faturas WHERE empresa_id = $1", [empresaId]),
      db.query("SELECT COUNT(*) FROM envios WHERE empresa_id = $1", [empresaId]),
    ]);

    return NextResponse.json({
      colaboradores: colaboradores.rows,
      faturas: faturas.rows,
      envios: envios.rows,
      pagination: {
        limit,
        offset,
        colaboradoresCount: parseInt(colaboradoresCount.rows[0].count),
        faturasCount: parseInt(faturasCount.rows[0].count),
        enviosCount: parseInt(enviosCount.rows[0].count),
      },
    });
  }

  return NextResponse.json({ error: "Role inválida" }, { status: 400 });
}
