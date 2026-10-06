import { createHash, randomBytes } from "node:crypto";

export function generateOtp(): string {
  return String(randomBytes(3).readUIntBE(0, 3) % 1_000_000).padStart(6, "0");
}

export function hashOtp(code: string): string {
  return createHash("sha256").update(`bf-otp:${code}`).digest("hex");
}

export function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(`bf:pw:${salt}:${password}`)
    .digest("hex");
}

export function randomSalt(): string {
  return randomBytes(16).toString("hex");
}

/** Constant-time compare to avoid timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}