import { clearSessionCookie } from "@/lib/auth/http";
import { ok } from "@/lib/auth/api";

export async function POST() {
  await clearSessionCookie();
  return ok();
}