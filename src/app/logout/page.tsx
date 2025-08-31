"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
export const runtime = 'nodejs';

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" });
  }, []);
  return null;
}
