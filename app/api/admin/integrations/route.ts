import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { integrationStatus, integrations } from "@/lib/integrations";

export async function GET() {
  const auth = await requireUser(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.user) return auth.response!;

  return NextResponse.json({
    ok: true,
    integrations: Object.fromEntries(
      Object.entries(integrations).map(([key, value]) => [
        key,
        { name: value.name, status: integrationStatus(process.env[value.env]) },
      ]),
    ),
  });
}
