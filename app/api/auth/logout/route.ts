import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("logout failed", error);
    return NextResponse.json({ ok: false, error: "Unable to sign out" }, { status: 500 });
  }
}
