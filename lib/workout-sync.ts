// Cloud-sync orchestration for workout history.
//
// The local source of truth is `localStorage["workout-log:sessions"]` (see
// lib/workout-log.ts). On login + on endSession + on manual "Sync now",
// we run a pull-then-merge-then-push cycle:
//
//   1. GET  /api/workout-sessions[?since=<lastSyncAt>]  → remote rows
//   2. Merge remote ∪ local by session id, picking the entry with the
//      higher client wall-time watermark (endedAt | max set completedAt
//      | startedAt). This is the same watermark the API uses for LWW, so
//      both sides converge.
//   3. PUT remote-newer rows back into localStorage; PUT local-newer rows
//      to the server.
//
// Active in-progress sessions ("workout-log:active") are NOT synced — they
// stay local until endSession() promotes them to the sessions array.

import { loadState, saveState } from "./storage";
import {
  loadSessions,
  saveSessions,
  type WorkoutSession,
} from "./workout-log";

const SYNC_STATE_KEY = "nwb_sync_state";

export interface SyncState {
  /** Epoch ms of the last successful sync. 0 if never synced. */
  lastSyncAt: number;
  /** Last error message, or null if last attempt succeeded. */
  lastError: string | null;
  /** True while a sync is in flight. */
  inFlight: boolean;
}

const DEFAULT_STATE: SyncState = {
  lastSyncAt: 0,
  lastError: null,
  inFlight: false,
};

export function loadSyncState(): SyncState {
  return loadState<SyncState>(SYNC_STATE_KEY, DEFAULT_STATE);
}

function setSyncState(patch: Partial<SyncState>): SyncState {
  const next = { ...loadSyncState(), ...patch };
  saveState(SYNC_STATE_KEY, next);
  return next;
}

/** Client-side LWW watermark — must match the server's `clientWatermark`. */
export function watermarkFor(ws: WorkoutSession): number {
  const setMax = ws.exercises
    .flatMap((e) => e.sets)
    .reduce((acc, s) => Math.max(acc, s.completedAt), 0);
  return Math.max(ws.endedAt ?? 0, setMax, ws.startedAt);
}

interface MergeResult {
  /** Sessions to write to localStorage (winners by id). */
  merged: WorkoutSession[];
  /** Sessions whose local copy is newer — push these to the server. */
  toPush: WorkoutSession[];
}

export function mergeSessions(
  local: WorkoutSession[],
  remote: WorkoutSession[],
): MergeResult {
  const byId = new Map<string, { ws: WorkoutSession; source: "local" | "remote" }>();
  for (const ws of remote) byId.set(ws.id, { ws, source: "remote" });
  for (const ws of local) {
    const existing = byId.get(ws.id);
    if (!existing) {
      byId.set(ws.id, { ws, source: "local" });
      continue;
    }
    if (watermarkFor(ws) > watermarkFor(existing.ws)) {
      byId.set(ws.id, { ws, source: "local" });
    }
  }

  const merged = Array.from(byId.values()).map((e) => e.ws);
  // Stable sort by startedAt asc to match the existing local order.
  merged.sort((a, b) => a.startedAt - b.startedAt);

  // Push: anything whose winning copy came from local.
  const toPush = Array.from(byId.values())
    .filter((e) => e.source === "local")
    .map((e) => e.ws);

  return { merged, toPush };
}

export interface SyncOutcome {
  pulled: number;
  pushed: number;
  skipped: number;
  error?: string;
}

/**
 * Run a full sync cycle. Returns counts for diagnostics. Safe to call
 * repeatedly; if a sync is already in flight, the second call is a no-op
 * and returns the in-flight error placeholder.
 */
export async function syncWorkoutSessions(): Promise<SyncOutcome> {
  const state = loadSyncState();
  if (state.inFlight) {
    return { pulled: 0, pushed: 0, skipped: 0, error: "in_flight" };
  }
  setSyncState({ inFlight: true, lastError: null });

  try {
    // 1. Pull
    const pullRes = await fetch("/api/workout-sessions", {
      method: "GET",
      credentials: "same-origin",
    });
    if (pullRes.status === 401) {
      throw new Error("Not signed in");
    }
    if (!pullRes.ok) {
      throw new Error(`Pull failed: ${pullRes.status}`);
    }
    const pullJson = (await pullRes.json()) as { sessions: WorkoutSession[] };
    const remote = pullJson.sessions ?? [];

    // 2. Merge
    const local = loadSessions();
    const { merged, toPush } = mergeSessions(local, remote);
    saveSessions(merged);

    // 3. Push (only the local winners)
    let pushed = 0;
    let skipped = 0;
    if (toPush.length > 0) {
      const pushRes = await fetch("/api/workout-sessions", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ sessions: toPush }),
      });
      if (!pushRes.ok) {
        throw new Error(`Push failed: ${pushRes.status}`);
      }
      const pushJson = (await pushRes.json()) as {
        upserted: number;
        skipped: number;
      };
      pushed = pushJson.upserted;
      skipped = pushJson.skipped;
    }

    setSyncState({
      inFlight: false,
      lastError: null,
      lastSyncAt: Date.now(),
    });

    return { pulled: remote.length, pushed, skipped };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setSyncState({ inFlight: false, lastError: msg });
    return { pulled: 0, pushed: 0, skipped: 0, error: msg };
  }
}

/**
 * Push a single session immediately (used by endSession). Doesn't pull —
 * for that, call syncWorkoutSessions() instead. Quietly no-ops if the user
 * isn't signed in.
 */
export async function pushSession(ws: WorkoutSession): Promise<void> {
  try {
    const res = await fetch("/api/workout-sessions", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ sessions: [ws] }),
    });
    if (res.status === 401) return; // not signed in; localStorage already has it
    if (!res.ok) {
      setSyncState({ lastError: `Push failed: ${res.status}` });
      return;
    }
    setSyncState({ lastSyncAt: Date.now(), lastError: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setSyncState({ lastError: msg });
  }
}
