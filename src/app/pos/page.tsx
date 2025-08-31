"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TileButton from "@/components/ui/tile-button";
import { toast } from "sonner";
import { formatLKR } from "@/lib/utils";

// Types
type CartItem = { productId: string; name: string; price: number; qty: number };
type Product = { id: string; name: string; price: number };

// Page acts as a wrapper; the component that CALLS useSearchParams is nested under <Suspense>
export default function POSPage() {
  return (
    <Suspense fallback={null}>
      <POSContent />
    </Suspense>
  );
}

function POSContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "COD">("CASH");
  const [saleType, setSaleType] = useState<"STORE" | "TAKEAWAY" | "DELIVERY">("STORE");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const r = await fetch(`/api/orders/${orderId}`);
      if (!r.ok) return;
      const { order } = await r.json();
      if (order?.items?.length) {
        setItems(
          order.items.map((it: any) => ({
            productId: it.productId,
            name: it.product.name,
            price: Number(it.price),
            qty: it.quantity,
          }))
        );
        setPaymentMethod(order.paymentMethod ?? "CASH");
        setSaleType(order.saleType ?? "STORE");
        setCustomerPhone(order.customer?.phone ?? "");
        setCustomerName(order.customer?.fullName ?? "");
      }
    })();
  }, [orderId]);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );

  function addOrInc(p: Product) {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id);
      if (idx === -1) return [...prev, { productId: p.id, name: p.name, price: p.price, qty: 1 }];
      const copy = [...prev];
      copy[idx].qty += 1;
      return copy;
    });
  }

  async function fetchAllProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setResults((data.products ?? []) as Product[]);
      setPickerOpen(true);
    } catch {
      toast.error("Error fetching all products");
    }
  }

  function inc(id: string) {
    setItems((prev) => prev.map((i) => (i.productId === id ? { ...i, qty: i.qty + 1 } : i)));
  }

  function dec(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.productId === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.productId !== id));
  }

  function resetCart() {
    setItems([]);
  }

  function resetOrder() {
    setItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("CASH");
    setSaleType("STORE");
  }

  async function lookupProducts() {
    if (!q.trim()) return;
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const list = (data.products ?? []) as Product[];
      setResults(list);
      setPickerOpen(true);
      if (list.length === 0) toast.message("No products found");
    } catch {
      toast.error("Error fetching products");
    }
  }

  // Debounce util (ReturnType fixes Node/browser timeout typing weirdness)
  function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let t: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedSearch = debounce(lookupProducts, 500);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
    debouncedSearch();
  };

  async function saveCustomerIfAny(): Promise<string> {
    if (!customerPhone && !customerName) return "cust-seed-1";
    const r = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: customerName || "Customer", phone: customerPhone }),
    });
    const { customer } = await r.json();
    return customer.id as string;
  }

  async function autodetectCustomerName() {
    if (!customerPhone) return;
    const r = await fetch(`/api/customers?phone=${encodeURIComponent(customerPhone)}`);
    const { customer } = await r.json();
    if (customer?.fullName) setCustomerName(customer.fullName);
  }

  async function confirmOrder() {
    if (items.length === 0) return toast.error("Cart is empty");

    const customerId = await saveCustomerIfAny();
    const payload = {
      customerId,
      items: items.map((i) => ({ productId: i.productId, quantity: i.qty, price: i.price })),
      paymentMethod,
      saleType,
      totalAmount: total,
      status: "PAID" as const,
    };

    const method = orderId ? "PUT" : "POST";
    const url = orderId ? `/api/orders/${orderId}` : "/api/orders";
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return toast.error("Failed to save order");

    // const { order } = await r.json();
    toast.success("Order saved");
    resetOrder();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <TileButton href="/auth/post-login" variant="outline">Back</TileButton>
        <TileButton
          variant={scannerEnabled ? "default" : "outline"}
          onClick={() => setScannerEnabled((v) => !v)}
        >
          {scannerEnabled ? "Scanner Mode: ON" : "Scanner Mode: OFF"}
        </TileButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search + Picker */}
        <Card className="p-4 md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex gap-2">
              <Input
                value={q}
                onChange={handleSearchChange}
                placeholder="Search products (name/id/barcode)"
              />
              <Button onClick={lookupProducts}>Search</Button>
              <Button variant="secondary" onClick={() => {
                if (!pickerOpen) fetchAllProducts();
                else setPickerOpen(false);
              }}>
                {pickerOpen ? "Hide All Products" : "Show All Products"}
              </Button>
            </div>
          </div>

          {pickerOpen && (
            <div className="rounded border max-h-[320px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Price</th>
                    <th className="p-2">Add to Cart</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{formatLKR(p.price)}</td>
                      <td className="p-2 text-center">
                        <Button size="sm" onClick={() => addOrInc(p)}>Add</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Cart */}
        <Card className="p-4 md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Cart Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Total Price</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center opacity-60">No items in the cart.</td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.productId} className="border-t">
                      <td className="p-2">{it.name}</td>
                      <td className="p-2 text-center">{it.qty}</td>
                      <td className="p-2 text-right">{formatLKR(it.price)}</td>
                      <td className="p-2 text-right">{formatLKR(it.price * it.qty)}</td>
                      <td className="p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" variant="outline" onClick={() => inc(it.productId)}>+</Button>
                          <Button size="sm" variant="outline" onClick={() => dec(it.productId)}>-</Button>
                          <Button size="sm" variant="destructive" onClick={() => remove(it.productId)}>Remove</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Customer + Payment */}
        <Card className="p-4 space-y-3">
          <div className="grid gap-2">
            <Label>Customer Mobile</Label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onBlur={autodetectCustomerName}
              placeholder="07XXXXXXXX"
            />
            <Label>Customer Name</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Optional" />
            <Label>Sale Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["STORE", "TAKEAWAY", "DELIVERY"] as const).map((s) => (
                <Button
                  key={s}
                  variant={saleType === s ? "default" : "secondary"}
                  onClick={() => setSaleType(s)}
                  className="h-14"
                >
                  {s === "STORE" ? "Store visit" : s}
                </Button>
              ))}
            </div>
            <Label>Payment</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "CARD", "COD"] as const).map((p) => (
                <Button
                  key={p}
                  variant={paymentMethod === p ? "default" : "secondary"}
                  onClick={() => setPaymentMethod(p)}
                  className="h-14"
                >
                  {p === "COD" ? "Cash on Delivery" : p}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold pt-4">
            <span>Total</span>
            <span>{formatLKR(total)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TileButton onClick={resetCart} variant="secondary">Reset Cart</TileButton>
            <TileButton onClick={confirmOrder}>Confirm Order</TileButton>
            <TileButton onClick={resetOrder} className="col-span-2" variant="outline">Reset Order</TileButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
