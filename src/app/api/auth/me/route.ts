import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const session = await verifySession(token);
  if (!session) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      role: session.role,
      nome: session.nome,
      email: session.email,
      empresaId: session.empresaId,
      empresaNome: session.empresaNome,
    },
  });
}
