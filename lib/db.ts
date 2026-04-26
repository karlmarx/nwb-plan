/**
 * Postgres client + typed query helpers for the exercise library.
 *
 * Why @vercel/postgres:
 *   - Zero setup when Neon Postgres is provisioned via Vercel Marketplace.
 *     The integration auto-injects POSTGRES_URL, POSTGRES_PRISMA_URL,
 *     POSTGRES_URL_NON_POOLING, POSTGRES_USER, POSTGRES_HOST,
 *     POSTGRES_PASSWORD, POSTGRES_DATABASE.  `@vercel/postgres` reads
 *     POSTGRES_URL by default — nothing else to wire up.
 *   - Connection pooling handled for us; safe in Edge + Node runtimes.
 *   - Falls through to `pg` semantics when running locally with a plain
 *     POSTGRES_URL (e.g. `postgres://localhost/nwb_plan`), so dev parity
 *     is fine.
 *
 * Lazy initialization:
 *   - We never read `process.env.POSTGRES_URL` at module load.  Instead the
 *     `@vercel/postgres` `sql` template tag reads it lazily on first query.
 *     This keeps `next build` happy in environments where the DB env vars
 *     are deliberately absent (e.g. CI building a preview that doesn't talk
 *     to the DB at runtime).
 *
 * The shape returned by getAllExercises / getExerciseById matches the
 * `Exercise` type in `lib/exercises.ts` so the eventual client refactor is
 * mechanical: drop the static import, swap in `await fetch('/api/exercises')`.
 */

import { sql } from "@vercel/postgres";

// --- types ----------------------------------------------------------------
// Mirror lib/exercises.ts WITHOUT importing it (to avoid pulling 120KB of
// data into the API runtime).  Keep these in sync manually; the migration
// script enforces the contract at run time.

export interface ExerciseConstraints {
  requiresIliopsoas: boolean;
  maxHipFlexion: number;
  requiresWeightBearing: boolean;
}

export interface ExerciseMuscles {
  primary: string[];
  secondary?: string[];
}

export interface VariantSuperset {
  title: string;
  sets: string;
  instruction: string;
  safety: string;
  note?: string;
}

export interface MachineVariant {
  id: string;
  label: string;
  icon: string;
  description: string;
  setupCues: string[];
  superset?: VariantSuperset;
  requires?: string[];
}

export type SafetyLevel = "safe" | "caution" | "danger";

export interface Exercise {
  id: string;
  name: string;
  category: string;
  rest: number;
  setup: string;
  execution: string;
  nwbCues: string;
  why: string;
  safety: SafetyLevel;
  visual?: string;
  diagram?: string;
  tempo?: string;
  phase?: number;
  tier?: number;
  cableSuperset?: boolean;
  requires: string[];
  swaps: string[];
  amp?: string[];
  sets: [string, string][];
  constraints: ExerciseConstraints;
  muscles: ExerciseMuscles;
  machineVariants?: MachineVariant[];
}

/**
 * Input shape for create/update.  Same as Exercise minus auto-managed fields.
 * Both include `machineVariants` because writes own that aggregate.
 */
export type ExerciseInput = Omit<Exercise, "id"> & { id: string };
export type ExerciseUpdate = Partial<ExerciseInput>;

// --- internal helpers -----------------------------------------------------

/**
 * Reassemble an Exercise from a joined exercises + machine_variants row set.
 * Centralised so every read path returns the same shape.
 */
interface ExerciseRow {
  id: string;
  name: string;
  category: string;
  rest_seconds: number;
  setup: string;
  execution: string;
  nwb_cues: string;
  why: string;
  safety: SafetyLevel;
  visual: string | null;
  diagram: string | null;
  tempo: string | null;
  phase: number | null;
  tier: number | null;
  cable_superset: boolean;
  requires: string[];
  swaps: string[];
  amp: string[] | null;
  sets: [string, string][];
  constraints: ExerciseConstraints;
  muscles: ExerciseMuscles;
}

interface VariantRow {
  exercise_id: string;
  variant_id: string;
  label: string;
  icon: string;
  description: string;
  setup_cues: string[];
  variant_requires: string[] | null;
  superset: VariantSuperset | null;
  position: number;
}

