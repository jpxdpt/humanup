import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/jwt";

const ROLE_PREFIXES: Record<string, string> = {
  "/areareservada": "admin",
  "/dashboard/admin": "admin",
  "/dashboard/ceo": "ceo",
  "/dashboard/colaborador": "colaborador",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = Object.entries(ROLE_PREFIXES).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1];

  let response: NextResponse;

  if (!requiredRole) {
    response = NextResponse.next();
  } else {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;

    if (!session || session.role !== requiredRole) {
      const loginUrl = new URL("/login", request.url);
      response = NextResponse.redirect(loginUrl);
    } else {
      response = NextResponse.next();
    }
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob:",
      "font-src 'self' data: https://fonts.gstatic.com https://frontend-cdn.perplexity.ai",
      "connect-src 'self' https:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: ["/areareservada/:path*", "/dashboard/:path*"],
};
