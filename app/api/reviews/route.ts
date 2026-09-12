import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().trim().min(3).max(4000),
});

export async function POST(request: Request) {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid review" }, { status: 400 });

    const customer = await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
    if (!customer) return NextResponse.json({ ok: false, error: "Customer profile not found" }, { status: 404 });

    const review = await prisma.review.create({
      data: { customerId: customer.id, rating: parsed.data.rating, feedback: parsed.data.feedback, status: "PENDING" },
      select: { id: true, rating: true, feedback: true, status: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, review }, { status: 201 });
  } catch (error) {
    console.error("review creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to submit review" }, { status: 500 });
  }
}
