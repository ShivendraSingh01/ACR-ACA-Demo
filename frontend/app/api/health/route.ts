import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "acr-aca-frontend",
    checkedAt: new Date().toISOString()
  });
}

