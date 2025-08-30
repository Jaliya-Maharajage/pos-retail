// src/lib/test-prisma.ts
import { prisma } from "./prisma"; // relative import

async function main() {
  console.log("Testing Prisma connection...");

  try {
    // Test query: fetch all users
    const users = await prisma.user.findMany();
    console.log("Users in DB:", users);
  } catch (err) {
    console.error("Prisma query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

// Run main
main();
