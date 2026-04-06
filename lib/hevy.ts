// Browser-side Hevy client — all calls go through /api/hevy proxy

async function hevyCall(
  action: string,
  apiKey: string,
  params: Record<string, unknown> = {}
) {
  const res = await fetch("/api/hevy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, apiKey, ...params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function searchExercises(apiKey: string, query: string) {
  return hevyCall("search-exercises", apiKey, { query });
}

export function listRoutines(apiKey: string) {
  return hevyCall("list-routines", apiKey);
}

export function getRoutine(apiKey: string, routineId: string) {
  return hevyCall("get-routine", apiKey, { routineId });
}

export function updateRoutine(
  apiKey: string,
  routineId: string,
  routine: HevyRoutine
) {
  return hevyCall("update-routine", apiKey, { routineId, routine });
}

export function createRoutine(apiKey: string, routine: HevyRoutine) {
  return hevyCall("create-routine", apiKey, { routine });
}

// ── Types ────────────────────────────────────────────────────
export interface HevySet {
  index: number;
  type: string;
  weight_kg?: number | null;
  reps?: number;
  duration_seconds?: number;
}

export interface HevyExercise {
  index: number;
  title: string;
  notes: string;
  exercise_template_id: string;
  sets: HevySet[];
}

export interface HevyRoutine {
  title: string;
  notes: string;
  exercises: HevyExercise[];
}

export interface ExerciseMapping {
  templateId: string;
  title: string;
}

// ── Set builder ──────────────────────────────────────────────
// Converts app set format ['3','8'] or ['3','30s'] → Hevy sets
export function buildHevySets(setsArr: [string, string]): HevySet[] {
  const [countStr, repStr] = setsArr;
  const count = parseInt(countStr) || 3;
  const timeMatch = String(repStr).match(/^(\d+)s$/);

  return Array.from({ length: count }, (_, i) => {
    if (timeMatch) {
      return {
        index: i,
        type: "duration",
        duration_seconds: parseInt(timeMatch[1]),
      };
    }
    return {
      index: i,
      type: "weight_reps",
      weight_kg: null,
      reps: parseInt(repStr) || 8,
    };
  });
}

// ── Routine builder ──────────────────────────────────────────
export function buildHevyRoutine(
  title: string,
  exerciseNames: string[],
  phase: number,
  exerciseMap: Record<string, ExerciseMapping>,
  exData: Record<string, { sets: [string, string][] }>
): HevyRoutine {
  const exercises: HevyExercise[] = exerciseNames
    .map((name, idx) => {
      const mapping = exerciseMap[name];
      const ex = exData[name];
      if (!mapping || !ex) return null;

      const phaseSets = ex.sets?.[phase] ?? ex.sets?.[0] ?? ["3", "8"];
      const sets = buildHevySets(phaseSets as [string, string]);

      return {
        index: idx,
        title: mapping.title || name,
        notes: "",
        exercise_template_id: mapping.templateId,
        sets,
      };
    })
    .filter((e): e is HevyExercise => e !== null);

  return { title, notes: "", exercises };
}
