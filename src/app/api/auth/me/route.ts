import { getSessionFromCookies } from "@/lib/auth/http";
import { fail, ok } from "@/lib/auth/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return fail("unauthorized", 401);
  return ok({
    user: {
      id: session.sub,
      email: session.email,
      login: session.login,
      name: session.name,
    },
    expiresAt: session.exp ? session.exp * 1000 : null,
  });
}