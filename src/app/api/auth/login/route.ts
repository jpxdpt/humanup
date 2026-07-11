import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db-server";
import { signSession, SESSION_COOKIE } from "@/lib/jwt";

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
  const body = await request.json();
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
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
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
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
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
    const token = await signSession({
      sub: colab.id,
      role: "colaborador",
      nome: colab.nome,
      email: colab.email,
      empresaId: colab.empresa_id,
      empresaNome: empresa?.nome,
    });
    const res = NextResponse.json({ role: "colaborador", nome: colab.nome, email: colab.email, empresaId: colab.empresa_id, empresaNome: empresa?.nome });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }

  return NextResponse.json({ error: "Role inválida" }, { status: 400 });
}
