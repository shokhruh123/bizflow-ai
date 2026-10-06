import { demoMode } from "@/lib/auth/http";
import { fail, ok, EMAIL_RE } from "@/lib/auth/api";
import { hashPassword, hashOtp, randomSalt } from "@/lib/auth/crypto";
import {
  createDemoUser,
  getDemoUserByEmail,
  upsertOtp,
} from "@/lib/auth/store";
import { generateOtp } from "@/lib/auth/crypto";
import { sendOtpEmail } from "@/lib/auth/mail";

export async function POST(request: Request) {
  let body: { login?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return fail("generic");
  }

  const login = (body.login ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!login) return fail("required");
  if (!EMAIL_RE.test(email)) return fail("invalidEmail");
  if (password.length < 6) return fail("weakPassword");
  if (getDemoUserByEmail(email)) return fail("emailTaken");

  const salt = randomSalt();
  const user = await createDemoUser({
    login,
    email,
    passwordHash: hashPassword(password, salt),
    salt,
  });

  const code = generateOtp();
  upsertOtp({ email, mode: "register", codeHash: hashOtp(code) });
  await sendOtpEmail({ to: email, code, mode: "register" });

  return ok({
    user: { id: user.id, email, login },
    ...(demoMode() ? { demoOtp: code } : {}),
    transport: process.env.SMTP_HOST ? "smtp" : "console",
  });
}