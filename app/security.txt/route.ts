import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    "Contact: mailto:minarvatechnologies@gmail.com\nExpires: 2027-09-12T00:00:00.000Z\nPreferred-Languages: en\nCanonical: https://www.minarvatechnologies.com/.well-known/security.txt\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
