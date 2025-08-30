"use client";

import TileButton from "@/components/ui/tile-button";
import { signOut } from "next-auth/react";

export default function OwnerDashboard() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">Owner Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TileButton href="/products">Products</TileButton>
        <TileButton href="/reports">Reports</TileButton>
        <TileButton href="/pos">POS Cart Screen</TileButton>
        <TileButton href="/orders">Orders</TileButton>
        <TileButton
          onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
          className="bg-destructive hover:bg-destructive/90"
        >
          Logout
        </TileButton>
      </div>
    </div>
  );
}
