/**
 * Client-side Hevy CSV import.
 *
 * Hevy CSV format (one row per set):
 *   Workout #, Date, Workout Name, Duration, Exercise Name,
 *   Set Order, Weight (kg), Reps, RPE, Distance (km), Duration (s),
 *   Notes, Workout Notes
 *
 * Columns vary by Hevy version; we locate columns by header name.
 * Everything is parsed in-browser — no backend required.
 */

import { findExerciseId } from "./hevy-name-map";
import type { WorkoutSession, LoggedSet, LoggedExercise } from "./workout-log";
import { newSessionId } from "./workout-log";

// ── CSV parser (no external deps) ────────────────────────────────────────────

/**
 * Parse a CSV string into rows of string cells.
 *
 * Handles:
 *   - Quoted fields (may contain commas)
 *   - Escaped double-quotes inside quoted fields ("")
 *   - \r\n and \n line endings
 *   - Trailing newlines
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let i = 0;
  const len = normalized.length;

  while (i < len) {
    const row: string[] = [];
    // Parse one row
    while (i < len && normalized[i] !== "\n") {
      if (normalized[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let cell = "";
        while (i < len) {
          if (normalized[i] === '"') {
            if (normalized[i + 1] === '"') {
              // Escaped double-quote
              cell += '"';
              i += 2;
            } else {
              // End of quoted field
              i++;
              break;
            }
          } else {
            cell += normalized[i];
            i++;
          }
        }
        row.push(cell);
        // Skip comma after quoted field (if any)
        if (i < len && normalized[i] === ",") i++;
      } else {
        // Unquoted field — read until comma or newline
        let start = i;
        while (i < len && normalized[i] !== "," && normalized[i] !== "\n") {
          i++;
        }
        row.push(normalized.slice(start, i));
        if (i < len && normalized[i] === ",") i++;
      }
    }
    // Skip the newline character
    if (i < len && normalized[i] === "\n") i++;
    // Skip completely empty rows (e.g. trailing newline produces one)
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
      rows.push(row);
    }
  }
  return rows;
}

// ── kg → lb conversion ───────────────────────────────────────────────────────

const KG_TO_LB = 2.20462;

/** Convert kg to lb, rounded to nearest 2.5. Returns 0 if input is falsy/NaN. */
function kgToLb(kg: number): number {
  if (!kg || isNaN(kg)) return 0;
  const raw = kg * KG_TO_LB;
  return Math.round(raw / 2.5) * 2.5;
}

// ── Result types ─────────────────────────────────────────────────────────────

export interface SkippedExercise {
  name: string;
  sets: number;
}

export interface HevyImportResult {
  /** Sessions fully matched and ready to append to workout-log:sessions. */
  matched: WorkoutSession[];
  /** Exercises that had no mapping. Aggregated by name. */
  skipped: SkippedExercise[];
  /** Total raw CSV data rows (excluding header). */
  rawCount: number;
}

// ── Column header aliases ─────────────────────────────────────────────────────

/**
 * Hevy has changed column headers across export versions. We try a list of
 * known aliases for each logical column.
 */
const COL_ALIASES: Record<string, string[]> = {
  workoutNum: ["workout #", "workout number", "workout#"],
  date: ["date"],
  workoutName: ["workout name", "title"],
  exerciseName: ["exercise name", "exercise", "exercise title"],
  setOrder: ["set order", "set #", "set number"],
  weightKg: ["weight (kg)", "weight_kg", "weight kg"],
  weightLb: ["weight (lbs)", "weight (lb)", "weight_lbs", "weight lb"],
  reps: ["reps", "repetitions"],
  notes: ["notes", "note"],
  workoutNotes: ["workout notes", "workout note"],
  durationSec: ["duration (s)", "duration(s)", "time (s)", "time"],
};

