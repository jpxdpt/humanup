import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";
import { humanizeKey } from "@/lib/content-utils";

const KEY_REGEX = /^[a-z0-9._-]+$/;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  if (!KEY_REGEX.test(key)) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  const body = (await request.json()) as { value?: unknown };
  if (typeof body.value !== "string") {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const db = await getDb();
  await db.query(
    `INSERT INTO site_content (key, value, label, section)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value, label = EXCLUDED.label, section = EXCLUDED.section`,
    [key, body.value, humanizeKey(key), key.split(".")[0] || "geral"]
  );

  return NextResponse.json({ ok: true });
}
