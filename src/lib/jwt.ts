import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string;
  role: "admin" | "ceo" | "gestor" | "colaborador";
  nome: string;
  email?: string;
  empresaId?: string;
  empresaNome?: string;
  envioId?: string;
};

function getSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "hup_session";

export function cookieSecure(): boolean {
  return process.env.NODE_ENV === 'production' && !process.env.DISABLE_SECURE_COOKIES;
}
