import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const ProductCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().finite().nonnegative("Price must be ≥ 0"),
  categoryId: z.string().min(1, "Category is required"),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";  // Get search query
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { barcode: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    // price can arrive as string from the client; coerce
    const parsed = ProductCreateSchema.safeParse({
      ...json,
      price: typeof json.price === "string" ? Number(json.price) : json.price,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    const data = parsed.data;

    // Ensure category exists to avoid FK error
    const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!cat) {
      return NextResponse.json({ ok: false, error: "Invalid category" }, { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description ?? null,
        barcode: data.barcode ?? null,
        imageUrl: data.imageUrl ?? null,
        categoryId: data.categoryId,
      },
    });

    return NextResponse.json({ ok: true, product: created }, { status: 201 });
  } catch (e: any) {
    // Prisma code mapping
    const message =
      e?.code === "P2003" ? "Invalid category (foreign key)" :
      e?.code === "P2002" ? "Duplicate value" :
      "Server error creating product";
    console.error("PRODUCT_CREATE_ERROR:", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
