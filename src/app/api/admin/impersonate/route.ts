import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db-server";
import { signSession, SESSION_COOKIE, cookieSecure } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { empresa_id, role } = await request.json();
    if (!empresa_id || !["ceo", "gestor"].includes(role)) {
      return NextResponse.json({ success: false, error: "Parâmetros inválidos" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.query("SELECT * FROM empresas WHERE id = $1", [empresa_id]);
    const empresa = result.rows[0];
    if (!empresa) return NextResponse.json({ success: false, error: "Empresa não encontrada" }, { status: 404 });

    const token = await signSession({
      sub: empresa.id,
      role,
      nome: empresa.ceo_nome,
      email: empresa.ceo_email,
      empresaId: empresa.id,
      empresaNome: empresa.nome,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: cookieSecure(), sameSite: "lax", path: "/", maxAge: 60 * 60 });
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
