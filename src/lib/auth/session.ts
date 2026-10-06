import { SignJWT, jwtVerify } from "jose";

const TTL_SECONDS = 2 * 60 * 60; // 2 hours
const COOKIE = "bf_session";

function secretKey(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "demo-insecure-secret-change-me",
  );
}

export interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  login: string;
  exp?: number;
}

export async function createSessionToken(user: SessionClaims): Promise<string> {
  return new SignJWT({ name: user.name, login: user.login, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + TTL_SECONDS)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub || !payload.email) return null;
    return {
      sub: payload.sub,
      email: String(payload.email),
      name: String(payload.name ?? payload.login ?? ""),
      login: String(payload.login ?? payload.email),
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_TTL_SECONDS = TTL_SECONDS;

export function sessionCookieOptions(isProd: boolean) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: TTL_SECONDS,
  };
}