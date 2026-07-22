import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-server";

const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
});

export async function POST(request: Request) {
  let body: z.infer<typeof contactSchema>;
  try {
    body = contactSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  const db = await getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await db.query(
    "INSERT INTO mensagens (name, email, subject, message) VALUES ($1, $2, $3, $4)",
    [name, email, subject, message]
  );

  return NextResponse.json({ ok: true, message: "Mensagem enviada com sucesso" });
}
