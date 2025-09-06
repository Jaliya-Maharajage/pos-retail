// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TileButton from "@/components/ui/tile-button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() && !username.trim()) {
      return toast.error("Enter your username or email");
    }

    setLoading(true);
    const r = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), username: username.trim() }),
    });
    setLoading(false);

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return toast.error(err?.error ?? "Failed to send reset email");
    }
    toast.success("If the account exists, a reset link was sent.");
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <TileButton href="/login" variant="outline" className="w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </TileButton>

      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your <b>username</b> or <b>email</b>, and we’ll send you a reset link.
        </p>

        <Input
          type="text"
          placeholder="Your username (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="relative">
          <div className="absolute left-2 top-2 text-xs text-muted-foreground">or</div>
        </div>

        <Input
          type="email"
          placeholder="you@example.com (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </Card>
    </div>
  );
}
