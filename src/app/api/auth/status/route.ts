import { NextResponse } from "next/server";
import { auth } from "@/auth";
export const runtime = "nodejs";
export async function GET() {
  const session = await auth();
  return NextResponse.json({
    authenticated: !!session,
    user: session?.user ?? null
  });
}
