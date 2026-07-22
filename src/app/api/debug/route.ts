import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, unknown> = {
    POSTGRES_URL: process.env.POSTGRES_URL ? "definida" : "EM FALTA",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? "definida" : "EM FALTA",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "definida" : "EM FALTA",
    ADMIN_NAME: process.env.ADMIN_NAME || "nao definido",
    JWT_SECRET: process.env.JWT_SECRET ? "definida" : "EM FALTA",
    NODE_ENV: process.env.NODE_ENV,
  };

  let dbStatus = "nao testado";
  try {
    const { getDb } = await import("@/lib/db-server");
    const pool = await getDb();
    const result = await pool.query("SELECT 1 AS ok");
    dbStatus = result.rows[0]?.ok === 1 ? "OK" : "falhou";
  } catch (err: unknown) {
    dbStatus = err instanceof Error ? err.message : String(err);
  }

  let adminCount = "nao testado";
  try {
    const { getDb } = await import("@/lib/db-server");
    const pool = await getDb();
    const result = await pool.query("SELECT COUNT(*) FROM admins");
    adminCount = result.rows[0]?.count || "0";
  } catch (err: unknown) {
    adminCount = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({ checks, dbStatus, adminCount });
}
