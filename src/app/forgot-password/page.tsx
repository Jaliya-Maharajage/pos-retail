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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();

    const byUsername = username.trim();
    const byEmail = email.trim();

    if (!byUsername && !byEmail) {
      return toast.error("Enter your username or email");
    }

    const identifier = byUsername || byEmail;

    try {
      setLoading(true);
      const r = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      setLoading(false);

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        return toast.error(err?.error ?? "Failed to send reset email");
      }
      toast.success("If the account exists, a reset link was sent.");
    } catch {
      setLoading(false);
      toast.error("Failed to send reset email");
    }
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
          Enter <b>either</b> your username <i>or</i> your email. We’ll send a reset link if we find a match.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Username (optional)</label>
            <Input
              placeholder="e.g. owner1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email (optional)</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
