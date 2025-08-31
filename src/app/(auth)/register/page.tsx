"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

type Role = "OWNER" | "STAFF";
export const runtime = 'nodejs';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("STAFF");
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ownerCode, setOwnerCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client validation for length constraints
    if (username.length < 8 || username.length > 10) {
      toast.error("Username must be 8–10 characters.");
      return;
    }
    if (password.length < 8 || password.length > 10) {
      toast.error("Password must be 8–10 characters.");
      return;
    }
    if (role === "OWNER" && !ownerCode) {
      toast.error("OwnerCode is required for Owner registration.");
      return;
    }

    try {
      setLoading(true);
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
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      // Success messages required (exact wording)
      if (role === "STAFF") {
        toast.success("Staff User Successfully Regsitered!");
      } else {
        toast.success("Owner User Successfully Regsitered!");
      }

      // Optional: small delay then return to login
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      toast.error("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Register User</h1>
          <p className="text-sm text-muted-foreground">
            Register as Owner or Staff
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Role */}
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v: Role) => setRole(v)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Full Name */}
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* NIC */}
          <div className="grid gap-2">
            <Label htmlFor="nic">NIC</Label>
            <Input
              id="nic"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
          </div>

          {/* Owner Code (only if Owner) */}
          {role === "OWNER" && (
            <div className="grid gap-2">
              <Label htmlFor="ownerCode">OwnerCode</Label>
              <Input
                id="ownerCode"
                value={ownerCode}
                onChange={(e) => setOwnerCode(e.target.value)}
                placeholder="Enter OwnerCode"
                required={role === "OWNER"}
              />
            </div>
          )}

          {/* Mobile */}
          <div className="grid gap-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Username */}
          <div className="grid gap-2">
            <Label htmlFor="username">Username (8–10 chars)</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={8}
              maxLength={10}
              required
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password (8–10 chars)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={10}
              required
            />
          </div>

          {/* Tile buttons */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Button
              type="submit"
              className="h-16 text-lg rounded-2xl"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Now"}
            </Button>

            <Link href="/login" className="block">
              <Button
                type="button"
                variant="secondary"
                className="h-16 w-full text-lg rounded-2xl"
              >
                Back
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
