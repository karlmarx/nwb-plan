// Shared program timing constants & helpers.
// The canonical source for program start — the progress clock and the
// auto-phase logic both depend on this.

/**
 * Program start: March 17, 2026 at noon EDT = 16:00 UTC.
 * Mirrored on the watch in watch/app/src/main/kotlin/com/nwb/watch/data/WorkoutScheduler.kt
 * (DEFAULT_PROGRAM_START) — keep in sync.
 */
export const PROG_START = new Date("2026-03-17T16:00:00Z");

/** 8 weeks in ms. */
export const PROG_DURATION = 56 * 24 * 60 * 60 * 1000;

/**
 * Which phase index (0, 1, 2, 3) maps to today's calendar week.
 *  - phase 0 → weeks 1-2 (Foundation)
 *  - phase 1 → weeks 3-4 (Build)
 *  - phase 2 → weeks 5-6 (Peak)
 *  - phase 3 → weeks 7-8 (PWB Prep — partial weight bearing transition)
 * Clamps to [0, 3] so dates outside the 8-week window still resolve.
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
