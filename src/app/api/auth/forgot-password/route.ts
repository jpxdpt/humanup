import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { getDb } from "@/lib/db-server";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "ceo"]),
});

export async function POST(request: Request) {
  let body: z.infer<typeof forgotPasswordSchema>;
  try {
    body = forgotPasswordSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { email, role } = body;
  const db = await getDb();

  const table = role === "admin" ? "admins" : "empresas";
  const emailColumn = role === "admin" ? "email" : "ceo_email";
  const result = await db.query(
    `SELECT 1 FROM ${table} WHERE lower(${emailColumn}) = lower($1)`,
    [email]
  );

  if (Number(result.rowCount) > 0) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      "INSERT INTO password_reset_tokens (email, token, role, expires_at) VALUES ($1, $2, $3, $4)",
      [email, token, role, expiresAt]
    );

    console.log(`[password-reset] Token for ${email} (${role}): ${token}`);
  }

  return NextResponse.json({ ok: true });
}
