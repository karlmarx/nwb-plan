-- ============================================================================
-- NWB Exercise Library — Postgres Schema (Neon / Vercel Marketplace)
-- ============================================================================
--
-- This schema mirrors the shape of `lib/exercises.ts` so the migration script
-- in `scripts/migrate-exercises-to-db.ts` can load it mechanically. Modelling
-- choices:
--
--   * `exercises` is the canonical row.  String-arrays whose only consumer is
--     "render this with the exercise" (`requires`, `swaps`, `amp`) live as
--     JSONB columns on the row — not lifted to junction tables.  We never
--     query "exercises by required equipment" today; if/when we do we add a
--     GIN index on the JSONB column.
--   * `sets` and `constraints` are JSONB.  `sets` is `[[count, reps], ...]`
--     and is a single nested literal in the source — denormalising would
--     destroy the ordering and force two extra tables for negligible gain.
--   * `machine_variants` IS lifted to its own table.  Variants have stable
--     ids (`plate_loaded`, `pin_loaded`, ...) that may be referenced
--     elsewhere (analytics, MCP search, swap-by-variant) and a per-row
--     `superset` JSONB so the variant carries its own coaching cue.
--   * `workouts`, `workout_exercises`, `core_finishers`, `schedule`, `phases`
--     mirror the rest of `lib/exercises.ts`.  These are static structural
--     data; they live in the same DB so the eventual MCP server can mutate
--     a routine without touching code.
--   * `lib/supplements.ts` (left-leg / core supplements) is intentionally
--     LEFT OUT of the DB for Phase 0.  See docs/exercise-backend.md for the
--     reasoning — those are tightly coupled to NWB safety invariants and
--     change less than once per quarter, so static-import remains correct.
--
-- Idempotency: every CREATE uses IF NOT EXISTS so this file is safe to run
-- against a fresh DB or one already migrated.
-- ============================================================================

