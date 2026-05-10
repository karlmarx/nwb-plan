import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const HEVY_BASE = "https://api.hevyapp.com/v1";

/**
 * Hevy API proxy. The Hevy API key lives server-side as `process.env.HEVY_API_KEY`
 * — never accepted from the request body and never exposed to the browser.
 *
 * Auth: admin-only. Anyone hitting this route must be signed in with the admin
 * Google account; otherwise we 401/403. This prevents random visitors from
 * spending Karl's Hevy quota.
 *
 * GET  /api/hevy → status check, returns { configured: boolean }
 * POST /api/hevy → action proxy ({ action, ...params })
 */
async function requireAdmin() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string } | undefined;
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ configured: Boolean(process.env.HEVY_API_KEY) });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "HEVY_API_KEY env var not configured. Set it in Vercel project settings (and .env.local for dev).",
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;

    const headers: Record<string, string> = {
      "api-key": apiKey,
      "Content-Type": "application/json",
    };

    let res: Response;

    switch (action) {
      case "search-exercises": {
        const q = encodeURIComponent(params.query || "");
        res = await fetch(`${HEVY_BASE}/exercise_templates?name=${q}`, {
          headers,
        });
        break;
      }

      case "list-routines": {
        res = await fetch(`${HEVY_BASE}/routines`, { headers });
        break;
      }

      case "get-routine": {
        res = await fetch(`${HEVY_BASE}/routines/${params.routineId}`, {
          headers,
        });
        break;
      }

      case "update-routine": {
        res = await fetch(`${HEVY_BASE}/routines/${params.routineId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(params.routine),
        });
        break;
      }

      case "create-routine": {
        res = await fetch(`${HEVY_BASE}/routines`, {
          method: "POST",
          headers,
          body: JSON.stringify(params.routine),
        });
        break;
      }

      case "list-workouts": {
        const page = params.page ?? 1;
        const pageSize = params.pageSize ?? 10;
        res = await fetch(
          `${HEVY_BASE}/workouts?page=${page}&pageSize=${pageSize}`,
          { headers }
        );
        break;
      }

      case "list-exercise-templates": {
        const page = params.page ?? 1;
        const pageSize = params.pageSize ?? 100;
        res = await fetch(
          `${HEVY_BASE}/exercise_templates?page=${page}&pageSize=${pageSize}`,
          { headers }
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || `Hevy API ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