function findColIndex(
  headers: string[],
  aliases: string[],
): number {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

// ── Main parser ───────────────────────────────────────────────────────────────

/**
 * Parse a Hevy CSV export and return matched sessions, skipped exercises, and
 * the raw row count.
 *
 * Logic:
 *  1. Parse CSV → rows.
 *  2. Locate columns by header aliases.
 *  3. Group rows by (workoutNum + date) → session.
 *  4. Within each session group, group rows by exerciseName → LoggedExercise.
 *  5. Convert weights (kg → lb) and build LoggedSet entries.
 *  6. If exerciseName maps to an id: include in session.exercises.
 *     Otherwise: aggregate to skipped[].
 *  7. Only emit a session if it has at least one matched exercise.
 */
export function parseHevyCsv(csvText: string): HevyImportResult {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { matched: [], skipped: [], rawCount: 0 };
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Locate columns
  const colWorkoutNum = findColIndex(headers, COL_ALIASES.workoutNum);
  const colDate = findColIndex(headers, COL_ALIASES.date);
  const colWorkoutName = findColIndex(headers, COL_ALIASES.workoutName);
  const colExerciseName = findColIndex(headers, COL_ALIASES.exerciseName);
  const colSetOrder = findColIndex(headers, COL_ALIASES.setOrder);
  const colWeightKg = findColIndex(headers, COL_ALIASES.weightKg);
  const colWeightLb = findColIndex(headers, COL_ALIASES.weightLb);
  const colReps = findColIndex(headers, COL_ALIASES.reps);
  const colNotes = findColIndex(headers, COL_ALIASES.notes);
  const colDurationSec = findColIndex(headers, COL_ALIASES.durationSec);

  if (colExerciseName === -1) {
    // Can't parse without knowing which column is the exercise name
    return { matched: [], skipped: [], rawCount: dataRows.length };
  }

  const get = (row: string[], col: number): string =>
    col !== -1 ? (row[col] ?? "").trim() : "";

  // ── Group rows by session key (workout# + date) ──
  // Using a Map to preserve insertion order
  const sessionMap = new Map<
    string,
    {
      workoutNum: string;
      date: string;
      workoutName: string;
      exercises: Map<string, { rows: string[][] }>;
    }
  >();

  for (const row of dataRows) {
    const wNum = get(row, colWorkoutNum) || "0";
    const date = get(row, colDate) || "unknown";
    const wName = get(row, colWorkoutName) || "Hevy Workout";
    const exName = get(row, colExerciseName);
    if (!exName) continue;

    const sessionKey = `${wNum}::${date}`;
    if (!sessionMap.has(sessionKey)) {
      sessionMap.set(sessionKey, {
        workoutNum: wNum,
        date,
        workoutName: wName,
        exercises: new Map(),
      });
    }
    const session = sessionMap.get(sessionKey)!;
    if (!session.exercises.has(exName)) {
      session.exercises.set(exName, { rows: [] });
    }
    session.exercises.get(exName)!.rows.push(row);
  }

  // ── Build sessions ──
  const matched: WorkoutSession[] = [];
  const skippedMap = new Map<string, number>(); // name → total skipped sets

  for (const [, sessionData] of sessionMap) {
    const { date, workoutName, exercises } = sessionData;

    // Parse date → epoch ms. Hevy uses YYYY-MM-DD or MM/DD/YYYY etc.
    const startedAt = parseHevyDate(date);

    const loggedExercises: LoggedExercise[] = [];

    for (const [exName, exData] of exercises) {
      const exerciseId = findExerciseId(exName);

      if (!exerciseId) {
        // Track skipped
        skippedMap.set(exName, (skippedMap.get(exName) ?? 0) + exData.rows.length);
        continue;
      }

      // Determine if source is kg or lb
      const useLbColumn = colWeightLb !== -1 && colWeightKg === -1;

      const sets: LoggedSet[] = exData.rows.map((row, idx) => {
        let weight = 0;
        if (useLbColumn) {
          weight = parseFloat(get(row, colWeightLb)) || 0;
        } else if (colWeightKg !== -1) {
          weight = kgToLb(parseFloat(get(row, colWeightKg)) || 0);
        }

        const reps = parseInt(get(row, colReps), 10) || 0;
        const durationSec =
          colDurationSec !== -1
            ? parseInt(get(row, colDurationSec), 10) || undefined
            : undefined;
        const note = colNotes !== -1 ? get(row, colNotes) || undefined : undefined;

        // Ordinal: prefer Set Order column; fall back to loop index + 1
        const nRaw = colSetOrder !== -1 ? parseInt(get(row, colSetOrder), 10) : NaN;
        const n = isNaN(nRaw) ? idx + 1 : nRaw;

        return {
          n,
          weight,
          reps,
          ...(durationSec !== undefined ? { durationSec } : {}),
          ...(note ? { note } : {}),
          completedAt: startedAt,
        } satisfies LoggedSet;
      });

      loggedExercises.push({
        exerciseId,
        name: exName,
        sets,
      });
    }

    if (loggedExercises.length === 0) continue;

    matched.push({
      id: newSessionId(),
      workoutKey: workoutName,
      startedAt,
      endedAt: startedAt + 60 * 60 * 1000, // assume ~1 hr duration
      exercises: loggedExercises,
    });
  }

  const skipped: SkippedExercise[] = Array.from(skippedMap.entries()).map(
    ([name, sets]) => ({ name, sets }),
  );

  return { matched, skipped, rawCount: dataRows.length };
}

// ── Date parsing ─────────────────────────────────────────────────────────────

/**
 * Parse Hevy date strings to epoch ms.
 *
 * Known Hevy formats:
 *   "2024-03-15" (ISO)
 *   "Mar 15, 2024"
 *   "2024-03-15 09:30:00" (with time)
 */
function parseHevyDate(dateStr: string): number {
  // Try native parse first — works for ISO 8601 and many locale strings
  const native = new Date(dateStr);
  if (!isNaN(native.getTime())) return native.getTime();

  // Fallback: YYYY-MM-DD
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(
      parseInt(iso[1]),
      parseInt(iso[2]) - 1,
      parseInt(iso[3]),
    ).getTime();
  }

  // Can't parse — use now as fallback
  return Date.now();
}
