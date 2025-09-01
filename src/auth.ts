// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },

  // Optional: give this app its own cookie name to avoid collisions with other apps on same domain.
  // If TS complains about `cookies`, you can safely remove this block and rely on defaults.
  cookies: {
    sessionToken: {
      name: "pos-retail.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true },
    },
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: { username: {}, password: {} },
      // v5 signature: (credentials, request)
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string" ? credentials.username.trim() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!username || !password) return null;

        // Case-insensitive match to prevent duplicate variants (e.g. "Admin" vs "admin")
        const user = await prisma.user.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Return the shape your app expects (you augmented `User` to include username/role)
        return {
          id: user.id,
          name: user.username,        // NextAuth "name"
          email: user.email ?? null,
          username: user.username,    // your augmentation
          role: user.role,            // your augmentation
        } as any;
      },
    }),
    // Re-add Google/GitHub later if needed; for now keep surface small while debugging.
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On fresh sign-in, overwrite identity fields to prevent stale user tokens
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username ?? (user as any).name;
        token.role = (user as any).role ?? null;
        token._v = Date.now(); // stamp for debugging
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        username: (token.username as string) ?? session.user?.name ?? "",
        role: token.role as any,
      };
      return session;
    },
  },
});
