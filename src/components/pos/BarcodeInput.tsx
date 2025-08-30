// src/components/pos/BarcodeInput.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  onFound: (p: { id: string; name: string; price: number }) => void;
  enabled?: boolean;     // when true, focus once on mount and after successful scans
  autoFocus?: boolean;   // optional one-time autofocus
};

export default function BarcodeInput({ onFound, enabled = false, autoFocus = false }: Props) {
  const [code, setCode] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((enabled || autoFocus) && ref.current) {
      // one-time focus on mount; no intervals that steal focus later
      ref.current.focus();
    }
  }, [enabled, autoFocus]);

  async function lookup(barcode: string) {
    try {
      const r = await fetch(`/api/products?barcode=${encodeURIComponent(barcode)}`);
      const { product } = await r.json();
      if (!product) {
        toast.error("Barcode not found");
      } else {
        onFound({ id: product.id, name: product.name, price: Number(product.price) });
        toast.success(`${product.name} added`);
      }
    } catch {
      toast.error("Lookup failed");
    } finally {
      setCode("");
      if (enabled && ref.current) {
        // gently refocus only if scanner mode is enabled
        setTimeout(() => ref.current?.focus(), 0);
      }
    }
  }

  return (
    <Input
      ref={ref}
      value={code}
      onChange={(e) => setCode(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && code.trim()) {
          lookup(code.trim());
        }
      }}
      placeholder='Scan barcode & press Enter'
      className='h-12 text-lg'
    />
  );
}
