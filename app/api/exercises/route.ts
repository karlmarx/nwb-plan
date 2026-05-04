/**
 * /api/exercises
 *
 *   GET   — full exercise library (public, cached 1h)
 *   POST  — create exercise (bearer-token authed)
 *
 * Caching: GET sets `Cache-Control: public, max-age=3600, s-maxage=3600`
 * AND uses `revalidate = 3600` so Next.js's data cache reuses the result
 * across server invocations within the hour. This is the conservative
 * choice — Cache Components / `cacheLife` are still stabilising in
 * Next 16, and a plain `revalidate` value works on every Vercel runtime
 * including Edge.  The MCP server can bust this with `revalidateTag` once
 * we tag responses (Phase 1 — see docs/exercise-backend.md).
 *
 * Runtime: Node.js (default).  `@vercel/postgres` works in both Edge and
 * Node, but we don't need Edge here and Node makes JSON.parse / large
 * payloads easier to debug.
 */

import { NextResponse } from "next/server";
import {
  createExercise,
  getAllExercises,
  type ExerciseInput,
} from "@/lib/db";
import { requireBearerToken } from "@/lib/api-auth";

// Cache the GET response for 1 hour at the framework layer.
export const revalidate = 3600;

const CACHE_HEADER = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  try {
    const exercises = await getAllExercises();
    return NextResponse.json(
      { exercises },
      {
        headers: {
          "Cache-Control": CACHE_HEADER,
        },
      },
    );
  } catch (err) {
    console.error("GET /api/exercises failed:", err);
    return NextResponse.json(
      { error: "Failed to load exercises" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = requireBearerToken(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const validation = validateExerciseInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const created = await createExercise(validation.data);
    return NextResponse.json({ exercise: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/exercises failed:", err);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 },
    );
  }
}

// --- validation -----------------------------------------------------------

interface Valid<T> {
  ok: true;
  data: T;
}
interface Invalid {
  ok: false;
  error: string;
}

function validateExerciseInput(input: unknown): Valid<ExerciseInput> | Invalid {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const o = input as Record<string, unknown>;

  for (const field of [
    "id",
    "name",
    "category",
    "setup",
    "execution",
    "nwbCues",
    "why",
    "safety",
  ] as const) {
    if (typeof o[field] !== "string" || (o[field] as string).length === 0) {
      return { ok: false, error: `Field "${field}" must be a non-empty string` };
    }
  }
  if (typeof o.rest !== "number") {
    return { ok: false, error: 'Field "rest" must be a number' };
  }
  if (!["safe", "caution", "danger"].includes(o.safety as string)) {
    return { ok: false, error: 'Field "safety" must be "safe" | "caution" | "danger"' };
  }
  if (!Array.isArray(o.requires) || !o.requires.every((x) => typeof x === "string")) {
    return { ok: false, error: '"requires" must be string[]' };
  }
  if (!Array.isArray(o.swaps) || !o.swaps.every((x) => typeof x === "string")) {
    return { ok: false, error: '"swaps" must be string[]' };
  }
  if (!Array.isArray(o.sets)) {
    return { ok: false, error: '"sets" must be an array of [string, string] tuples' };
  }
  if (!o.constraints || typeof o.constraints !== "object") {
    return { ok: false, error: '"constraints" must be an object' };
  }

  // We've type-checked the basics; cast through.  The DB enforces shape
  // beyond this — e.g. JSONB will reject malformed values.
  return { ok: true, data: o as unknown as ExerciseInput };
}
