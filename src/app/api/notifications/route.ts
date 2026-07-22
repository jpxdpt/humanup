import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const db = await getDb();

  let rows;
  if (session.role === "admin") {
    rows = await db.query(
      "SELECT * FROM notifications WHERE role = 'admin' ORDER BY created_at DESC LIMIT 50"
    );
  } else if (session.role === "ceo") {
    rows = await db.query(
      "SELECT * FROM notifications WHERE role = 'ceo' AND user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [session.empresaId]
    );
  } else {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const unreadResult = await db.query(
    "SELECT COUNT(*) FROM notifications WHERE role = $1 AND read = false",
    [session.role === "admin" ? "admin" : "ceo"]
  );

  return NextResponse.json({
    notifications: rows.rows,
    unreadCount: Number(unreadResult.rows[0].count),
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem criar notificações" }, { status: 403 });
  }

  const { title, message, type, role, userId } = await request.json();

  if (!title || !message) {
    return NextResponse.json({ error: "title e message são obrigatórios" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.query(
    "INSERT INTO notifications (user_id, role, title, message, type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [userId || null, role || "admin", title, message, type || "info"]
  );

  return NextResponse.json({ notification: result.rows[0] }, { status: 201 });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const body = await request.json();
  const db = await getDb();

  if (body.all) {
    if (session.role === "admin") {
      await db.query("UPDATE notifications SET read = true WHERE role = 'admin'");
    } else if (session.role === "ceo") {
      await db.query(
        "UPDATE notifications SET read = true WHERE role = 'ceo' AND user_id = $1",
        [session.empresaId]
      );
    }
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    const placeholders = body.ids.map((_: number, i: number) => `$${i + 1}`).join(",");
    await db.query(
      `UPDATE notifications SET read = true WHERE id IN (${placeholders})`,
      body.ids
    );
  }

  return NextResponse.json({ success: true });
}
