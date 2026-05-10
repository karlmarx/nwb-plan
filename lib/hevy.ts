// Browser-side Hevy client — all calls go through /api/hevy proxy.
// The Hevy API key lives server-side; the browser never sees it. Auth on the
// proxy endpoint is admin-only via NextAuth session.

async function hevyCall(
  action: string,
  params: Record<string, unknown> = {}
) {
  const res = await fetch("/api/hevy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getHevyStatus(): Promise<{ configured: boolean }> {
  const res = await fetch("/api/hevy");
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) return { configured: false };
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export function searchExercises(query: string) {
  return hevyCall("search-exercises", { query });
}

export function listRoutines() {
  return hevyCall("list-routines");
}

export function getRoutine(routineId: string) {
  return hevyCall("get-routine", { routineId });
}

export function updateRoutine(routineId: string, routine: HevyRoutine) {
  return hevyCall("update-routine", { routineId, routine });
}

export function createRoutine(routine: HevyRoutine) {
  return hevyCall("create-routine", { routine });
}

export function listWorkouts(page: number = 1, pageSize: number = 10) {
  return hevyCall("list-workouts", { page, pageSize });
}

export function listExerciseTemplates(page: number = 1, pageSize: number = 100) {
  return hevyCall("list-exercise-templates", { page, pageSize });
}

/**
 * Pull every page of workout history from Hevy. Calls onProgress after each
 * page so the UI can show a progress indicator.
 */
export async function fetchAllWorkouts(
  onProgress?: (current: number, total: number) => void
): Promise<HevyWorkout[]> {
  const all: HevyWorkout[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await listWorkouts(page, 10);
    if (Array.isArray(data.workouts)) all.push(...(data.workouts as HevyWorkout[]));
    totalPages = data.page_count ?? totalPages;
    onProgress?.(page, totalPages);
    page += 1;
  } while (page <= totalPages);
  return all;
}

/**
 * Pull every page of the user's exercise template catalog. Used to detect
 * which titles in workout history are user-created (`is_custom: true`).
 */
export async function fetchAllExerciseTemplates(
  onProgress?: (current: number, total: number) => void
): Promise<HevyExerciseTemplate[]> {
  const all: HevyExerciseTemplate[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await listExerciseTemplates(page, 100);
    if (Array.isArray(data.exercise_templates))
      all.push(...(data.exercise_templates as HevyExerciseTemplate[]));
    totalPages = data.page_count ?? totalPages;
    onProgress?.(page, totalPages);
    page += 1;
  } while (page <= totalPages);
  return all;
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

export interface HevyWorkout {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  exercises: HevyExercise[];
}

export interface HevyExerciseTemplate {
  id: string;
  title: string;
  type?: string;
  primary_muscle_group?: string;
  is_custom?: boolean;
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
