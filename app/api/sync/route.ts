import { NextRequest, NextResponse } from "next/server";
import { put, head, del } from "@vercel/blob";

const BLOB_KEY = "nwb-sync/state.json";

function authorized(req: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

/** Read the current sync state. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blob = await head(BLOB_KEY);
    const res = await fetch(blob.url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // No blob yet — return empty state
    return NextResponse.json(null, { status: 204 });
  }
}

/** Write the sync state (full replace). */
export async function PUT(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await put(BLOB_KEY, JSON.stringify(body), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
