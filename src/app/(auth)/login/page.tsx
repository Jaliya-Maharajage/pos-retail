"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export const runtime = 'nodejs';


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: true,
      // Post-login page will redirect by role
      redirectTo: "/auth/post-login",
    });
    setLoading(false);

    if ((res as any)?.error) {
      toast.error("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <div className="text-2xl font-semibold">POS Login</div>
          <div className="text-sm text-muted-foreground">
            Owner & Staff use the same screen
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="owner1 or staff1"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid gap-3">
            {/* Login Button (tile style) */}
            <Button
              type="submit"
              className="h-16 text-lg rounded-2xl"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Register Button (tile style) */}
            <Link href="/register" className="block">
              <Button
                type="button"
                variant="secondary"
                className="h-16 w-full text-lg rounded-2xl"
              >
                Register
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