function rowToExercise(
  row: ExerciseRow,
  variants: VariantRow[],
): Exercise {
  const ex: Exercise = {
    id: row.id,
    name: row.name,
    category: row.category,
    rest: row.rest_seconds,
    setup: row.setup,
    execution: row.execution,
    nwbCues: row.nwb_cues,
    why: row.why,
    safety: row.safety,
    requires: row.requires,
    swaps: row.swaps,
    sets: row.sets,
    constraints: row.constraints,
    muscles: row.muscles,
  };

  if (row.visual != null) ex.visual = row.visual;
  if (row.diagram != null) ex.diagram = row.diagram;
  if (row.tempo != null) ex.tempo = row.tempo;
  if (row.phase != null) ex.phase = row.phase;
  if (row.tier != null) ex.tier = row.tier;
  if (row.cable_superset) ex.cableSuperset = true;
  if (row.amp != null) ex.amp = row.amp;

  if (variants.length > 0) {
    ex.machineVariants = variants
      .sort((a, b) => a.position - b.position)
      .map((v): MachineVariant => {
        const mv: MachineVariant = {
          id: v.variant_id,
          label: v.label,
          icon: v.icon,
          description: v.description,
          setupCues: v.setup_cues,
        };
        if (v.variant_requires != null) mv.requires = v.variant_requires;
        if (v.superset != null) mv.superset = v.superset;
        return mv;
      });
  }

  return ex;
}

// --- public API -----------------------------------------------------------

/**
 * Return every exercise in the library, with machine variants nested.
 * Two queries; we stitch in JS rather than a heavy join to keep the JSONB
 * payload manageable.
 */
export async function getAllExercises(): Promise<Exercise[]> {
  const exRes = await sql<ExerciseRow>`
    SELECT id, name, category, rest_seconds, setup, execution, nwb_cues,
           why, safety, visual, diagram, tempo, phase, tier, cable_superset,
           requires, swaps, amp, sets, constraints, muscles
    FROM exercises
    ORDER BY category, name
  `;

  const variantRes = await sql<VariantRow>`
    SELECT exercise_id, variant_id, label, icon, description,
           setup_cues, variant_requires, superset, position
    FROM machine_variants
    ORDER BY exercise_id, position
  `;

  const variantsByExercise = new Map<string, VariantRow[]>();
  for (const v of variantRes.rows) {
    const list = variantsByExercise.get(v.exercise_id) ?? [];
    list.push(v);
    variantsByExercise.set(v.exercise_id, list);
  }

  return exRes.rows.map((row) =>
    rowToExercise(row, variantsByExercise.get(row.id) ?? []),
  );
}

/**
 * Look up one exercise by its slug-id (e.g. "barbell_floor_press").
 * Returns null when not found.
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  const exRes = await sql<ExerciseRow>`
    SELECT id, name, category, rest_seconds, setup, execution, nwb_cues,
           why, safety, visual, diagram, tempo, phase, tier, cable_superset,
           requires, swaps, amp, sets, constraints, muscles
    FROM exercises
    WHERE id = ${id}
    LIMIT 1
  `;

  if (exRes.rows.length === 0) return null;

  const variantRes = await sql<VariantRow>`
    SELECT exercise_id, variant_id, label, icon, description,
           setup_cues, variant_requires, superset, position
    FROM machine_variants
    WHERE exercise_id = ${id}
    ORDER BY position
  `;

  return rowToExercise(exRes.rows[0], variantRes.rows);
}

/**
 * Insert (or upsert) an exercise + its machine variants.
 *
 * Idempotent: re-running with the same id replaces the row's mutable
 * columns and rewrites variant rows.  Used by both the migration script
 * and the public POST route — same code path either way.
 */
