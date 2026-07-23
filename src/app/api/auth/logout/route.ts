import { NextResponse } from "next/server";
import { SESSION_COOKIE, cookieSecure } from "@/lib/jwt";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: cookieSecure(), sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
