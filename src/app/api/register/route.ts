// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { fullName, email, username, password, mobileNumber = "", nic = "", role = "STAFF" } = body || {};

    if (!fullName || !email || !username || !password) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { fullName, email, username, passwordHash, mobileNumber, nic, role },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (err: any) {
    // Prisma unique constraint friendly message
    // P2002 = Unique constraint failed on the {target}
    if (err?.code === "P2002") {
      const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(", ") : "field";
      return NextResponse.json({ ok: false, error: `That ${target} is already in use.` }, { status: 409 });
    }

    console.error("Register error:", err);
    return NextResponse.json({ ok: false, error: "Registration failed" }, { status: 500 });
  }
}
