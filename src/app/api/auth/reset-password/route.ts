import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "@/lib/db-server";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  let body: z.infer<typeof resetPasswordSchema>;
  try {
    body = resetPasswordSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { token, password } = body;
  const db = await getDb();

  const tokenResult = await db.query(
    "SELECT * FROM password_reset_tokens WHERE token = $1",
    [token]
  );

  const tokenRow = tokenResult.rows[0] as
    | { email: string; role: string; expires_at: string; used: boolean }
    | undefined;

  if (!tokenRow) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  if (tokenRow.used) {
    return NextResponse.json({ error: "Token já utilizado" }, { status: 400 });
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expirado" }, { status: 400 });
  }

  const hash = bcrypt.hashSync(password, 10);

  if (tokenRow.role === "admin") {
    await db.query("UPDATE admins SET password_hash = $1 WHERE lower(email) = lower($2)", [
      hash,
      tokenRow.email,
    ]);
  } else {
    await db.query("UPDATE empresas SET ceo_password_hash = $1 WHERE lower(ceo_email) = lower($2)", [
      hash,
      tokenRow.email,
    ]);
  }

  await db.query("UPDATE password_reset_tokens SET used = true WHERE token = $1", [token]);

  return NextResponse.json({ ok: true });
}
