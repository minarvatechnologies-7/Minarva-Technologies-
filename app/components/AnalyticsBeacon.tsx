"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const source = searchParams.get("utm_source") || searchParams.get("source") || undefined;
    const campaign = searchParams.get("utm_campaign") || undefined;
    const payload = JSON.stringify({ type: "PAGE_VIEW", path: pathname, source, campaign });
    void fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
