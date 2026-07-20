import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db-server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";
import { flattenContent, humanizeKey } from "@/lib/content-utils";
import { DEFAULT_IMAGE_KEYS } from "@/lib/content-images";
import { DEFAULT_CONTENT } from "@/lib/content-schema";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const db = await getDb();
  await db.query("TRUNCATE site_content");

  const items = flattenContent(DEFAULT_CONTENT);
  for (const item of items) {
    await db.query(
      "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
      [item.key, item.value, item.label, item.section]
    );
  }

  for (const [key, value] of Object.entries(DEFAULT_IMAGE_KEYS)) {
    await db.query(
      "INSERT INTO site_content (key, value, label, section) VALUES ($1, $2, $3, $4)",
      [key, value, humanizeKey(key), key.split(".")[0] || "imagens"]
    );
  }

  return NextResponse.json({ ok: true });
}
