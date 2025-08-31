import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // good on Vercel
  session: { strategy: "jwt" },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),

    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
          }),
        ]
      : []),

    Credentials({
      name: "Credentials",
      credentials: { username: {}, password: {} },
      async authorize(credentials, _request) {
        // Basic guards
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string")
          return null;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // MUST satisfy your augmented `User` type:
        // include `username` and `role` (and the default fields)
        return {
          id: user.id,
          name: user.username, // NextAuth's default field
          email: user.email,
          username: user.username, // <-- required by your augmentation
          role: user.role as UserRole, // <-- required by your augmentation
          // image: undefined,            // optional
        };
      },
    }),
  ],

  // callbacks: { jwt, session } // keep yours if you already add role/username to token+session
});
