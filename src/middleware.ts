import { NextResponse } from "next/server";
import { auth } from "@/auth";
export const runtime = 'nodejs';

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  const isAuth = !!req.auth;
  const role = req.auth?.user?.role;

  const publicPrefixes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",        // <-- allow both /reset-password and /reset-password/<token>
    "/api/auth",
    "/api/auth/forgot",       // <-- forgot API
    "/api/auth/reset",        // <-- reset API
    "/api/register",
    "/_next",
    "/favicon.ico",
  ];

  if (publicPrefixes.some((p) => path.startsWith(p))) {
    if (isAuth && (path === "/login" || path === "/register")) {
      return NextResponse.redirect(new URL("/auth/post-login", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (path.startsWith("/owner") || path.startsWith("/products") || path.startsWith("/reports")) {
    if (role !== "OWNER") {
      return NextResponse.redirect(new URL("/staff", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/auth/forgot|api/auth/reset|api/register).*)",
    "/(owner|staff)/:path*",
    "/pos/:path*",
  ],
};
