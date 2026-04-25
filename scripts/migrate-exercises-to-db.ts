// TODO: run with: npx tsx scripts/migrate-exercises-to-db.ts
//
// One-shot migration script that copies the static exercise library
// (lib/exercises.ts) into Postgres.  Idempotent — safe to re-run.
//
// Prerequisites:
//   1. Provision Neon Postgres via Vercel Marketplace; the integration
//      auto-injects POSTGRES_URL into your Vercel env.
//   2. `vercel env pull .env.local` so the script can connect locally.
//   3. Apply schema:
//        psql "$POSTGRES_URL" -f db/schema.sql
//   4. Run this script:
//        npx tsx scripts/migrate-exercises-to-db.ts
//
// Safety: this script ONLY upserts. It does NOT delete rows in the DB
// that are absent from the source.  That's deliberate — gives us a
// rollback runway during Phase 1 of the migration plan.

import { sql } from "@vercel/postgres";

import {
  EX,
  EQUIPMENT,
  WORKOUTS,
  CORE_FINISHERS,
  SCHED,
  PHASES,
} from "../lib/exercises";
import { createExercise, type ExerciseInput } from "../lib/db";

async function migrate() {
  console.log("=== NWB exercise library → Postgres ===");

  if (!process.env.POSTGRES_URL) {
    console.error(
      "POSTGRES_URL not set.  Run `vercel env pull .env.local` first.",
    );
    process.exit(1);
  }

  // 1. exercises (+ machine_variants via createExercise's upsert)
  const exercises = Object.values(EX);
  console.log(`Upserting ${exercises.length} exercises…`);
  for (const ex of exercises) {
    const input: ExerciseInput = {
      id: ex.id,
      name: ex.name,
      category: ex.category,
      rest: ex.rest,
      setup: ex.setup,
      execution: ex.execution,
      nwbCues: ex.nwbCues,
      why: ex.why,
      safety: ex.safety,
      requires: ex.requires,
      swaps: ex.swaps,
      sets: ex.sets,
      constraints: ex.constraints,
    };
    if (ex.visual !== undefined) input.visual = ex.visual;
    if (ex.diagram !== undefined) input.diagram = ex.diagram;
    if (ex.tempo !== undefined) input.tempo = ex.tempo;
    if (ex.phase !== undefined) input.phase = ex.phase;
    if (ex.tier !== undefined) input.tier = ex.tier;
    if (ex.cableSuperset !== undefined) input.cableSuperset = ex.cableSuperset;
    if (ex.amp !== undefined) input.amp = ex.amp;
    if (ex.machineVariants !== undefined) {
      input.machineVariants = ex.machineVariants;
    }

    await createExercise(input);
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  // 2. equipment
  console.log(`Upserting ${Object.keys(EQUIPMENT).length} equipment items…`);
  for (const [id, item] of Object.entries(EQUIPMENT)) {
    await sql`
      INSERT INTO equipment (id, name, icon, category)
      VALUES (${id}, ${item.name}, ${item.icon}, ${item.category})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        icon = EXCLUDED.icon,
        category = EXCLUDED.category
    `;
  }

  // 3. workouts (+ workout_exercises)
  console.log(`Upserting ${Object.keys(WORKOUTS).length} workouts…`);
  for (const [id, w] of Object.entries(WORKOUTS)) {
    await sql`
      INSERT INTO workouts (id, title, icon, color, hevy_url, removed)
      VALUES (
        ${id},
        ${w.title},
        ${w.icon},
        ${w.color},
        ${w.hevy ?? null},
        ${JSON.stringify(w.removed)}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        title    = EXCLUDED.title,
        icon     = EXCLUDED.icon,
        color    = EXCLUDED.color,
        hevy_url = EXCLUDED.hevy_url,
        removed  = EXCLUDED.removed
    `;

    await sql`DELETE FROM workout_exercises WHERE workout_id = ${id}`;
    for (let i = 0; i < w.exercises.length; i++) {
      await sql`
        INSERT INTO workout_exercises (workout_id, position, exercise_name)
        VALUES (${id}, ${i}, ${w.exercises[i]})
      `;
    }
  }

  // 4. core_finishers
  console.log("Upserting core finishers…");
  for (const [workoutId, names] of Object.entries(CORE_FINISHERS)) {
    await sql`DELETE FROM core_finishers WHERE workout_id = ${workoutId}`;
    for (let i = 0; i < names.length; i++) {
      await sql`
        INSERT INTO core_finishers (workout_id, position, exercise_name)
        VALUES (${workoutId}, ${i}, ${names[i]})
      `;
    }
  }

  // 5. schedule
  console.log("Upserting schedule…");
  await sql`DELETE FROM schedule`;
  for (let i = 0; i < SCHED.length; i++) {
    const day = SCHED[i];
    await sql`
      INSERT INTO schedule (day_of_week, position, workout_id, icon, color)
      VALUES (${day.d}, ${i}, ${day.t}, ${day.i}, ${day.c})
    `;
  }

  // 6. phases
  console.log("Upserting phases…");
  await sql`DELETE FROM phases`;
  for (let i = 0; i < PHASES.length; i++) {
    const p = PHASES[i];
    await sql`
      INSERT INTO phases (position, weeks, name, color, description)
      VALUES (${i}, ${p.weeks}, ${p.name}, ${p.color}, ${p.desc})
    `;
  }

  console.log("✓ migration complete");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
