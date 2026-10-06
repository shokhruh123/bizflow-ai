import { demoMode } from "@/lib/auth/http";
import { fail, ok, EMAIL_RE } from "@/lib/auth/api";
import { hashOtp } from "@/lib/auth/crypto";
import { generateOtp } from "@/lib/auth/crypto";
import { freshOtpNeeded, getDemoUserByEmail, upsertOtp } from "@/lib/auth/store";
import { sendOtpEmail } from "@/lib/auth/mail";

export async function POST(request: Request) {
  let body: { email?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return fail("generic");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const mode = body.mode === "login" ? "login" : "register";
  if (!EMAIL_RE.test(email)) return fail("invalidEmail");

  if (mode === "login") {
    const user = getDemoUserByEmail(email);
    if (!user) return fail("notFound");
  }

  if (!freshOtpNeeded(email, mode)) {
    // In demo mode there is no real mailbox, so never deadlock the user:
    // always issue a fresh code instead of refusing with 429.
    if (!demoMode()) return fail("otpSent", 429);
  }

  const code = generateOtp();
  upsertOtp({ email, mode, codeHash: hashOtp(code) });
  await sendOtpEmail({ to: email, code, mode });

  return ok({ sent: true, ...(demoMode() ? { demoOtp: code } : {}) });
}