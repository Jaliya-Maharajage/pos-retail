"use client";

export const dynamic = "force-dynamic"; // avoid prerender issues

import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TileButton from "@/components/ui/tile-button";
import { ArrowLeft } from "lucide-react";

function ResetPasswordInner() {
  const qp = useSearchParams();
  const params = useParams(); // may contain { token }
  const router = useRouter();

  // works with /reset-password?token=XYZ and /reset-password/XYZ
  const token = useMemo(
    () => qp.get("token") || (params?.token as string) || "",
    [qp, params]
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!token || !username.trim() || !password || password !== confirm) return;
    setSubmitting(true);
    const r = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, username: username.trim(), password }),
    });
    setSubmitting(false);
    if (!r.ok) return; // you can show a message if you want
    router.push("/login");
  }

  const missing = !token;

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <TileButton href="/login" variant="outline" className="w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </TileButton>

      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">
          {missing ? "Invalid or Missing Link" : "Set a new password"}
        </h1>

        {missing ? (
          <>
            <p className="text-sm opacity-80">
              Your reset link is invalid or missing. Request a new one:
            </p>
            <Button className="w-full" onClick={() => router.push("/forgot-password")}>
              Go to Forgot Password
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input
                id="username"
                placeholder="owner1 / staff1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">New password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button onClick={submit} disabled={submitting || !username || !password || password !== confirm} className="w-full">
              {submitting ? "Saving..." : "Reset password"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 max-w-md mx-auto">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
