import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const db = await getDb();
  const result = await db.query<{ key: string; value: string; label: string; section: string }>(
    `SELECT key, value, label, section FROM site_content
     WHERE section ILIKE '%imagens%' OR value LIKE '/images/%'
     ORDER BY key`
  );
  return NextResponse.json(result.rows);
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { key } = (await request.json()) as { key?: string };
  if (!key) {
    return NextResponse.json({ error: "Chave obrigatória" }, { status: 400 });
  }

  const db = await getDb();
  await db.query(`UPDATE site_content SET value = '' WHERE key = $1`, [key]);

  return NextResponse.json({ ok: true });
}
