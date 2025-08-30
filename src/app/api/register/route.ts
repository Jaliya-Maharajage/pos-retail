import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for Prisma

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, nic, mobileNumber, email, username, password, role, ownerCode } = body || {};

    if (!email || !password || !username || !fullName || !nic || !mobileNumber || !role) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // OPTIONAL: gate owner registration behind a simple code (customize as needed)
    if (role === "OWNER") {
      const REQUIRED_CODE = process.env.OWNER_REG_CODE;
      if (REQUIRED_CODE && ownerCode !== REQUIRED_CODE) {
        return NextResponse.json({ ok: false, error: "Invalid owner registration code" }, { status: 403 });
      }
    }

    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email or username already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        nic,
        mobileNumber,
        email,
        username,
        passwordHash,
        role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ ok: false, error: "User registration failed" }, { status: 500 });
  }
}
