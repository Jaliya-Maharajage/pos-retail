"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"

type Role = "OWNER" | "STAFF"
export const runtime = "nodejs"

export default function RegisterPage() {
  const router = useRouter()

  const [role, setRole] = useState<Role>("STAFF")
  const [fullName, setFullName] = useState("")
  const [nic, setNic] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [ownerCode, setOwnerCode] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic client validation for length constraints
    if (username.length < 8 || username.length > 10) {
      toast.error("Username must be 8–10 characters.")
      return
    }
    if (password.length < 8 || password.length > 10) {
      toast.error("Password must be 8–10 characters.")
      return
    }
    if (role === "OWNER" && !ownerCode) {
      toast.error("OwnerCode is required for Owner registration.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          fullName,
          nic,
          mobileNumber,
          email,
          username,
          password,
          ownerCode: role === "OWNER" ? ownerCode : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "Registration failed")
        setLoading(false)
        return
      }

      // Success messages required (exact wording)
      if (role === "STAFF") {
        toast.success("Staff User Successfully Regsitered!")
      } else {
        toast.success("Owner User Successfully Regsitered!")
      }

      // Optional: small delay then return to login
      setTimeout(() => {
        router.push("/login")
      }, 1200)
    } catch {
      toast.error("Server error, please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`min-h-dvh grid place-items-center p-4 relative overflow-hidden transition-all duration-1000 ${
        role === "OWNER"
          ? "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500"
          : "bg-gradient-to-br from-orange-400 via-yellow-400 to-amber-400"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse transition-colors duration-1000 ${
            role === "OWNER" ? "bg-red-300" : "bg-orange-300"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 animate-pulse delay-1000 transition-colors duration-1000 ${
            role === "OWNER" ? "bg-yellow-300" : "bg-amber-300"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 animate-spin transition-colors duration-1000 ${
            role === "OWNER" ? "bg-orange-400" : "bg-yellow-400"
          }`}
          style={{ animationDuration: "20s" }}
        ></div>
      </div>

      <Card
        className={`w-full max-w-2xl p-8 space-y-6 backdrop-blur-xl border-0 shadow-2xl transition-all duration-700 ${
          role === "OWNER" ? "bg-white/10 shadow-red-500/20" : "bg-white/15 shadow-orange-500/20"
        }`}
      >
        <div className="text-center space-y-2">
          <h1
            className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-700 ${
              role === "OWNER" ? "from-red-100 to-yellow-100" : "from-orange-100 to-amber-100"
            }`}
          >
            Register User
          </h1>
          <p className="text-white/80 text-base">Choose your Role and Register!</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-3">
            <Label className="text-white/90 font-medium text-base">Role</Label>
            <Select value={role} onValueChange={(v: Role) => setRole(v)}>
              <SelectTrigger
                className={`h-14 bg-white/10 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 ${
                  role === "OWNER" ? "focus:ring-red-400/50" : "focus:ring-orange-400/50"
                }`}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                <SelectItem value="OWNER" className="hover:bg-red-50">
                  Owner
                </SelectItem>
                <SelectItem value="STAFF" className="hover:bg-orange-50">
                  Staff
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="fullName" className="text-white/90 font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-red-400/50" : "focus:ring-orange-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="nic" className="text-white/90 font-medium">
              NIC
            </Label>
            <Input
              id="nic"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
              className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-red-400/50" : "focus:ring-orange-400/50"
              }`}
            />
          </div>

          {role === "OWNER" && (
            <div className="grid gap-3 animate-in slide-in-from-top-2 duration-500">
              <Label htmlFor="ownerCode" className="text-white/90 font-medium">
                OwnerCode
              </Label>
              <Input
                id="ownerCode"
                value={ownerCode}
                onChange={(e) => setOwnerCode(e.target.value)}
                placeholder="Enter OwnerCode"
                required={role === "OWNER"}
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 focus:ring-red-400/50"
              />
            </div>
          )}

          <div className="grid gap-3">
            <Label htmlFor="mobileNumber" className="text-white/90 font-medium">
              Mobile Number
            </Label>
            <Input
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-red-400/50" : "focus:ring-orange-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email" className="text-white/90 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-red-400/50" : "focus:ring-orange-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="username" className="text-white/90 font-medium">
              Username (8–10 chars)
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={8}
              maxLength={10}
              required
              className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-red-400/50" : "focus:ring-orange-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="password" className="text-white/90 font-medium">
              Password (8–10 chars)
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={10}
              required
              className={`h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-red-400/50" : "focus:ring-orange-400/50"
              }`}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <Button
              type="submit"
              className={`h-16 text-lg rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                role === "OWNER"
                  ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/25"
                  : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-500/25"
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Registering...
                </div>
              ) : (
                "Register Now"
              )}
            </Button>

            <Link href="/login" className="block">
              <Button
                type="button"
                variant="secondary"
                className="h-16 w-full text-lg rounded-2xl font-semibold bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                Back
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
