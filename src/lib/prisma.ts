import { PrismaClient } from "@prisma/client";

const _global = globalThis as unknown as { __PRISMA__?: PrismaClient };

export const prisma =
  _global.__PRISMA__ ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  _global.__PRISMA__ = prisma;
}

export default prisma;
