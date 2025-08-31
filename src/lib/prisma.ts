// import { PrismaClient } from "@prisma/client";

// const _global = globalThis as unknown as { __PRISMA__?: PrismaClient };

// export const prisma =
//   _global.__PRISMA__ ??
//   new PrismaClient({
//     log: ["warn", "error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   _global.__PRISMA__ = prisma;
// }

// export default prisma;

// src/lib/prisma.ts
import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
