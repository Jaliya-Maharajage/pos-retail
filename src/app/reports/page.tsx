"use client"; 

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ReportsPage() {
  const [dailySales, setDailySales] = useState<number | null>(null);
  const [weeklySales, setWeeklySales] = useState<number | null>(null);
  const [monthlySales, setMonthlySales] = useState<number | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await res.json();
        setDailySales(data.dailySales || 0);
        setWeeklySales(data.weeklySales || 0);
        setMonthlySales(data.monthlySales || 0);
      } catch (error) {
        toast.error("Failed to load report data");
      }
    }

    fetchReports();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Sales Reports</h1>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Sales Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-xl font-semibold">Daily Sales</h3>
            <p className="text-2xl font-bold">{dailySales ? `LKR ${dailySales.toFixed(2)}` : "Loading..."}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-xl font-semibold">Weekly Sales</h3>
            <p className="text-2xl font-bold">{weeklySales ? `LKR ${weeklySales.toFixed(2)}` : "Loading..."}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-xl font-semibold">Monthly Sales</h3>
            <p className="text-2xl font-bold">{monthlySales ? `LKR ${monthlySales.toFixed(2)}` : "Loading..."}</p>
          </Card>
        </div>
      </Card>
    </div>
  );
}
