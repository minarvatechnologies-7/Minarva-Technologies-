import { NextResponse } from "next/server";
import { z } from "zod";
import { qualifyRequirement } from "@/lib/ai/qualification";

const schema = z.object({ message: z.string().trim().min(2).max(5000) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid message" }, { status: 400 });
    const qualification = qualifyRequirement(parsed.data.message);
    return NextResponse.json({
      ok: true,
      assistant: "AI assistant",
      disclaimer: "AI-generated guidance is preliminary. A professional site survey may be required for final recommendations.",
      qualification,
    });
  } catch (error) {
    console.error("AI qualification failed", error);
    return NextResponse.json({ ok: false, error: "Unable to qualify requirement" }, { status: 500 });
  }
}
