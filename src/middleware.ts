import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  const isAuth = !!req.auth;
  const role = req.auth?.user?.role;

  // Public paths (allow)
  const publicPaths = ["/login", "/register", "/api/auth", "/api/register", "/_next", "/favicon.ico"];
  if (publicPaths.some((p) => path.startsWith(p))) {
    // If already logged in and visiting login/register, bounce to role redirect page
    if (isAuth && (path === "/login" || path === "/register")) {
      return NextResponse.redirect(new URL("/auth/post-login", nextUrl));
    }
    return NextResponse.next();
  }

  // Require auth elsewhere
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Owner-only sections
  if (path.startsWith("/owner") || path.startsWith("/products") || path.startsWith("/reports")) {
    if (role !== "OWNER") {
      return NextResponse.redirect(new URL("/staff", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Don't run on static assets or the NextAuth API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/register).*)"],
};
