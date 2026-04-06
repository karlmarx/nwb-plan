import { NextRequest, NextResponse } from "next/server";

const HEVY_BASE = "https://api.hevyapp.com/v1";

// POST /api/hevy — serverless proxy so the api-key never hits the browser
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, apiKey, ...params } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
    }

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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
