import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

const respostasSchema = z.object({
  respostas: z.record(z.string(), z.string()),
});

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session || session.role !== "colaborador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const envioId = searchParams.get("envio_id") || session.envioId;
  if (!envioId) {
    return NextResponse.json({ envio: null });
  }

  const db = await getDb();
  const envioResult = await db.query(
    `SELECT e.*, q.titulo AS quest_nome, q.perguntas
     FROM envios e
     LEFT JOIN questionarios q ON e.quest_id = q.id
     WHERE e.id = $1`,
    [envioId]
  );
  const envio = envioResult.rows[0] || null;
  return NextResponse.json({ envio });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session || session.role !== "colaborador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  let body: z.infer<typeof respostasSchema>;
  try {
    body = respostasSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { respostas } = body;
  const db = await getDb();

  const existing = await db.query(
    "SELECT id FROM respostas WHERE envio_id = $1 AND colaborador_id = $2",
    [session.envioId || null, session.sub]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await db.query(
    "INSERT INTO respostas (envio_id, colaborador_id, empresa_id, quest_ref, respostas) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (envio_id, colaborador_id) DO NOTHING",
    [session.envioId || null, session.sub, session.empresaId || "", "", JSON.stringify(respostas)]
  );

  if (session.envioId) {
    await db.query(
      "UPDATE envio_destinatarios SET respondido = true WHERE envio_id = $1 AND colaborador_id = $2",
      [session.envioId, session.sub]
    );
    await db.query(
      "UPDATE envios SET respostas = respostas + 1 WHERE id = $1",
      [session.envioId]
    );
  }

  if (session.empresaId) {
    revalidateTag("ceo-dashboard-data", "default");
  }

  return NextResponse.json({ ok: true });
}