export async function createExercise(data: ExerciseInput): Promise<Exercise> {
  await sql`
    INSERT INTO exercises (
      id, name, category, rest_seconds, setup, execution, nwb_cues, why,
      safety, visual, diagram, tempo, phase, tier, cable_superset,
      requires, swaps, amp, sets, constraints, muscles
    ) VALUES (
      ${data.id},
      ${data.name},
      ${data.category},
      ${data.rest},
      ${data.setup},
      ${data.execution},
      ${data.nwbCues},
      ${data.why},
      ${data.safety},
      ${data.visual ?? null},
      ${data.diagram ?? null},
      ${data.tempo ?? null},
      ${data.phase ?? null},
      ${data.tier ?? null},
      ${data.cableSuperset ?? false},
      ${JSON.stringify(data.requires)}::jsonb,
      ${JSON.stringify(data.swaps)}::jsonb,
      ${data.amp ? JSON.stringify(data.amp) : null}::jsonb,
      ${JSON.stringify(data.sets)}::jsonb,
      ${JSON.stringify(data.constraints)}::jsonb,
      ${JSON.stringify(data.muscles)}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      name           = EXCLUDED.name,
      category       = EXCLUDED.category,
      rest_seconds   = EXCLUDED.rest_seconds,
      setup          = EXCLUDED.setup,
      execution      = EXCLUDED.execution,
      nwb_cues       = EXCLUDED.nwb_cues,
      why            = EXCLUDED.why,
      safety         = EXCLUDED.safety,
      visual         = EXCLUDED.visual,
      diagram        = EXCLUDED.diagram,
      tempo          = EXCLUDED.tempo,
      phase          = EXCLUDED.phase,
      tier           = EXCLUDED.tier,
      cable_superset = EXCLUDED.cable_superset,
      requires       = EXCLUDED.requires,
      swaps          = EXCLUDED.swaps,
      amp            = EXCLUDED.amp,
      sets           = EXCLUDED.sets,
      constraints    = EXCLUDED.constraints,
      muscles        = EXCLUDED.muscles
  `;

  // Replace the variants set — simplest correct semantics.  At ~5 variants
  // max per exercise, the cost is negligible.
  await sql`DELETE FROM machine_variants WHERE exercise_id = ${data.id}`;

  if (data.machineVariants && data.machineVariants.length > 0) {
    for (let i = 0; i < data.machineVariants.length; i++) {
      const v = data.machineVariants[i];
      await sql`
        INSERT INTO machine_variants (
          exercise_id, variant_id, label, icon, description,
          setup_cues, variant_requires, superset, position
        ) VALUES (
          ${data.id},
          ${v.id},
          ${v.label},
          ${v.icon},
          ${v.description},
          ${JSON.stringify(v.setupCues)}::jsonb,
          ${v.requires ? JSON.stringify(v.requires) : null}::jsonb,
          ${v.superset ? JSON.stringify(v.superset) : null}::jsonb,
          ${i}
        )
      `;
    }
  }

  const created = await getExerciseById(data.id);
  if (!created) {
    // Should be unreachable — we just wrote it.
    throw new Error(`createExercise: row vanished after upsert (id=${data.id})`);
  }
  return created;
}

/**
 * PATCH an exercise.  Only fields present in `patch` are updated.
 *
 * Variants are special-cased: if the patch includes `machineVariants`, we
 * replace the entire set (matches the API contract of "update is a write
 * for the field provided").  If absent, variants are untouched.
 */
export async function updateExercise(
  id: string,
  patch: ExerciseUpdate,
): Promise<Exercise | null> {
  const existing = await getExerciseById(id);
  if (!existing) return null;

  // Merge: anything not provided keeps its old value.
  const merged: ExerciseInput = {
    ...existing,
    ...patch,
    id, // never let the patch rewrite the primary key
  };

  // If the caller didn't pass machineVariants, preserve the existing ones
  // by passing them through createExercise's variant-replacement path.
  if (!("machineVariants" in patch)) {
    merged.machineVariants = existing.machineVariants;
  }

  return createExercise(merged);
}

/**
 * Delete an exercise.  Returns true if a row was removed.
 * machine_variants rows cascade.
 */
export async function deleteExercise(id: string): Promise<boolean> {
  const res = await sql`DELETE FROM exercises WHERE id = ${id}`;
  return (res.rowCount ?? 0) > 0;
}
