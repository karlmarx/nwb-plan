// Frontend client — all calls go through /api/hevy proxy

async function hevyCall(action, apiKey, params = {}) {
  const res = await fetch('/api/hevy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, apiKey, ...params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function searchExercises(apiKey, query) {
  return hevyCall('search-exercises', apiKey, { query });
}

export function listRoutines(apiKey) {
  return hevyCall('list-routines', apiKey);
}

export function getRoutine(apiKey, routineId) {
  return hevyCall('get-routine', apiKey, { routineId });
}

export function updateRoutine(apiKey, routineId, routine) {
  return hevyCall('update-routine', apiKey, { routineId, routine });
}

export function createRoutine(apiKey, routine) {
  return hevyCall('create-routine', apiKey, { routine });
}

// Convert app set format [setsCount, repsOrTime] to Hevy set objects
// e.g. ['3', '8'] → 3 × {type:'weight_reps', reps:8}
// e.g. ['3', '30s'] → 3 × {type:'duration', duration_seconds:30}
export function buildHevySets(setsArr) {
  const [countStr, repStr] = setsArr;
  const count = parseInt(countStr) || 3;
  const timeMatch = String(repStr).match(/^(\d+)s$/);
  const isTime = !!timeMatch;

  return Array.from({ length: count }, (_, i) => {
    if (isTime) {
      return { index: i, type: 'duration', duration_seconds: parseInt(timeMatch[1]) };
    }
    const reps = parseInt(repStr) || 8;
    return { index: i, type: 'weight_reps', weight_kg: null, reps };
  });
}

// Build a Hevy routine object from app exercise names + phase + exercise map
// exerciseMap: { [appName]: { templateId, title } }
export function buildHevyRoutine(title, exerciseNames, phase, exerciseMap, exData) {
  const exercises = exerciseNames
    .map((name, idx) => {
      const mapping = exerciseMap[name];
      const ex = exData[name];
      if (!mapping || !ex) return null;

      const phaseSets = ex.sets?.[phase] ?? ex.sets?.[0] ?? ['3', '8'];
      const sets = buildHevySets(phaseSets);

      return {
        index: idx,
        title: mapping.title || name,
        notes: '',
        exercise_template_id: mapping.templateId,
        sets,
      };
    })
    .filter(Boolean);

  return { title, notes: '', exercises };
}
