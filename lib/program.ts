// Shared program timing constants & helpers.
// The canonical source for program start — the progress clock and the
// auto-phase logic both depend on this.

/**
 * Program start: March 17, 2026 at noon EDT = 16:00 UTC.
 * Mirrored on the watch in watch/app/src/main/kotlin/com/nwb/watch/data/WorkoutScheduler.kt
 * (DEFAULT_PROGRAM_START) — keep in sync.
 *
 * NOTE: This refers to the *NWB* phase start. With the introduction of
 * `ProgramPhase` (PWB extension), the active rehab program phase is no
 * longer derived from PROG_START — see DEFAULT_PROGRAM_PHASES below.
 * PROG_START / PROG_DURATION remain exported for the training-content
 * phase logic (`computeCurrentPhase`) and for the watch app, which still
 * tracks the original 8-week NWB schedule.
 */
export const PROG_START = new Date("2026-03-17T16:00:00Z");

/** 8 weeks in ms. */
export const PROG_DURATION = 56 * 24 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Which training-content phase index (0, 1, 2, 3) maps to today's
 * calendar week, anchored to PROG_START.
 *  - phase 0 → weeks 1-2 (Foundation)
 *  - phase 1 → weeks 3-4 (Build)
 *  - phase 2 → weeks 5-6 (Peak)
 *  - phase 3 → weeks 7-8 (PWB Prep — partial weight bearing transition)
 * Clamps to [0, 3] so dates outside the 8-week window still resolve.
 *
 * This is the *workout content* phase (which exercises and intensity),
 * NOT the rehab program phase (NWB → PWB → …). For the latter, see
 * `ProgramPhase` and `activePhase()` below.
 */
export function computeCurrentPhase(now: Date = new Date()): number {
  const elapsed = now.getTime() - PROG_START.getTime();
  if (elapsed < 0) return 0;
  const week = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000)) + 1;
  if (week <= 2) return 0;
  if (week <= 4) return 1;
  if (week <= 6) return 2;
  return 3;
}

// ===== Rehab program phases (NWB / PWB / ...) =====

/**
 * A rehab program phase. The user lives in *one* phase at a time
 * (status === "active"). Past phases are kept for the timeline display.
 *
 * Stored in localStorage under `nwb_programPhases` as JSON; `Date` fields
 * round-trip through ISO strings — see `parsePhases` for the deserializer.
 */
export interface ProgramPhase {
  /** Stable identifier, e.g. "nwb", "pwb". */
  id: string;
  /** Short label for chips/badges, e.g. "NWB". */
  name: string;
  /** Long label for headers/modals, e.g. "Non-Weight Bearing". */
  longName: string;
  /** First moment counted as "Day 1" of this phase. */
  startDate: Date;
  /** Target duration of this phase in days. */
  durationDays: number;
  /** "active" = currently running. "completed" = past. */
  status: "active" | "completed";
  /** Optional accent color (hex). */
  color?: string;
  /** Optional one-line description for the modal. */
  desc?: string;
}

/**
 * Default rehab program phases.
 *
 * - NWB: original 8-week non-weight-bearing protocol — completed.
 * - PWB: 6-week partial-weight-bearing extension — active, started
 *   2026-04-29 (positive medical update green-lit weight bearing).
 *
 * On first load (no `nwb_programPhases` key in storage), the
 * `ProgressClock` writes this array. Existing users who never had a
 * persisted phase array get the same defaults — there is no v1 schema to
 * migrate from since `PROG_START` was previously a hardcoded constant.
 */
export const DEFAULT_PROGRAM_PHASES: ProgramPhase[] = [
  {
    id: "nwb",
    name: "NWB",
    longName: "Non-Weight Bearing",
    startDate: new Date("2026-03-17T16:00:00Z"),
    durationDays: 56,
    status: "completed",
    color: "#a78bfa",
    desc: "Original 8-week non-weight-bearing protocol post-fracture.",
  },
  {
    id: "pwb",
    name: "PWB",
    longName: "Partial Weight Bearing",
    startDate: new Date("2026-04-29T16:00:00Z"),
    durationDays: 42,
    status: "active",
    color: "#10b981",
    desc: "6-week partial-weight-bearing rehab. PT-guided progression.",
  },
];

/**
 * Find the currently-active phase. If multiple phases are marked active
 * (shouldn't happen, but guard), returns the last one — i.e. the most
 * recently configured one wins. If none are active, falls back to the
 * last completed phase (so the clock still has *something* to display).
 */
export function activePhase(phases: ProgramPhase[]): ProgramPhase {
  if (phases.length === 0) {
    throw new Error("activePhase: phases array is empty");
  }
  for (let i = phases.length - 1; i >= 0; i--) {
    if (phases[i].status === "active") return phases[i];
  }
  return phases[phases.length - 1];
}

/** Total target duration of a phase in milliseconds. */
export function phaseDurationMs(phase: ProgramPhase): number {
  return phase.durationDays * DAY_MS;
}

/**
 * Elapsed time since the phase start, in milliseconds. Clamped to >= 0
 * so a phase configured in the future displays as "Day 1, 0% progress".
 * NOT capped at the phase duration — count-up keeps going past the
 * target so users see how long they've actually been in this phase.
 */
export function phaseElapsedMs(phase: ProgramPhase, now: Date): number {
  const ms = now.getTime() - phase.startDate.getTime();
  return ms < 0 ? 0 : ms;
}

/**
 * 1-indexed day number within the phase. "Day 1" on (and before) the
 * start date; "Day 2" 24 hours later; etc. Has NO upper cap — the
 * progress bar caps at 100%, but the textual day number keeps counting.
 */
export function phaseDayNumber(phase: ProgramPhase, now: Date): number {
  const elapsed = phaseElapsedMs(phase, now);
  return Math.floor(elapsed / DAY_MS) + 1;
}

/**
 * Progress through the phase as a fraction in [0, 1]. Caps at 1 once
 * the target duration has elapsed (the day counter keeps going, but
 * the bar fills no further).
 */
export function phaseProgressFraction(phase: ProgramPhase, now: Date): number {
  const dur = phaseDurationMs(phase);
  if (dur <= 0) return 1;
  const frac = phaseElapsedMs(phase, now) / dur;
  if (frac < 0) return 0;
  if (frac > 1) return 1;
  return frac;
}

/**
 * Deserialize a phases array from localStorage JSON. `Date` fields are
 * stored as ISO strings; this function rehydrates them. Returns null
 * if the input is malformed (caller should fall back to defaults).
 */
export function parsePhases(raw: unknown): ProgramPhase[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ProgramPhase[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const o = item as Record<string, unknown>;
    if (
      typeof o.id !== "string" ||
      typeof o.name !== "string" ||
      typeof o.longName !== "string" ||
      typeof o.durationDays !== "number" ||
      (o.status !== "active" && o.status !== "completed")
    ) {
      return null;
    }
    const sd =
      o.startDate instanceof Date
        ? o.startDate
        : typeof o.startDate === "string"
          ? new Date(o.startDate)
          : null;
    if (!sd || Number.isNaN(sd.getTime())) return null;
    out.push({
      id: o.id,
      name: o.name,
      longName: o.longName,
      startDate: sd,
      durationDays: o.durationDays,
      status: o.status,
      color: typeof o.color === "string" ? o.color : undefined,
      desc: typeof o.desc === "string" ? o.desc : undefined,
    });
  }
  return out;
}
