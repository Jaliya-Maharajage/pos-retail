"use client";
import { formatLKR } from "@/lib/utils";

export default function Receipt80mm({ order }: { order: any }) {
  const items = order?.items ?? [];
  const subtotal = items.reduce((s:number,it:any)=> s + Number(it.price)*it.quantity, 0);
  return (
    <div className="receipt-80mm p-3 text-sm">
      <div className="text-center">
        <div className="text-base font-bold">POS Retail</div>
        <div className="opacity-70">Receipt</div>
        <div className="opacity-70">#{order.id}</div>
        <div className="opacity-70">{new Date(order.createdAt).toLocaleString()}</div>
      </div>
      <div className="mt-2 border-t border-dashed" />
      <div className="mt-2">
        {items.map((it:any)=>(
          <div key={it.id} className="mb-1">
            <div>{it.product.name}</div>
            <div className="flex justify-between">
              <span className="opacity-70">{it.quantity} × {formatLKR(it.price)}</span>
              <span>{formatLKR(Number(it.price) * it.quantity)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-dashed" />
      <div className="mt-2 space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatLKR(subtotal)}</span></div>
        <div className="flex justify-between"><span>Payment</span><span>{order.paymentMethod}</span></div>
        <div className="flex justify-between font-semibold"><span>Total</span><span>{formatLKR(order.totalAmount)}</span></div>
      </div>
      <div className="mt-3 text-center opacity-70">Thank you! Come again.</div>
    </div>
  );
}
