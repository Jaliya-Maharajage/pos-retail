// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// IMPORTANT: do NOT export GET/POST from here. Export `handlers` instead.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    // These OAuth providers auto-enable if you add env vars in Vercel
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [Google] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [GitHub] : []),

    // Keep your credentials provider
    Credentials({
      name: "Credentials",
      credentials: { username: {}, password: {} },
      async authorize(creds) {
        if (!creds?.username || !creds?.password) return null;
        const user = await prisma.user.findUnique({
          where: { username: String(creds.username) }
        });
        if (!user) return null;
        const ok = await bcrypt.compare(String(creds.password), user.passwordHash);
        return ok ? { id: user.id, name: user.username, email: user.email, role: user.role } : null;
      }
    }),
  ],

  // Keep your callbacks as-is if you already have them
  // callbacks: {
  //   async jwt({ token, user }) { ... },
  //   async session({ session, token }) { ... }
  // },
});

// DO NOT put `export const runtime = 'nodejs'` here.
// Put runtime in the API route file (below).
