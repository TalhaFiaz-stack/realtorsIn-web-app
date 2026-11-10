import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth/safe-redirect";
import { AUTH_COOKIE_NAME as AUTH_COOKIE } from "@/lib/auth/session-cookie.constants";

const PUBLIC_PREFIXES = [
  "/welcome",
  "/legal",
  "/p/",
  "/api/health",
  "/_next",
  "/favicon.ico",
];

const PROTECTED_PREFIXES = [
  "/feed",
  "/off-plan",
  "/listings",
  "/create",
  "/connections",
  "/me",
  "/messages",
  "/notifications",
  "/events",
  "/jobs",
  "/properties",
  "/settings",
  "/search",
  "/activities",
  "/stories",
  "/posts",
  "/brokers",
  "/invite",
  "/growth",
  "/map",
  "/u/",
  "/profile",
  "/onboarding",
];

function hasSessionCookie(request: NextRequest): boolean {
  const value = request.cookies.get(AUTH_COOKIE)?.value;
  return Boolean(value && value.trim().length > 0);
}

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The public landing page at "/" is switched off for now: like the admin
  // panel, the root URL goes to the app (signed in) or to the login page.
  // The /feed layout still validates the session, so a stale cookie ends up
  // on /login — and /login never redirects away on cookie alone (no loop).
  // To bring the landing page back, remove this block and re-add
  // `|| pathname === "/"` to the pass-through check below.
  if (pathname === "/") {
    const target = request.nextUrl.clone();
    target.pathname = hasSessionCookie(request) ? "/feed" : "/login";
    target.search = "";
    return NextResponse.redirect(target);
  }

  if (pathname.startsWith("/api/") || startsWithAny(pathname, PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }

  const hasCookie = hasSessionCookie(request);
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);

  if (isProtected && !hasCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "next",
      getSafeNextPath(`${pathname}${request.nextUrl.search}`)
    );
    return NextResponse.redirect(loginUrl);
  }

  // Cookie presence alone must not redirect away from /login — that caused
  // /login ↔ /feed loops when Social profile check failed. Layouts validate.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
