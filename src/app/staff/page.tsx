"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, ListOrdered, LogOut, Users } from "lucide-react"

export default function StaffDashboard() {
  const actions = [
    { title: "New Order (POS)", href: "/pos", icon: ShoppingCart, description: "Start new sale" },
    { title: "Orders History", href: "/orders", icon: ListOrdered, description: "View past orders" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Staff Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">Your daily operations center</p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-2xl">
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Quick Actions</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {actions.map(({ title, href, icon: Icon, description }) => (
                <Link key={href} href={href}>
                  <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                    <div className="p-8 text-center space-y-4">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                          {title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">{description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => (window.location.href = "/logout")}
                variant="destructive"
                size="lg"
                className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
