// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const username = String(body.username ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const mobileNumber = String(body.mobileNumber ?? "").trim();
    const nic = String(body.nic ?? "").trim();
    const role = body.role === "OWNER" ? "OWNER" : "STAFF";
    const passwordHash = await bcrypt.hash(String(body.password ?? ""), 10);

    if (!email || !username || !fullName || !mobileNumber || !nic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { email, username, fullName, mobileNumber, nic, role, passwordHash },
    });

    return NextResponse.json({ user: { id: user.id } });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Email or username already in use" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
