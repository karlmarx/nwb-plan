/**
 * TS → plan.json adapter for the ebook pipeline.
 *
 * Reads the live exercise/workout/schedule data from `lib/`, plus the
 * PWB additions and the EXERCISE_TO_DIAGRAM mapping, and emits a flat
 * JSON document shaped for `scripts/nwb_to_epub.py`.
 *
 * Usage:
 *   tsx scripts/export-plan.ts > dist/plan.json
 *   tsx scripts/export-plan.ts --out dist/plan.json
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { EX, SCHED, WORKOUTS, type Exercise } from "../lib/exercises";
import { DEFAULT_PROGRAM_PHASES } from "../lib/program";
import { EXERCISE_TO_DIAGRAM } from "../components/diagrams";

interface PlanExercise {
  name: string;
  sets?: string;
  reps?: string;
  rest?: string;
  tempo?: string;
  load?: string;
  notes?: string;
  cues?: string[];
  safety?: string;
  svg_path?: string;
}

interface PlanDay {
  name: string;
  summary?: string;
  exercises: PlanExercise[];
}

interface PlanPhase {
  id: string;
  name: string;
  description?: string;
  guidance?: string[];
  days: PlanDay[];
}

interface Plan {
  id: string;
  title: string;
  authors: string[];
  language: string;
  intro: string;
  phases: PlanPhase[];
}

// EX is merged from two sources with different keying conventions:
// the base `lib/exercises.ts` keys by exercise id ("sl_glute_bridge_right"),
// while `lib/exercises-pwb.ts` keys by display name ("Half-Kneeling Landmine
// Press"). Rebuild a clean name-keyed map so name → Exercise is always direct.
const BY_NAME: Map<string, Exercise> = new Map();
for (const ex of Object.values(EX)) {
  if (ex && ex.name && !BY_NAME.has(ex.name)) BY_NAME.set(ex.name, ex);
}

function diagramPathFor(exerciseId: string): string | undefined {
  const diagramId = EXERCISE_TO_DIAGRAM[exerciseId];
  if (!diagramId) return undefined;
  return `diagrams/${diagramId}.svg`;
}

function formatSets(ex: Exercise): { sets?: string; reps?: string } {
  if (!ex.sets || ex.sets.length === 0) return {};
  const setCount = String(ex.sets.length);
  const repValues = ex.sets.map(([, reps]) => reps);
  const unique = [...new Set(repValues)];
  const reps = unique.length === 1 ? unique[0] : repValues.join(" / ");
  return { sets: setCount, reps };
}

function formatRest(seconds: number | undefined): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

function notesFor(ex: Exercise): string | undefined {
  const parts: string[] = [];
  if (ex.setup) parts.push(`Setup: ${ex.setup}`);
  if (ex.execution) parts.push(`Execution: ${ex.execution}`);
  if (ex.why) parts.push(`Why: ${ex.why}`);
  return parts.length ? parts.join(" ") : undefined;
}

function cuesFor(ex: Exercise): string[] | undefined {
  if (!ex.nwbCues) return undefined;
  const cues = ex.nwbCues
    .split(/[•\n]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  return cues.length ? cues : undefined;
}

function safetyFor(ex: Exercise): string | undefined {
  if (ex.safety === "danger") return "Danger — extra caution required.";
  if (ex.safety === "caution") return "Caution — review setup and execution before loading.";
  return undefined;
}

function buildExercise(name: string): PlanExercise | null {
  const ex = BY_NAME.get(name);
  if (!ex) {
    console.error(`[export-plan] unresolved exercise name: ${name}`);
    return null;
  }
  const { sets, reps } = formatSets(ex);
  return {
    name: ex.name,
    sets,
    reps,
    rest: formatRest(ex.rest),
    tempo: ex.tempo,
    notes: notesFor(ex),
    cues: cuesFor(ex),
    safety: safetyFor(ex),
    svg_path: diagramPathFor(ex.id),
  };
}

function buildDay(day: (typeof SCHED)[number]): PlanDay {
  const workout = WORKOUTS[day.t];
  if (!workout) {
    throw new Error(`[export-plan] unknown workout slug: ${day.t}`);
  }
  const exercises = workout.exercises
    .map(buildExercise)
    .filter((e): e is PlanExercise => e !== null);
  return {
    name: `${day.d} — ${workout.title}`,
    summary: workout.removed.length
      ? `Removed for this phase: ${workout.removed.map((r) => r.name).join(", ")}.`
      : undefined,
    exercises,
  };
}

function buildPlan(): Plan {
  const pwb = DEFAULT_PROGRAM_PHASES.find((p) => p.id === "pwb");
  if (!pwb) throw new Error("[export-plan] PWB phase not found in DEFAULT_PROGRAM_PHASES");

  const phase: PlanPhase = {
    id: pwb.id,
    name: `Phase — ${pwb.longName}`,
    description: pwb.desc,
    guidance: [
      "Toe-touch weight-bearing on left with crutches; walk normally otherwise.",
      "Bilateral lower-body work allowed (hamstring curl, leg extension, hip thrust).",
      "No left squat, no left leg press — avoid axial compression through the left femoral neck.",
      "Cardio: recumbent bike, swim, canoe OK. No rowing erg.",
      "Hip flexion fully unrestricted — the FAI / labral concern has been retired.",
    ],
    days: SCHED.map(buildDay),
  };

  return {
    id: `nwb-plan-pwb-${pwb.startDate.toISOString().slice(0, 10)}`,
    title: "NWB Plan — PWB Phase",
    authors: ["Karl"],
    language: "en",
    intro:
      "Reference deck for the PWB (Partial Weight Bearing) phase of the femoral " +
      "neck stress-fracture recovery program. Generated from the live data in " +
      "the nwb-plan repo; phase gating reflects the 2026-04-29 medical update.",
    phases: [phase],
  };
}

function main(): void {
  const args = process.argv.slice(2);
  let outPath: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out" && args[i + 1]) {
      outPath = args[i + 1];
      i++;
    }
  }

  const plan = buildPlan();
  const json = JSON.stringify(plan, null, 2);

  if (outPath) {
    const abs = resolve(outPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, json + "\n", "utf-8");
    console.error(`[export-plan] wrote ${abs}`);
  } else {
    process.stdout.write(json + "\n");
  }
}

main();
