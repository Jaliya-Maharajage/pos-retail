"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TileButton from "@/components/ui/tile-button";
import { formatLKR } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is used for toast messages

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [cardView, setCardView] = useState(true);
  const router = useRouter();

  // Fetch orders
  async function load() {
    const r = await fetch("/api/orders");
    const { orders } = await r.json();
    setOrders(orders ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  // Delete order
  // Delete order
async function del(id: string) {
  if (!confirm("Are you sure you want to delete this order?")) return;

  try {
    const r = await fetch(`/api/orders/${id}`, {
      method: "DELETE",
    });

    if (!r.ok) {
      toast.error("Error deleting order.");
      return;
    }

    toast.success("Order deleted successfully.");
    load(); // Reload orders after deletion
  } catch (error) {
    toast.error("Error deleting order.");
    console.error("Error deleting order:", error);
  }
}


  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <TileButton href="/auth/post-login" variant="outline">
          Back
        </TileButton>
      </div>

      <div className="max-w-150">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <TileButton onClick={() => setCardView((v) => !v)} variant="default">
          {cardView ? "List View" : "Card View"}
        </TileButton>
      </div>

      {cardView ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-4 space-y-2">
              <div className="text-sm opacity-70">#{o.id.slice(0, 8)} • {new Date(o.createdAt).toLocaleString()}</div>
              <div className="text-sm">Customer: {o.customer?.fullName ?? "-"}</div>
              <div className="text-sm">Mobile: {o.customer?.phone ?? "-"}</div>
              <div className="text-sm">Sale Type: {o.saleType}</div>
              <div className="text-sm">Payment: {o.paymentMethod}</div>
              <div className="text-base font-semibold">Total: {formatLKR(o.totalAmount)}</div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => router.push(`/pos?orderId=${o.id}`)}>
                  Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={() => router.push(`/receipt/${o.id}`)}>
                  View
                </Button>
                <Button size="sm" variant="destructive" onClick={() => del(o.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded border overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Mobile</th>
                <th className="p-2 text-left">Payment</th>
                <th className="p-2 text-left">Sale Type</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">#{o.id.slice(0, 8)}</td>
                  <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="p-2">{o.customer?.fullName ?? "-"}</td>
                  <td className="p-2">{o.customer?.phone ?? "-"}</td>
                  <td className="p-2">{o.paymentMethod}</td>
                  <td className="p-2">{o.saleType}</td>
                  <td className="p-2 text-right">{formatLKR(o.totalAmount)}</td>
                  <td className="p-2">
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => router.push(`/pos?orderId=${o.id}`)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => router.push(`/receipt/${o.id}`)}>
                        View
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => del(o.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
