"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TileButton from "@/components/ui/tile-button";
import { formatLKR } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";

type Order = {
  id: string;
  createdAt: string | Date;
  totalAmount: number;
  saleType: string;
  paymentMethod: string;
  customer?: { fullName?: string | null; phone?: string | null } | null;
  items?: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
  }>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cardView, setCardView] = useState(true);

  // View modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const router = useRouter();

  async function load() {
    const r = await fetch("/api/orders");
    if (!r.ok) {
      toast.error("Failed to load orders");
      return;
    }
    const { orders } = await r.json();
    setOrders(orders ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function del(id: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const r = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!r.ok) {
        toast.error("Error deleting order.");
        return;
      }
      toast.success("Order deleted successfully.");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting order.");
    }
  }

  // ----- View modal helpers -----
  async function openView(id: string) {
    setViewOpen(true);
    setViewLoading(true);
    try {
      // We fetch fresh to ensure items/products are included
      const r = await fetch(`/api/orders/${id}`);
      if (!r.ok) throw new Error();
      const { order } = await r.json();
      setSelected(order);
    } catch {
      toast.error("Failed to load order details");
      setViewOpen(false);
      setSelected(null);
    } finally {
      setViewLoading(false);
    }
  }

  function closeView() {
    setViewOpen(false);
    setSelected(null);
  }

  return (
    <div className="p-4 space-y-4 relative">
      <div className="flex items-center justify-between">
        <TileButton href="/auth/post-login" variant="outline">
          <ArrowLeft className="w-4 h-4" />
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
              <div className="text-sm opacity-70">
                #{o.id.slice(0, 8)} • {new Date(o.createdAt).toLocaleString()}
              </div>
              <div className="text-sm">Customer: {o.customer?.fullName ?? "-"}</div>
              <div className="text-sm">Mobile: {o.customer?.phone ?? "-"}</div>
              <div className="text-sm">Sale Type: {o.saleType}</div>
              <div className="text-sm">Payment: {o.paymentMethod}</div>
              <div className="text-base font-semibold">
                Total: {formatLKR(Number(o.totalAmount))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => router.push(`/pos?orderId=${o.id}`)}>
                  Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={() => openView(o.id)}>
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
                  <td className="p-2 text-right">{formatLKR(Number(o.totalAmount))}</td>
                  <td className="p-2">
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => router.push(`/pos?orderId=${o.id}`)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openView(o.id)}>
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

      {/* ------- Floating View Modal ------- */}
      {viewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop with blur (click to close) */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeView}
          />

          {/* Modal Card */}
          <Card className="relative z-10 w-[95%] max-w-2xl max-h-[85vh] overflow-auto p-4 shadow-xl">
            <button
              aria-label="Close"
              onClick={closeView}
              className="absolute right-3 top-3 rounded-full p-2 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-semibold mb-2">Order Details</h3>

            {viewLoading ? (
              <div className="p-6 text-center text-sm opacity-70">Loading…</div>
            ) : !selected ? (
              <div className="p-6 text-center text-sm opacity-70">No order found.</div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm opacity-70">
                  #{selected.id.slice(0, 8)} • {new Date(selected.createdAt).toLocaleString()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <div>Customer: {selected.customer?.fullName ?? "-"}</div>
                    <div>Phone: {selected.customer?.phone ?? "-"}</div>
                  </div>
                  <div>
                    <div>Sale Type: {selected.saleType}</div>
                    <div>Payment: {selected.paymentMethod}</div>
                  </div>
                </div>

                <div className="rounded border overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items?.map((it) => (
                        <tr key={it.id} className="border-t">
                          <td className="p-2">{it.product?.name ?? "-"}</td>
                          <td className="p-2 text-center">{it.quantity}</td>
                          <td className="p-2 text-right">{formatLKR(Number(it.price))}</td>
                          <td className="p-2 text-right">
                            {formatLKR(Number(it.price) * it.quantity)}
                          </td>
                        </tr>
                      ))}
                      {!selected.items?.length && (
                        <tr>
                          <td className="p-3 text-center opacity-60" colSpan={4}>
                            No items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatLKR(Number(selected.totalAmount))}</span>
                </div>

                <div className="flex justify-end">
                  <Button onClick={closeView}>Close</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
