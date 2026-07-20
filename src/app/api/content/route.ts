import { NextResponse } from "next/server";
import { getDb } from "@/lib/db-server";

export async function GET() {
  const db = await getDb();
  const result = await db.query<{ key: string; value: string }>("SELECT key, value FROM site_content");
  const data = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
  return NextResponse.json(data);
}
