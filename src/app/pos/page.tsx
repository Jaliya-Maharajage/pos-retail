"use client"

import type React from "react"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TileButton from "@/components/ui/tile-button"
import { toast } from "sonner"
import { formatLKR } from "@/lib/utils"
import { ArrowLeft, Search, ShoppingCart, User, CreditCard } from "lucide-react"

// Types
type CartItem = { productId: string; name: string; price: number; qty: number }
type Product = { id: string; name: string; price: number }

// Page acts as a wrapper; the component that CALLS useSearchParams is nested under <Suspense>
export default function POSPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      <Suspense fallback={null}>
        <POSContent />
      </Suspense>
    </div>
  )
}

function POSContent() {
  const params = useSearchParams()
  const orderId = params.get("orderId")

  const [pickerOpen, setPickerOpen] = useState(false)
  const [scannerEnabled, setScannerEnabled] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "COD">("CASH")
  const [saleType, setSaleType] = useState<"STORE" | "TAKEAWAY" | "DELIVERY">("STORE")
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Product[]>([])

  useEffect(() => {
    if (!orderId) return
    ;(async () => {
      const r = await fetch(`/api/orders/${orderId}`)
      if (!r.ok) return
      const { order } = await r.json()
      if (order?.items?.length) {
        setItems(
          order.items.map((it: any) => ({
            productId: it.productId,
            name: it.product.name,
            price: Number(it.price),
            qty: it.quantity,
          })),
        )
        setPaymentMethod(order.paymentMethod ?? "CASH")
        setSaleType(order.saleType ?? "STORE")
        setCustomerPhone(order.customer?.phone ?? "")
        setCustomerName(order.customer?.fullName ?? "")
      }
    })()
  }, [orderId])

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])

  function addOrInc(p: Product) {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id)
      if (idx === -1) return [...prev, { productId: p.id, name: p.name, price: p.price, qty: 1 }]
      const copy = [...prev]
      copy[idx].qty += 1
      return copy
    })
  }

  async function fetchAllProducts() {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setResults((data.products ?? []) as Product[])
      setPickerOpen(true)
    } catch {
      toast.error("Error fetching all products")
    }
  }

  function inc(id: string) {
    setItems((prev) => prev.map((i) => (i.productId === id ? { ...i, qty: i.qty + 1 } : i)))
  }

  function dec(id: string) {
    setItems((prev) => prev.map((i) => (i.productId === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0))
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.productId !== id))
  }

  function resetCart() {
    setItems([])
  }

  function resetOrder() {
    setItems([])
    setCustomerName("")
    setCustomerPhone("")
    setPaymentMethod("CASH")
    setSaleType("STORE")
  }

  async function lookupProducts() {
    if (!q.trim()) return
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const list = (data.products ?? []) as Product[]
      setResults(list)
      setPickerOpen(true)
      if (list.length === 0) toast.message("No products found")
    } catch {
      toast.error("Error fetching products")
    }
  }

  // Debounce util (ReturnType fixes Node/browser timeout typing weirdness)
  function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let t: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
      clearTimeout(t)
      t = setTimeout(() => fn(...args), delay)
    }
  }

  const debouncedSearch = debounce(lookupProducts, 500)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value)
    debouncedSearch()
  }

  async function saveCustomerIfAny(): Promise<string> {
    if (!customerPhone && !customerName) return "cust-seed-1"
    const r = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: customerName || "Customer", phone: customerPhone }),
    })
    const { customer } = await r.json()
    return customer.id as string
  }

  async function autodetectCustomerName() {
    if (!customerPhone) return
    const r = await fetch(`/api/customers?phone=${encodeURIComponent(customerPhone)}`)
    const { customer } = await r.json()
    if (customer?.fullName) setCustomerName(customer.fullName)
  }

  async function confirmOrder() {
    if (items.length === 0) return toast.error("Cart is empty")

    const customerId = await saveCustomerIfAny()
    const payload = {
      customerId,
      items: items.map((i) => ({ productId: i.productId, quantity: i.qty, price: i.price })),
      paymentMethod,
      saleType,
      totalAmount: total,
      status: "PAID" as const,
    }

    const method = orderId ? "PUT" : "POST"
    const url = orderId ? `/api/orders/${orderId}` : "/api/orders"
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!r.ok) return toast.error("Failed to save order")

    // const { order } = await r.json();
    toast.success("Order saved")
    resetOrder()
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <TileButton
          href="/auth/post-login"
          variant="outline"
          className="flex items-center gap-2 min-h-[48px] px-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </TileButton>
        <TileButton
          variant={scannerEnabled ? "default" : "outline"}
          onClick={() => setScannerEnabled((v) => !v)}
          className="min-h-[48px] px-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${scannerEnabled ? "bg-green-400" : "bg-gray-400"}`} />
            <span className="font-medium">{scannerEnabled ? "Scanner: ON" : "Scanner: OFF"}</span>
          </div>
        </TileButton>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="xl:col-span-3 p-4 sm:p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Product Search</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  value={q}
                  onChange={handleSearchChange}
                  placeholder="Search products (name/id/barcode)"
                  className="h-12 text-base border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={lookupProducts}
                  className="h-12 px-6 bg-amber-600 hover:bg-amber-700 rounded-xl font-medium"
                >
                  Search
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!pickerOpen) fetchAllProducts()
                    else setPickerOpen(false)
                  }}
                  className="h-12 px-4 sm:px-6 rounded-xl font-medium whitespace-nowrap"
                >
                  {pickerOpen ? "Hide All" : "Show All"}
                </Button>
              </div>
            </div>

            {pickerOpen && (
              <div className="rounded-xl border-2 border-amber-100 max-h-[350px] overflow-auto bg-white/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-amber-50/80 sticky top-0">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-semibold text-gray-700">Product Name</th>
                        <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">Price</th>
                        <th className="p-3 sm:p-4 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((p) => (
                        <tr key={p.id} className="border-t border-amber-100 hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 sm:p-4">
                            <div>
                              <div className="font-medium text-gray-800">{p.name}</div>
                              <div className="text-sm text-amber-600 font-semibold sm:hidden">{formatLKR(p.price)}</div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 font-semibold text-amber-600 hidden sm:table-cell">
                            {formatLKR(p.price)}
                          </td>
                          <td className="p-3 sm:p-4 text-center">
                            <Button
                              size="sm"
                              onClick={() => addOrInc(p)}
                              className="h-10 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                            >
                              Add
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-3 p-4 sm:p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Shopping Cart</h2>
            {items.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50/80">
                <tr>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-700">Item</th>
                  <th className="p-3 sm:p-4 text-center font-semibold text-gray-700">Qty</th>
                  <th className="p-3 sm:p-4 text-right font-semibold text-gray-700 hidden sm:table-cell">Unit</th>
                  <th className="p-3 sm:p-4 text-right font-semibold text-gray-700">Total</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                        <span>No items in cart</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.productId} className="border-t border-blue-100 hover:bg-blue-50/50 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="font-medium text-gray-800">{it.name}</div>
                        <div className="text-sm text-blue-600 font-semibold sm:hidden">{formatLKR(it.price)} each</div>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded-lg font-semibold">{it.qty}</span>
                      </td>
                      <td className="p-3 sm:p-4 text-right font-semibold text-blue-600 hidden sm:table-cell">
                        {formatLKR(it.price)}
                      </td>
                      <td className="p-3 sm:p-4 text-right font-bold text-green-600">{formatLKR(it.price * it.qty)}</td>
                      <td className="p-3 sm:p-4">
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => inc(it.productId)}
                            className="h-8 w-8 p-0 rounded-lg border-green-300 text-green-600 hover:bg-green-50"
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dec(it.productId)}
                            className="h-8 w-8 p-0 rounded-lg border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => remove(it.productId)}
                            className="h-8 px-2 rounded-lg text-xs"
                          >
                            ×
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="xl:col-span-1 p-4 sm:p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Customer</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onBlur={autodetectCustomerName}
                    placeholder="07XXXXXXXX"
                    className="mt-1 h-11 border-2 border-purple-200 focus:border-purple-400 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Customer Name</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Optional"
                    className="mt-1 h-11 border-2 border-purple-200 focus:border-purple-400 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Sale Type</Label>
              <div className="grid grid-cols-1 gap-2">
                {(["STORE", "TAKEAWAY", "DELIVERY"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={saleType === s ? "default" : "secondary"}
                    onClick={() => setSaleType(s)}
                    className="h-12 rounded-lg font-medium transition-all duration-200"
                  >
                    {s === "STORE" ? "🏪 Store Visit" : s === "TAKEAWAY" ? "🥡 Takeaway" : "🚚 Delivery"}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(["CASH", "CARD", "COD"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={paymentMethod === p ? "default" : "secondary"}
                    onClick={() => setPaymentMethod(p)}
                    className="h-12 rounded-lg font-medium transition-all duration-200"
                  >
                    {p === "CASH" ? "💵 Cash" : p === "CARD" ? "💳 Card" : "📦 Cash on Delivery"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex items-center justify-between text-xl font-bold mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <span className="text-gray-700">Total</span>
                <span className="text-green-600">{formatLKR(total)}</span>
              </div>

              <div className="space-y-2">
                <TileButton
                  onClick={confirmOrder}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  💰 Confirm Order
                </TileButton>
                <div className="grid grid-cols-2 gap-2">
                  <TileButton onClick={resetCart} variant="secondary" className="h-12 rounded-lg font-medium">
                    🗑️ Reset Cart
                  </TileButton>
                  <TileButton onClick={resetOrder} variant="outline" className="h-12 rounded-lg font-medium">
                    🔄 Reset All
                  </TileButton>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
