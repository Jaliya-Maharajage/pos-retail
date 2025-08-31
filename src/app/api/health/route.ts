import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  let db = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch (e) {
    db = "down";
  }

  let authStatus = "unknown";
  try {
    const session = await auth();
    authStatus = session ? "up:session" : "up:no-session";
  } catch {
    authStatus = "error";
  }

  return NextResponse.json({
    ok: true,
    runtime: "nodejs",
    db,
    auth: authStatus,
    authUrl: process.env.AUTH_URL || process.env.NEXTAUTH_URL || null
  });
}
