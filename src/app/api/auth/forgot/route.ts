import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    if (!email && !username) {
      return NextResponse.json(
        { error: "Email or username required" },
        { status: 400 }
      );
    }

    // Look up user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If account exists, reset link sent" },
        { status: 200 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expiry },
    });

    // Build reset link
    const urlBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const href = `${urlBase}/reset-password?token=${encodeURIComponent(token)}`;

    // Send email
    await sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.fullName},</p>
        <p>Click below to reset your password:</p>
        <p><a href="${href}" target="_blank">${href}</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return NextResponse.json({ message: "Reset link sent" });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    );
  }
}
