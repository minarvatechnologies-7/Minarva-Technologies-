import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

const roles = ["SUPER_ADMIN", "ADMIN"] as const;
const productSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(180),
  description: z.string().trim().max(5000).optional(),
  sku: z.string().trim().max(80).optional(),
  isUsed: z.boolean().default(false),
  active: z.boolean().default(true),
  specifications: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export async function GET() {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 100, include: { category: { select: { name: true } } } }),
  ]);
  return NextResponse.json({ ok: true, categories, products });
}

export async function POST(request: Request) {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid product data" }, { status: 400 });
    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        specifications: parsed.data.specifications ?? undefined,
        imageUrls: [],
      },
      include: { category: { select: { name: true } } },
    });
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
