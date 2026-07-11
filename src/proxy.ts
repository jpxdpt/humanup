import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

const ROLE_PREFIXES: Record<string, string> = {
  "/areareservada": "admin",
  "/dashboard/admin": "admin",
  "/dashboard/ceo": "ceo",
  "/dashboard/colaborador": "colaborador",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = Object.entries(ROLE_PREFIXES).find(([prefix]) => pathname.startsWith(prefix))?.[1];
  if (!requiredRole) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || session.role !== requiredRole) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/areareservada/:path*", "/dashboard/:path*"],
};
