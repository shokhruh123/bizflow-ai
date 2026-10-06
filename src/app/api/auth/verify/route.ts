import { createSessionCookie } from "@/lib/auth/http";
import { fail, ok } from "@/lib/auth/api";
import { hashOtp } from "@/lib/auth/crypto";
import { consumeOtp, getDemoUserByEmail, setUserVerified } from "@/lib/auth/store";

export async function POST(request: Request) {
  let body: { email?: string; code?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return fail("generic");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const code = (body.code ?? "").trim();
  const mode = body.mode === "login" ? "login" : "register";

  if (!email || !code) return fail("required");
  if (!/^\d{6}$/.test(code)) return fail("invalidCode");

  const status = consumeOtp(email, hashOtp(code));
  if (status === "invalid") return fail("invalidCode");
  if (status === "expired") return fail("expiredCode");
  if (status === "locked") return fail("tooManyAttempts");

  const user = getDemoUserByEmail(email);
  if (!user) return fail("notFound");

  if (mode === "register" || !user.verified) {
    await setUserVerified(email);
  }

  try {
    await createSessionCookie({
      sub: user.id,
      email: user.email,
      login: user.login,
      name: user.name,
    });
  } catch {
    return fail("generic");
  }

  return ok({ user: { id: user.id, email: user.email, login: user.login, name: user.name } });
}