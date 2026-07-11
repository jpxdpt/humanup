import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";
import { DEFAULT_CONTENT } from "@/lib/content-schema";

export async function GET() {
  const db = await getDb();
  const result = await db.query("SELECT data FROM site_content WHERE id = 1");
  const row = result.rows[0] as { data: unknown } | undefined;
  if (!row) return NextResponse.json(DEFAULT_CONTENT);
  return NextResponse.json(row.data);
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const db = await getDb();
  await db.query("UPDATE site_content SET data = $1 WHERE id = 1", [JSON.stringify(body)]);
  return NextResponse.json({ ok: true });
}
