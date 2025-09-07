"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TileButton from "@/components/ui/tile-button"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import {AuroraBackground} from "@/components/aurora-background/aurora-background"

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()

    const byUsername = username.trim()
    const byEmail = email.trim()

    if (!byUsername && !byEmail) {
      return toast.error("Enter your username or email")
    }

    const identifier = byUsername || byEmail

    try {
      setLoading(true)
      const r = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      })
      setLoading(false)

      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        return toast.error(err?.error ?? "Failed to send reset email")
      }
      toast.success("If the account exists, a reset link was sent.")
    } catch {
      setLoading(false)
      toast.error("Failed to send reset email")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md space-y-4">
          <TileButton
            href="/login"
            variant="outline"
            className="w-fit backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </TileButton>

          <Card className="p-6 space-y-4 backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <h1 className="text-xl font-semibold text-white">Forgot password</h1>
            <p className="text-sm text-white/80">
              Enter <b>either</b> your username <i>or</i> your email. We'll send a reset link if we find a match.
            </p>

            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-white">Username (optional)</label>
                <Input
                  placeholder="e.g. owner1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-white">Email (optional)</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
