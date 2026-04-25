/**
 * /api/exercises/[id]
 *
 *   GET     — single exercise by id (public, cached 1h)
 *   PATCH   — partial update (bearer-token authed)
 *   DELETE  — remove (bearer-token authed)
 *
 * Path-param convention: `id` is the slug-style id from `lib/exercises.ts`,
 * e.g. `barbell_floor_press`.  NOT the display name.
 *
 * Next.js 16 route signature: dynamic params come in as an awaitable
 * `Promise<{ id: string }>`. (Was sync in Next 14, async in 15+.)
 */

import { NextResponse } from "next/server";
import {
  deleteExercise,
  getExerciseById,
  updateExercise,
  type ExerciseUpdate,
} from "@/lib/db";
import { requireBearerToken } from "@/lib/api-auth";

export const revalidate = 3600;

const CACHE_HEADER = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;

  try {
    const ex = await getExerciseById(id);
    if (!ex) {
      return NextResponse.json(
        { error: `Exercise "${id}" not found` },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { exercise: ex },
      { headers: { "Cache-Control": CACHE_HEADER } },
    );
  } catch (err) {
    console.error(`GET /api/exercises/${id} failed:`, err);
    return NextResponse.json(
      { error: "Failed to load exercise" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  const auth = requireBearerToken(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Body must be a JSON object" },
      { status: 400 },
    );
  }

  // PATCH is partial — no required-field check.  Whatever's present
  // overrides; everything else is preserved by `updateExercise`.
  const patch = body as ExerciseUpdate;

  try {
    const updated = await updateExercise(id, patch);
    if (!updated) {
      return NextResponse.json(
        { error: `Exercise "${id}" not found` },
        { status: 404 },
      );
    }
    return NextResponse.json({ exercise: updated });
  } catch (err) {
    console.error(`PATCH /api/exercises/${id} failed:`, err);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, ctx: RouteCtx) {
  const auth = requireBearerToken(request);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  try {
    const removed = await deleteExercise(id);
    if (!removed) {
      return NextResponse.json(
        { error: `Exercise "${id}" not found` },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error(`DELETE /api/exercises/${id} failed:`, err);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 },
    );
  }
}
