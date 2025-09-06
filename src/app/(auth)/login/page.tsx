"use client";

import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export const runtime = "nodejs";

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
      callbackUrl: "/auth/post-login", // ✅ use callbackUrl
    });
    setLoading(false);

    if ((res as any)?.error) {
      toast.error("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-300/20 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-dvh grid place-items-center p-4">
        <Card className="w-full max-w-md p-8 space-y-8 bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              POS Login
            </div>
            <div className="text-base text-slate-600 font-medium">
              Welcome back! J-POS Solutions.
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="owner1 or staff1"
                className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Forgot password link (inside form but not a submit) */}
            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                //if you trying to send a email to reset password, change the href to /forgot-password
                prefetch={false}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                className="h-14 w-full text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </Button>

              <Link href="/register" prefetch={false} className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 w-full text-lg font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 transform hover:scale-[1.02] bg-transparent"
                >
                  Register
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
