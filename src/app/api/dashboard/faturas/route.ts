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
    const result = await db.query("SELECT * FROM faturas ORDER BY data_emissao DESC");
    return NextResponse.json({ faturas: result.rows });
  }

  if (session.role === "ceo") {
    const empresaId = session.empresaId;
    if (!empresaId) {
      return NextResponse.json({ error: "Empresa não identificada" }, { status: 400 });
    }
    const result = await db.query("SELECT * FROM faturas WHERE empresa_id = $1 ORDER BY data_emissao DESC", [empresaId]);
    return NextResponse.json({ faturas: result.rows });
  }

  return NextResponse.json({ error: "Role inválida" }, { status: 400 });
}
