import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(request: Request) {
  const auth = await requireUser(["SUPER_ADMIN", "ADMIN", "CONTENT_MARKETING"]);
  if (!auth.user) return auth.response!;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid review action" }, { status: 400 });
  const review = await prisma.review.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  return NextResponse.json({ ok: true, review: { id: review.id, status: review.status } });
}
