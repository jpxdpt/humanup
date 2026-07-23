import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "@/lib/db-server";
import { signSession, SESSION_COOKIE, cookieSecure } from "@/lib/jwt";

const loginSchema = z.object({
  role: z.enum(["admin", "ceo", "colaborador"]),
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  codigo: z.string().min(1).optional(),
  nif: z.string().min(1).optional(),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

interface AdminRow {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
}

interface EmpresaRow {
  id: string;
  nome: string;
  ceo_nome: string;
  ceo_email: string;
  ceo_password_hash: string;
}

interface ColaboradorRow {
  id: string;
  empresa_id: string;
  nome: string;
  email: string;
  nif: string;
  access_code_hash: string;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Demasiadas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { role } = body;
  const db = await getDb();

  if (role === "admin") {
    const { email, password } = body;
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const result = await db.query("SELECT * FROM admins WHERE lower(email) = lower($1)", [email]);
    const admin = result.rows[0] as AdminRow | undefined;
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    const token = await signSession({ sub: admin.id, role: "admin", nome: admin.nome, email: admin.email });
    const res = NextResponse.json({ role: "admin", nome: admin.nome, email: admin.email });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: cookieSecure(), sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }

  if (role === "ceo") {
    const { email, password } = body;
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const result = await db.query("SELECT * FROM empresas WHERE lower(ceo_email) = lower($1)", [email]);
    const empresa = result.rows[0] as EmpresaRow | undefined;
    if (!empresa || !bcrypt.compareSync(password, empresa.ceo_password_hash)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    const token = await signSession({
      sub: empresa.id,
      role: "ceo",
      nome: empresa.ceo_nome,
      email: empresa.ceo_email,
      empresaId: empresa.id,
      empresaNome: empresa.nome,
    });
    const res = NextResponse.json({ role: "ceo", nome: empresa.ceo_nome, email: empresa.ceo_email, empresaId: empresa.id, empresaNome: empresa.nome });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: cookieSecure(), sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }

  if (role === "colaborador") {
    const { codigo, nif } = body;
    if (typeof nif !== "string" || typeof codigo !== "string") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const result = await db.query("SELECT * FROM colaboradores WHERE nif = $1", [nif]);
    const colab = result.rows[0] as ColaboradorRow | undefined;
    if (!colab || !bcrypt.compareSync(codigo.toUpperCase(), colab.access_code_hash)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    const empresaResult = await db.query("SELECT nome FROM empresas WHERE id = $1", [colab.empresa_id]);
    const empresa = empresaResult.rows[0] as { nome: string } | undefined;
    const envioResult = await db.query(
      `SELECT e.id FROM envios e
       JOIN envio_destinatarios ed ON ed.envio_id = e.id
       WHERE e.codigo = $1 AND ed.colaborador_id = $2 AND e.estado = 'aberto'
       ORDER BY e.data_envio DESC LIMIT 1`,
      [codigo.toUpperCase(), colab.id]
    );
    const envioId = envioResult.rows[0]?.id;
    const token = await signSession({
      sub: colab.id,
      role: "colaborador",
      nome: colab.nome,
      email: colab.email,
      empresaId: colab.empresa_id,
      empresaNome: empresa?.nome,
      envioId,
    });
    const res = NextResponse.json({ role: "colaborador", nome: colab.nome, email: colab.email, empresaId: colab.empresa_id, empresaNome: empresa?.nome, envioId });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: cookieSecure(), sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }

  return NextResponse.json({ error: "Role inválida" }, { status: 400 });
}
