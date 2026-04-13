#!/usr/bin/env npx ts-node
/**
 * Export exercise data from the main nwb-plan TypeScript modules to JSON
 * files suitable for bundling into the Wear OS watch app.
 *
 * Usage: npx ts-node watch/scripts/export-data.ts
 *
 * Outputs:
 *   watch/app/src/main/res/raw/exercises.json
 *   watch/app/src/main/res/raw/workouts.json
 *   watch/app/src/main/res/raw/supplements.json
 */

import { EX, WORKOUTS, SCHED, PHASES } from "../../lib/exercises";
import {
  SUPPLEMENT_LEFT_LEG,
  SUPPLEMENT_CORE,
  SUPPLEMENT_EX,
  NEARBY_SUPERSETS,
  MOBILITY_SUPPLEMENTS,
  CABLE_SUPERSET,
  GENERIC_SEATED_SUPERSET,
} from "../../lib/supplements";
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = path.resolve(__dirname, "../app/src/main/res/raw");

// --- Exercises: strip visual/diagram fields, keep everything else ---
interface WatchExercise {
  id: string;
  name: string;
  requires: string[];
  category: string;
  sets: [string, string][];
  rest: number;
  setup: string;
  execution: string;
  nwbCues: string;
  why: string;
  safety: string;
  swaps: string[];
  tempo?: string;
  amp?: string[];
  phase?: number;
  tier?: number;
  cableSuperset?: boolean;
  constraints: {
    requiresIliopsoas: boolean;
    maxHipFlexion: number;
    requiresWeightBearing: boolean;
  };
  machineVariants?: {
    id: string;
    label: string;
    description: string;
    setupCues: string[];
    superset?: {
      title: string;
      sets: string;
      instruction: string;
      safety: string;
      note?: string;
    };
  }[];
}

const exercises: Record<string, WatchExercise> = {};
for (const [key, ex] of Object.entries(EX)) {
  exercises[key] = {
    id: ex.id,
    name: ex.name,
    requires: ex.requires,
    category: ex.category,
    sets: ex.sets,
    rest: ex.rest,
    setup: ex.setup,
    execution: ex.execution,
    nwbCues: ex.nwbCues,
    why: ex.why,
    safety: ex.safety,
    swaps: ex.swaps,
    tempo: ex.tempo,
    amp: ex.amp,
    phase: ex.phase,
    tier: ex.tier,
    cableSuperset: ex.cableSuperset,
    constraints: ex.constraints,
    machineVariants: ex.machineVariants?.map((v) => ({
      id: v.id,
      label: v.label,
      description: v.description,
      setupCues: v.setupCues,
      superset: v.superset,
    })),
  };
}

// --- Workouts: schedule, phases, workout definitions ---
const workouts = {
  schedule: SCHED,
  phases: PHASES,
  workouts: WORKOUTS,
};

// --- Supplements: left leg, core, nearby, mobility, cable, generic ---
const supplements = {
  leftLeg: SUPPLEMENT_LEFT_LEG,
  core: SUPPLEMENT_CORE,
  supplementExercises: SUPPLEMENT_EX,
  nearbySupersets: NEARBY_SUPERSETS,
  mobilitySupplement: MOBILITY_SUPPLEMENTS,
  cableSuperset: CABLE_SUPERSET,
  genericSeatedSuperset: GENERIC_SEATED_SUPERSET,
};

// --- Write files ---
fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(
  path.join(OUT_DIR, "exercises.json"),
  JSON.stringify(exercises, null, 2)
);
console.log(
  `  exercises.json: ${Object.keys(exercises).length} exercises, ${(
    Buffer.byteLength(JSON.stringify(exercises)) / 1024
  ).toFixed(1)}KB`
);

fs.writeFileSync(
  path.join(OUT_DIR, "workouts.json"),
  JSON.stringify(workouts, null, 2)
);
console.log(
  `  workouts.json: ${Object.keys(workouts.workouts).length} workouts, ${(
    Buffer.byteLength(JSON.stringify(workouts)) / 1024
  ).toFixed(1)}KB`
);

fs.writeFileSync(
  path.join(OUT_DIR, "supplements.json"),
  JSON.stringify(supplements, null, 2)
);
console.log(
  `  supplements.json: ${(
    Buffer.byteLength(JSON.stringify(supplements)) / 1024
  ).toFixed(1)}KB`
);

const totalKB = [exercises, workouts, supplements]
  .map((d) => Buffer.byteLength(JSON.stringify(d)))
  .reduce((a, b) => a + b, 0) / 1024;

console.log(`\nTotal: ${totalKB.toFixed(1)}KB bundled for watch`);
