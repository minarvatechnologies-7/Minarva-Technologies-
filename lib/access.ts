import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@prisma/client";

export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { user: null, response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { user, response: null };
}

export const managementRoles: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "SERVICE_MANAGER",
  "ACCOUNTANT",
  "CONTENT_MARKETING",
];
