// src/app/api/auth/forgot/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY!);
const urlBase = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json(); // can be email OR username
    const id = String(identifier ?? "").trim();
    if (!id) return NextResponse.json({ error: "Username or email required" }, { status: 400 });

    // case-insensitive match on either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: id, mode: "insensitive" } },
          { username: { equals: id, mode: "insensitive" } },
        ],
      },
    });

    // Always respond 200 to avoid user enumeration
    if (!user) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const href = `${urlBase.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM!, // e.g. "POS App <no-reply@yourdomain.com>"
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.fullName ?? user.username},</p>
        <p>Click the button below to reset your password (valid for 30 minutes):</p>
        <p><a href="${href}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none">Reset Password</a></p>
        <p>Or copy this link: ${href}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}
