/**
 * PWA ↔ Watch state sync via Vercel Blob.
 *
 * Call `pullState()` on app load to merge remote → local.
 * Call `pushState(state)` after local changes — it debounces automatically.
 */

import { loadState, saveState } from "./storage";

// ─── Sync payload shape ───────────────────────────────────────────

export interface SyncPayload {
  v: 1;
  ts: number; // epoch ms — last-write-wins
  swaps: Record<string, string>;
  equipment: Record<string, boolean>;
  machines: Record<string, string>;
  nearby: Record<string, string[]>;
  coreNearby: string[];
  supplements: { leftLeg: boolean; core: boolean };
  order: Record<string, string[]>;
  startDay: number;
  restDay: number | null;
  programStartEpoch: number | null;
  activeWorkout: {
    key: string;
    exerciseIndex: number;
    completedSets: number;
  } | null;
  ttsEnabled: boolean;
  hapticsEnabled: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────

const SYNC_SECRET_KEY = "nwb_sync_secret";

export function getSyncSecret(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_SECRET_KEY);
}

export function setSyncSecret(secret: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_SECRET_KEY, secret);
}

async function api(
  method: "GET" | "PUT",
  body?: SyncPayload,
): Promise<SyncPayload | null> {
  const secret = getSyncSecret();
  if (!secret) return null;

  const res = await fetch("/api/sync", {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null; // no remote state yet
  if (!res.ok) {
    console.warn(`[sync] ${method} failed: ${res.status}`);
    return null;
  }
  if (method === "PUT") return null;
  return res.json();
}

// ─── Build payload from current localStorage ─────────────────────

export function buildPayload(): SyncPayload {
  return {
    v: 1,
    ts: Date.now(),
    swaps: loadState("nwb_swaps", {}),
    equipment: loadState("nwb_equipment", {}),
    machines: loadState("nwb_machines", {}),
    nearby: loadState("nwb_nearby", {}),
    coreNearby: loadState("nwb_core_nearby", []),
    supplements: loadState("nwb_supplements", { leftLeg: true, core: true }),
    order: loadState("nwb_order", {}),
    startDay: loadState("nwb_startDay", 0),
    restDay: loadState("nwb_restDay", null),
    programStartEpoch: loadState("nwb_programStartEpoch", null),
    activeWorkout: null, // PWA doesn't track this currently
    ttsEnabled: true,
    hapticsEnabled: true,
  };
}

// ─── Pull: remote → local (if remote is newer) ──────────────────

export async function pullState(): Promise<boolean> {
  const remote = await api("GET");
  if (!remote) return false;

  // Last-write-wins: only apply if remote is newer
  const localTs = loadState("nwb_sync_ts", 0);
  if (remote.ts <= localTs) return false;

  // Merge remote into localStorage
  saveState("nwb_swaps", remote.swaps);
  saveState("nwb_equipment", remote.equipment);
  saveState("nwb_machines", remote.machines);
  saveState("nwb_nearby", remote.nearby);
  saveState("nwb_core_nearby", remote.coreNearby);
  saveState("nwb_supplements", remote.supplements);
  saveState("nwb_order", remote.order);
  saveState("nwb_startDay", remote.startDay);
  if (remote.restDay !== null) {
    saveState("nwb_restDay", remote.restDay);
  }
  if (remote.programStartEpoch !== null) {
    saveState("nwb_programStartEpoch", remote.programStartEpoch);
  }
  saveState("nwb_sync_ts", remote.ts);

  return true; // caller should reload state from localStorage
}

// ─── Push: local → remote (debounced) ────────────────────────────

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function pushState(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const payload = buildPayload();
    saveState("nwb_sync_ts", payload.ts);
    await api("PUT", payload);
  }, 2000); // 2s debounce
}
