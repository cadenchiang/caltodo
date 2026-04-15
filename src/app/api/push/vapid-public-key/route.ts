/**
 * GET /api/push/vapid-public-key
 *
 * Returns the server's VAPID public key so the client can call
 * PushManager.subscribe() without baking the key into a NEXT_PUBLIC_ env var
 * (avoids accidental key swap on rotation).
 *
 * @returns 200 { key } | 503 if VAPID is not configured.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Push not configured" },
      { status: 503 }
    );
  }
  return NextResponse.json({ key });
}
