"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import TileButton from "@/components/ui/tile-button"
import { TrendingUp, Calendar, DollarSign, ShoppingCart, Users, ArrowLeft } from "lucide-react"

type RangeReport = {
  totalSales: number
  orderCount: number
  orders?: Array<{
    id: string
    createdAt: string
    totalAmount: number
    paymentMethod?: string | null
    saleType?: string | null
    customer?: { fullName?: string | null; phone?: string | null } | null
  }>
}

export default function ReportsPage() {
  const [dailySales, setDailySales] = useState<number | null>(null)
  const [weeklySales, setWeeklySales] = useState<number | null>(null)
  const [monthlySales, setMonthlySales] = useState<number | null>(null)

  // date-range state
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [rangeLoading, setRangeLoading] = useState(false)
  const [rangeReport, setRangeReport] = useState<RangeReport | null>(null)

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports")
        if (!res.ok) throw new Error("Failed to fetch reports")
        const data = await res.json()
        setDailySales(data.dailySales ?? 0)
        setWeeklySales(data.weeklySales ?? 0)
        setMonthlySales(data.monthlySales ?? 0)
      } catch {
        toast.error("Failed to load report data")
      }
    }
    fetchReports()
  }, [])

  async function fetchRange() {
    if (!from || !to) {
      toast.error("Please pick both From and To dates")
      return
    }
    try {
      setRangeLoading(true)
      setRangeReport(null)
      const url = `/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      const r = await fetch(url)
      if (!r.ok) throw new Error()
      const data = await r.json()
      // Expecting { totalSales, orderCount, orders? }
      setRangeReport({
        totalSales: Number(data.totalSales ?? 0),
        orderCount: Number(data.orderCount ?? data.orders?.length ?? 0),
        orders: data.orders ?? [],
      })
    } catch {
      toast.error("Failed to load date-range report")
    } finally {
      setRangeLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <TileButton
              href="/auth/post-login"
              variant="outline"
              className="flex items-center gap-2 hover:bg-white/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </TileButton>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-balance">Sales Reports</h1>
              <p className="text-gray-600 mt-1">Track your business performance and growth</p>
            </div>
          </div>
        </div>

        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Sales Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Today</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Daily Sales</h3>
              <p className="text-2xl font-bold text-gray-900">
                {dailySales !== null ? (
                  `LKR ${dailySales.toFixed(2)}`
                ) : (
                  <span className="animate-pulse bg-gray-200 rounded h-8 w-24 block"></span>
                )}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">7 Days</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Weekly Sales</h3>
              <p className="text-2xl font-bold text-gray-900">
                {weeklySales !== null ? (
                  `LKR ${weeklySales.toFixed(2)}`
                ) : (
                  <span className="animate-pulse bg-gray-200 rounded h-8 w-24 block"></span>
                )}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  30 Days
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Monthly Sales</h3>
              <p className="text-2xl font-bold text-gray-900">
                {monthlySales !== null ? (
                  `LKR ${monthlySales.toFixed(2)}`
                ) : (
                  <span className="animate-pulse bg-gray-200 rounded h-8 w-24 block"></span>
                )}
              </p>
            </Card>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Custom Date Range</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left: date pickers */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <TileButton
                  onClick={fetchRange}
                  disabled={rangeLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
                >
                  {rangeLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    "Get Report"
                  )}
                </TileButton>
                <TileButton
                  variant="outline"
                  onClick={() => {
                    setFrom("")
                    setTo("")
                    setRangeReport(null)
                  }}
                  className="flex-1  hover:bg-gray-50 transition-colors"
                >
                  Clear
                </TileButton>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> You can run multiple date ranges to compare performance across different
                  periods.
                </p>
              </div>
            </div>

            {/* Right: results */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                {rangeReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="text-xl font-bold text-gray-900">{rangeReport.orderCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Total Sales</span>
                      <span className="text-xl font-bold text-green-600">LKR {rangeReport.totalSales.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Select a date range and click "Get Report" to view detailed analytics.
                    </p>
                  </div>
                )}
              </Card>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Order</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 hidden sm:table-cell">Customer</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 hidden md:table-cell">Payment</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 hidden lg:table-cell">Type</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rangeReport?.orders?.length ? (
                        rangeReport.orders.map((o, index) => (
                          <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-900">
                              <div className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500 sm:hidden">#{o.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                #{o.id.slice(0, 8)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900 hidden sm:table-cell">
                              {o.customer?.fullName ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{o.paymentMethod ?? "-"}</td>
                            <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{o.saleType ?? "-"}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-semibold text-gray-900">
                                LKR {Number(o.totalAmount).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center">
                            {rangeLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mr-3"></div>
                                <span className="text-gray-600">Loading orders...</span>
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>No orders found for this date range.</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
