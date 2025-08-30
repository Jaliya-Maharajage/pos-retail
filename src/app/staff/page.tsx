"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ShoppingCart, ListOrdered, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  const actions = [
    { title: "New Order (POS)", href: "/pos", icon: ShoppingCart },
    { title: "Orders History", href: "/orders", icon: ListOrdered },
    { title: "Logout", href: "/logout", icon: LogOut },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>

        {/* Tile Buttons Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map(({ title, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center rounded-xl border p-6 text-center shadow-sm hover:shadow-md hover:bg-accent transition"
            >
              <Icon className="w-8 h-8 mb-2 text-primary" />
              <Button className="text-lg font-medium">{title}</Button>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
