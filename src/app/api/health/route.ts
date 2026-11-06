import { NextResponse } from "next/server";
import type { HealthResponse } from "@/lib/api/types";

export async function GET() {
  const body: HealthResponse = {
    ok: true,
    service: "realtorsin-web-app",
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body);
}
