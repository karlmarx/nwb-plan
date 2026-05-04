// Auth-gated CRUD for the per-user workout history.
//
// Conflict policy: last-write-wins per session id, by `updated_at`.
// Active / in-progress sessions are NOT pushed here — they stay client-side
// until endSession() runs, then a single PUT lands the finished session.
//
// Routes:
//   GET    /api/workout-sessions[?since=<epoch ms>]
//     → { sessions: WorkoutSession[] } for the signed-in user. `since`
//       filters to rows with updated_at strictly newer than the timestamp
//       (used for incremental pull).
//   PUT    /api/workout-sessions
//     body: { sessions: WorkoutSession[] }
//     → upserts each session. Returns { upserted: number, skipped: number }.
//       Skipped = stored row's updated_at is newer than incoming.
//   DELETE /api/workout-sessions?id=<session-id>
//     → tombstone delete (idempotent).

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { auth } from "@/lib/auth";
import type { WorkoutSession } from "@/lib/workout-log";

interface SessionRow {
  id: string;
  workout_key: string;
  started_at: string; // numeric → string from pg
  ended_at: string | null;
  data: WorkoutSession;
  updated_at: string; // ISO timestamp
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { email?: string } | undefined)?.email;
  if (!session || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam ? Number(sinceParam) : null;

  let rows;
  if (since != null && Number.isFinite(since)) {
    rows = await sql<SessionRow>`
      SELECT id, workout_key, started_at, ended_at, data, updated_at
        FROM workout_sessions
       WHERE user_id = ${userId}
         AND EXTRACT(EPOCH FROM updated_at) * 1000 > ${since}
       ORDER BY started_at DESC
    `;
  } else {
    rows = await sql<SessionRow>`
      SELECT id, workout_key, started_at, ended_at, data, updated_at
        FROM workout_sessions
       WHERE user_id = ${userId}
       ORDER BY started_at DESC
    `;
  }

  return NextResponse.json({
    sessions: rows.rows.map((r) => r.data),
    serverNow: Date.now(),
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { email?: string } | undefined)?.email;
  if (!session || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sessions?: WorkoutSession[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = Array.isArray(body.sessions) ? body.sessions : [];
  if (incoming.length === 0) {
    return NextResponse.json({ upserted: 0, skipped: 0 });
  }

  let upserted = 0;
  let skipped = 0;

  for (const ws of incoming) {
    if (!ws.id || !ws.workoutKey || typeof ws.startedAt !== "number") {
      skipped++;
      continue;
    }
    // Last-write-wins by client-supplied wall time (endedAt || max set
    // completedAt || startedAt). The DB updated_at trigger always reflects
    // server insert/update time, but we use the client clock as the LWW
    // timestamp because cross-device merges should respect when the user
    // actually finished the work, not when the device managed to sync.
    const clientWallMs = clientWatermark(ws);

    const result = await sql`
      INSERT INTO workout_sessions
        (id, user_id, workout_key, started_at, ended_at, data)
      VALUES
        (${ws.id}, ${userId}, ${ws.workoutKey},
         ${ws.startedAt}, ${ws.endedAt ?? null}, ${JSON.stringify(ws)}::jsonb)
      ON CONFLICT (id) DO UPDATE
         SET workout_key = EXCLUDED.workout_key,
             started_at  = EXCLUDED.started_at,
             ended_at    = EXCLUDED.ended_at,
             data        = EXCLUDED.data
       WHERE workout_sessions.user_id = ${userId}
         AND ${clientWallMs} >= COALESCE(
               EXTRACT(EPOCH FROM workout_sessions.updated_at) * 1000,
               0
             )
      RETURNING id
    `;

    if (result.rowCount && result.rowCount > 0) upserted++;
    else skipped++;
  }

  return NextResponse.json({ upserted, skipped });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { email?: string } | undefined)?.email;
  if (!session || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await sql`
    DELETE FROM workout_sessions
     WHERE id = ${id} AND user_id = ${userId}
  `;
  return NextResponse.json({ ok: true });
}

function clientWatermark(ws: WorkoutSession): number {
  const setMax = ws.exercises
    .flatMap((e) => e.sets)
    .reduce((acc, s) => Math.max(acc, s.completedAt), 0);
  return Math.max(ws.endedAt ?? 0, setMax, ws.startedAt);
}
