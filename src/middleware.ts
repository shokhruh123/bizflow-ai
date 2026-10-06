import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n/locale";

const AUTH_PAGES = ["/login", "/register", "/verify"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bf_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isProtected = pathname.startsWith("/app");
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  const res = NextResponse.next();
  if (!request.cookies.get(LOCALE_COOKIE)) {
    res.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register", "/verify"],
};