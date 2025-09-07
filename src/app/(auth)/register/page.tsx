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
          ? "bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500"
          : "bg-gradient-to-br from-blue-400 via-teal-400 to-green-400"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse transition-colors duration-1000 ${
            role === "OWNER" ? "bg-blue-300" : "bg-teal-300"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 animate-pulse delay-1000 transition-colors duration-1000 ${
            role === "OWNER" ? "bg-emerald-300" : "bg-green-300"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 animate-spin transition-colors duration-1000 ${
            role === "OWNER" ? "bg-cyan-400" : "bg-teal-400"
          }`}
          style={{ animationDuration: "20s" }}
        ></div>
      </div>

      <Card className="w-full max-w-2xl p-8 space-y-6 bg-white border-0 shadow-2xl transition-all duration-700">
        <div className="text-center space-y-2">
          <h1
            className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-700 ${
              role === "OWNER" ? "from-blue-600 to-emerald-600" : "from-blue-500 to-green-500"
            }`}
          >
            Register User
          </h1>
          <p className="text-gray-600 text-base">Register as Owner or Staff</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-3">
            <Label className="text-gray-700 font-medium text-base">Role</Label>
            <Select value={role} onValueChange={(v: Role) => setRole(v)}>
              <SelectTrigger
                className={`h-14 bg-gray-50 border-gray-200 text-gray-900 transition-all duration-300 hover:bg-gray-100 focus:ring-2 ${
                  role === "OWNER" ? "focus:ring-blue-400/50" : "focus:ring-teal-400/50"
                }`}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="OWNER" className="hover:bg-blue-50">
                  Owner
                </SelectItem>
                <SelectItem value="STAFF" className="hover:bg-teal-50">
                  Staff
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={`h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-100 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-blue-400/50" : "focus:ring-teal-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="nic" className="text-gray-700 font-medium">
              NIC
            </Label>
            <Input
              id="nic"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
              className={`h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-100 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-blue-400/50" : "focus:ring-teal-400/50"
              }`}
            />
          </div>

          {role === "OWNER" && (
            <div className="grid gap-3 animate-in slide-in-from-top-2 duration-500">
              <Label htmlFor="ownerCode" className="text-gray-700 font-medium">
                OwnerCode
              </Label>
              <Input
                id="ownerCode"
                value={ownerCode}
                onChange={(e) => setOwnerCode(e.target.value)}
                placeholder="Enter OwnerCode"
                required={role === "OWNER"}
                className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-100 focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          )}

          <div className="grid gap-3">
            <Label htmlFor="mobileNumber" className="text-gray-700 font-medium">
              Mobile Number
            </Label>
            <Input
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              className={`h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-100 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-blue-400/50" : "focus:ring-teal-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-100 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-blue-400/50" : "focus:ring-teal-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="username" className="text-gray-700 font-medium">
              Username (8–10 chars)
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={8}
              maxLength={10}
              required
              className={`h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-100 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-blue-400/50" : "focus:ring-teal-400/50"
              }`}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="password" className="text-gray-700 font-medium">
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
              className={`h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 transition-all duration-300 hover:bg-gray-100 focus:ring-2 ${
                role === "OWNER" ? "focus:ring-blue-400/50" : "focus:ring-teal-400/50"
              }`}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <Button
              type="submit"
              className={`h-16 text-lg rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                role === "OWNER"
                  ? "bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg shadow-blue-500/25"
                  : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg shadow-teal-500/25"
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
                className="h-16 w-full text-lg rounded-2xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 transition-all duration-300 transform hover:scale-105 active:scale-95"
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
