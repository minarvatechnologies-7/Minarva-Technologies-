import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

const roles = ["SUPER_ADMIN", "ADMIN", "CONTENT_MARKETING"] as const;
const blogSchema = z.object({ title: z.string().trim().min(3).max(180), slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(180), excerpt: z.string().trim().max(500).optional(), content: z.string().trim().min(20), author: z.string().trim().max(120).optional(), category: z.string().trim().max(100).optional() });
const faqSchema = z.object({ question: z.string().trim().min(5).max(300), answer: z.string().trim().min(5).max(3000), category: z.string().trim().max(100).optional() });

export async function GET() {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  const [posts, faqs, projects] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, title: true, slug: true, category: true, publishedAt: true } }),
    prisma.fAQ.findMany({ orderBy: { createdAt: "desc" }, take: 30, select: { id: true, question: true, category: true, published: true } }),
    prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, title: true, slug: true, location: true, published: true } }),
  ]);
  return NextResponse.json({ ok: true, posts, faqs, projects });
}

export async function POST(request: Request) {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  const body = await request.json();
  if (body.kind === "blog") {
    const parsed = blogSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid blog post" }, { status: 400 });
    const post = await prisma.blogPost.create({ data: parsed.data });
    return NextResponse.json({ ok: true, kind: "blog", post }, { status: 201 });
  }
  if (body.kind === "faq") {
    const parsed = faqSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid FAQ" }, { status: 400 });
    const faq = await prisma.fAQ.create({ data: parsed.data });
    return NextResponse.json({ ok: true, kind: "faq", faq }, { status: 201 });
  }
  return NextResponse.json({ ok: false, error: "Unsupported content type" }, { status: 400 });
}