-- ---- exercises ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exercises (
  -- Slug-ish primary key.  Matches the `id` field in the TypeScript source
  -- (e.g. `barbell_floor_press`).  Lower-snake.  PK is the natural choice
  -- because the client already uses these strings as map keys.
  id              TEXT PRIMARY KEY,

  -- Display name.  Doubles as the lookup key in lib/exercises.ts (`EX[name]`)
  -- so it must be unique.
  name            TEXT NOT NULL UNIQUE,

  category        TEXT NOT NULL,            -- "push" | "pull" | "legs" | "core" | "cardio" | ...
  rest_seconds    INTEGER NOT NULL,
  setup           TEXT NOT NULL,
  execution       TEXT NOT NULL,
  nwb_cues        TEXT NOT NULL,
  why             TEXT NOT NULL,
  safety          TEXT NOT NULL CHECK (safety IN ('safe', 'caution', 'danger')),

  -- Optional scalars
  visual          TEXT,                     -- ASCII art
  diagram         TEXT,                     -- diagram registry key (e.g. "planche")
  tempo           TEXT,                     -- e.g. "4-4-0"
  phase           INTEGER,                  -- 1 | 2 | 3
  tier            INTEGER,
  cable_superset  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Required equipment ids (string[]).  Read together with the row.
  -- ["barbell", "mat"]
  requires        JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Swap target names (string[]).  Read together with the row.
  swaps           JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Optional AMP progression strings (string[]).
  amp             JSONB,

  -- Set/rep tuples: [["4","5-6"], ["4","4-5"], ["5","3-5"]]
  sets            JSONB NOT NULL,

  -- Safety constraints object: { requiresIliopsoas, maxHipFlexion, requiresWeightBearing }
  constraints     JSONB NOT NULL,

  -- Muscle targeting: { primary: string[], secondary?: string[] }
  -- primary = main movers; secondary = significant assistors/stabilizers.
  muscles         JSONB NOT NULL DEFAULT '{"primary":[]}'::jsonb,

  -- Audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS exercises_category_idx ON exercises (category);
CREATE INDEX IF NOT EXISTS exercises_safety_idx   ON exercises (safety);
CREATE INDEX IF NOT EXISTS exercises_phase_idx    ON exercises (phase);
-- GIN on `requires` so a future query like "find exercises that need cables"
-- is cheap.  Cost is small for 80 rows; future-proofs the API.
CREATE INDEX IF NOT EXISTS exercises_requires_gin ON exercises USING GIN (requires);
-- GIN on `muscles` for queries like "show all exercises targeting gluteus medius".
CREATE INDEX IF NOT EXISTS exercises_muscles_idx  ON exercises USING GIN (muscles);

-- ---- machine_variants -----------------------------------------------------

CREATE TABLE IF NOT EXISTS machine_variants (
  -- Synthetic surrogate key — lets us PATCH a single variant without name
  -- collision concerns across exercises.
  pk                BIGSERIAL PRIMARY KEY,

  exercise_id       TEXT NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,

  -- Source-level id, e.g. "plate_loaded", "pin_loaded", "rogue_rack_barbell".
  -- Unique within the exercise; not globally unique (different exercises
  -- share "plate_loaded").
  variant_id        TEXT NOT NULL,

  label             TEXT NOT NULL,
  icon              TEXT NOT NULL,
  description       TEXT NOT NULL,

  setup_cues        JSONB NOT NULL DEFAULT '[]'::jsonb,    -- string[]
  variant_requires  JSONB,                                 -- string[] | null (overrides exercise.requires)
  superset          JSONB,                                 -- VariantSuperset | null

  -- Preserve source order so the UI's machine picker renders consistently.
  position          INTEGER NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (exercise_id, variant_id)
);

CREATE INDEX IF NOT EXISTS machine_variants_exercise_idx ON machine_variants (exercise_id);

-- ---- workouts -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workouts (
  -- Workout key, e.g. "Push A", "Legs B".  Matches WORKOUTS map keys.
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  icon        TEXT NOT NULL,
  color       TEXT NOT NULL,
  hevy_url    TEXT,
  -- Per-workout removed/excluded exercises with reasons:
  --   [{ "name": "Standing OHP", "reason": "Requires bilateral stance" }, ...]
  removed     JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ordered exercise list per workout (replaces WORKOUTS["Push A"].exercises[]).
CREATE TABLE IF NOT EXISTS workout_exercises (
  workout_id    TEXT NOT NULL REFERENCES workouts (id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  -- Matches the source: workout.exercises is an array of exercise NAMES
  -- (e.g. "Barbell Floor Press"), not ids.  We keep the same convention
  -- so the migration is a pure copy.  FK on (name) -> exercises.name via
  -- the unique constraint.
  exercise_name TEXT NOT NULL REFERENCES exercises (name) ON UPDATE CASCADE ON DELETE RESTRICT,

  PRIMARY KEY (workout_id, position)
);

CREATE INDEX IF NOT EXISTS workout_exercises_exercise_idx ON workout_exercises (exercise_name);

-- ---- core_finishers -------------------------------------------------------

-- CORE_FINISHERS: Record<workoutId, exerciseName[]>
CREATE TABLE IF NOT EXISTS core_finishers (
  workout_id    TEXT NOT NULL REFERENCES workouts (id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  exercise_name TEXT NOT NULL REFERENCES exercises (name) ON UPDATE CASCADE ON DELETE RESTRICT,

  PRIMARY KEY (workout_id, position)
);

-- ---- schedule -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schedule (
  day_of_week  TEXT PRIMARY KEY,    -- "Mon", "Tue", ...
  position     INTEGER NOT NULL,    -- 0-6 for ordering
  workout_id   TEXT NOT NULL REFERENCES workouts (id) ON DELETE RESTRICT,
  icon         TEXT NOT NULL,
  color        TEXT NOT NULL
);

-- ---- phases ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS phases (
  position     INTEGER PRIMARY KEY, -- 0, 1, 2 (preserves SCHED order)
  weeks        TEXT NOT NULL,       -- "1-2", "3-4", "5-6"
  name         TEXT NOT NULL,
  color        TEXT NOT NULL,
  description  TEXT NOT NULL
);

-- ---- equipment registry --------------------------------------------------

-- Mirror of EQUIPMENT in lib/exercises.ts.  Stored as a flat lookup so the
-- API can serve it alongside the exercise list (clients need both to render).
CREATE TABLE IF NOT EXISTS equipment (
  id        TEXT PRIMARY KEY,        -- "barbell", "dumbbells", ...
  name      TEXT NOT NULL,
  icon      TEXT NOT NULL,
  category  TEXT NOT NULL            -- "weights" | "machines" | "functional" | ...
);

-- ---- workout sessions (per-user logged workout history) ------------------
--
-- One row per finished WorkoutSession (lib/workout-log.ts). Active /
-- in-progress sessions stay client-side until endSession() runs, then push.
-- Conflict policy: last-write-wins per session id, by `updated_at`.
--
-- Modelling: the full WorkoutSession (including LoggedExercise[] / LoggedSet[])
-- lives in `data` JSONB. We never query "all sets above 200lbs across users"
-- — the only query is "give me this user's history" — so denormalising into
-- session/exercise/set tables would add three joins for zero benefit and
-- destroy ordering invariants. The hot scalars (`workout_key`, `started_at`,
-- `ended_at`) are mirrored as columns so the history index doesn't have to
-- crack the JSONB on every read.
--
-- equipment_photos are intentionally OUT — base64 dataURLs would balloon
-- the JSONB. They stay localStorage-only until we add object storage.
CREATE TABLE IF NOT EXISTS workout_sessions (
  id           TEXT PRIMARY KEY,        -- session.id from client (s-<base36>-<rand>)
  user_id      TEXT NOT NULL,           -- session.user.email
  workout_key  TEXT NOT NULL,           -- "Push A", "Legs B", "Freestyle", ...
  started_at   BIGINT NOT NULL,         -- epoch ms (matches client shape)
  ended_at     BIGINT,                  -- epoch ms; null only for resync edge cases
  data         JSONB NOT NULL,          -- full WorkoutSession blob
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workout_sessions_user_started_idx
  ON workout_sessions (user_id, started_at DESC);

-- ---- updated_at trigger ---------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exercises_updated_at        ON exercises;
DROP TRIGGER IF EXISTS machine_variants_updated_at ON machine_variants;
DROP TRIGGER IF EXISTS workouts_updated_at         ON workouts;
DROP TRIGGER IF EXISTS workout_sessions_updated_at ON workout_sessions;

CREATE TRIGGER exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER machine_variants_updated_at
  BEFORE UPDATE ON machine_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
