// src/app/reset-password/page.tsx (keep this file if you use ?token=)
// OR use the dynamic segment page below if you prefer /reset-password/[token]

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TileButton from "@/components/ui/tile-button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";


function ResetPasswordInner() {
  const params = useSearchParams();
  const routeParams = useParams(); // will be {} if not using /reset-password/[token]
  const router = useRouter();

  // Prefer query ?token=, else fallback to /reset-password/[token]
  const token = useMemo(() => {
    return params.get("token") || (routeParams?.token as string) || "";
  }, [params, routeParams]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) toast.error("Missing token");
  }, [token]);

  async function submit() {
    if (!token) return toast.error("Missing token");
    if (!username.trim()) return toast.error("Username is required");
    if (!password || password.length < 6) return toast.error("Password too short");
    if (password !== confirm) return toast.error("Passwords do not match");

    setSubmitting(true);
    const r = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, username: username.trim(), password }),
    });
    setSubmitting(false);

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return toast.error(err?.error ?? "Failed to reset password");
    }

    toast.success("Password reset! You can log in now.");
    router.push("/login");
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <TileButton href="/login" variant="outline" className="w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </TileButton>

      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Set a new password</h1>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">Username</label>
          <Input
            id="username"
            placeholder="owner1 / staff1 …"
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

        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting ? "Saving..." : "Reset password"}
        </Button>
      </Card>
    </div>
  );
}
export { default } from "../page";
// export default function ResetPasswordPage() {
//   return (
//     <Suspense fallback={<div className="p-6 max-w-md mx-auto">Loading…</div>}>
//       <ResetPasswordInner />
//     </Suspense>
//   );
// }
