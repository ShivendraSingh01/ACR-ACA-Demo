import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

  try {
    const backendResponse = await fetch(`${backendUrl}/api/info`, {
      cache: "no-store"
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          connected: false,
          backendUrl,
          status: backendResponse.status,
          error: "Backend returned an unsuccessful status."
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      connected: true,
      backendUrl,
      data: await backendResponse.json()
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        backendUrl,
        error: error instanceof Error ? error.message : "Unknown backend error"
      },
      { status: 502 }
    );
  }
}
