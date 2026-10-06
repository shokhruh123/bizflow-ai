import {
  createSessionCookie,
  getSessionFromCookies,
} from "@/lib/auth/http";
import { fail, ok } from "@/lib/auth/api";
import { updateDemoUser } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return fail("unauthorized", 401);

  let body: { name?: string; login?: string };
  try {
    body = await request.json();
  } catch {
    return fail("generic");
  }

  const name = (body.name ?? "").trim().slice(0, 60);
  const login = (body.login ?? "").trim().slice(0, 30);

  if (!name && !login) return fail("required");

  const user = await updateDemoUser(session.sub, { name, login });
  if (!user) return fail("notFound");

  const claims = {
    sub: user.id,
    email: user.email,
    login: user.login,
    name: user.name,
  };

  await createSessionCookie(claims);

  return ok({ user: { id: user.id, email: user.email, login: user.login, name: user.name } });
}