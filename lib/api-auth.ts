/**
 * Bearer-token auth for the /api/exercises write endpoints.
 *
 * Token is provisioned via the `EXERCISE_API_TOKEN` env var (32+ bytes of
 * `openssl rand -hex 32`).  Read at request time — never at module load —
 * so missing-env doesn't crash `next build`.
 *
 * The MCP server that mutates the library will hold this token and send it
 * as `Authorization: Bearer <token>`.  No multi-user model: this is a
 * single-tenant private API.
 */

import { NextResponse } from "next/server";

export interface AuthFailure {
  ok: false;
  response: NextResponse;
}

export interface AuthSuccess {
  ok: true;
}

export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Validate the `Authorization: Bearer <token>` header.
 *
 * Returns `{ ok: true }` on a match, `{ ok: false, response }` on
 * any failure (missing header, malformed, mismatch, env unset).
 *
 * 401 on auth failures; 503 if the token is not configured server-side
 * (signals "ops issue, not your fault" to the caller).
 */
export function requireBearerToken(request: Request): AuthResult {
  const expected = process.env.EXERCISE_API_TOKEN;
  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Server misconfigured: EXERCISE_API_TOKEN not set" },
        { status: 503 },
      ),
    };
  }

  const header = request.headers.get("authorization");
  if (!header) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 },
      ),
    };
  }

  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authorization header must be 'Bearer <token>'" },
        { status: 401 },
      ),
    };
  }

  const provided = match[1].trim();
  // Constant-time-ish compare.  We can't avoid the length check leaking
  // length info but the token is 64 hex chars / fixed, so it's fine.
  if (provided.length !== expected.length) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      ),
    };
  }
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
}
