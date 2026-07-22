import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

const respostasSchema = z.object({
  respostas: z.record(z.string(), z.string()),
});

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

  await db.query(`
    CREATE TABLE IF NOT EXISTS respostas (
      id SERIAL PRIMARY KEY,
      colaborador_id TEXT NOT NULL,
      empresa_id TEXT NOT NULL,
      quest_ref TEXT DEFAULT '',
      respostas JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await db.query(
    "INSERT INTO respostas (colaborador_id, empresa_id, quest_ref, respostas) VALUES ($1, $2, $3, $4)",
    [session.sub, session.empresaId || "", "", JSON.stringify(respostas)]
  );

  return NextResponse.json({ ok: true });
}
