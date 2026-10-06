import { createSessionCookie, demoMode } from "@/lib/auth/http";
import { fail, ok, EMAIL_RE } from "@/lib/auth/api";
import { hashOtp, hashPassword, safeEqual } from "@/lib/auth/crypto";
import { generateOtp } from "@/lib/auth/crypto";
import { getDemoUserByEmail, upsertOtp } from "@/lib/auth/store";
import { sendOtpEmail } from "@/lib/auth/mail";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return fail("generic");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!EMAIL_RE.test(email) || !password) return fail("invalidCredentials");

  const user = getDemoUserByEmail(email);
  if (!user || !safeEqual(user.passwordHash, hashPassword(password, user.salt))) {
    return fail("invalidCredentials");
  }

  if (!user.verified) {
    // Automatically issue an OTP so the user can complete verification.
    const code = generateOtp();
    upsertOtp({ email, mode: "register", codeHash: hashOtp(code) });
    await sendOtpEmail({ to: email, code, mode: "register" });
    return fail("notVerified", 403, {
      needsVerification: true,
      ...(demoMode() ? { demoOtp: code } : {}),
    });
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