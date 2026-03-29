import { useState, useCallback } from 'react';
import { C } from '../theme';
import { EX } from '../data/exercises';
import { WORKOUTS } from '../data/program';
import { loadState, saveState } from '../utils/storage';
import { searchExercises, listRoutines, updateRoutine, createRoutine, buildHevyRoutine } from '../utils/hevy';

// ── Exercise Mapper ──────────────────────────────────────────
function ExerciseMapper({ apiKey, exerciseMap, onMapChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null); // which app exercise we're mapping
  const [error, setError] = useState('');

  const appExercises = Object.keys(EX);

  async function doSearch(name) {
    if (!apiKey) { setError('Enter API key first'); return; }
    setSearching(true);
    setError('');
    setActiveTarget(name);
    try {
      const data = await searchExercises(apiKey, name);
      setResults(data.exercise_templates || []);
    } catch (e) {
      setError(e.message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectMapping(appName, template) {
    onMapChange(appName, { templateId: template.id, title: template.title });
    setResults(null);
    setActiveTarget(null);
  }

  function clearMapping(appName) {
    onMapChange(appName, null);
  }

  const mapped = appExercises.filter((n) => exerciseMap[n]);
  const unmapped = appExercises.filter((n) => !exerciseMap[n]);

  // Which exercises appear in any workout
  const workoutExercises = new Set(
    Object.values(WORKOUTS).flatMap((w) => w.exercises)
  );

  const [showAll, setShowAll] = useState(false);
  const displayed = showAll
    ? appExercises
    : appExercises.filter((n) => workoutExercises.has(n));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: C.textMuted }}>
          {mapped.length} / {appExercises.length} mapped
          &nbsp;({Object.values(WORKOUTS).flatMap((w) => w.exercises).filter((n) => !exerciseMap[n]).length} workout exercises unmapped)
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          style={{ fontSize: 10, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {showAll ? 'Show workout exercises only' : 'Show all exercises'}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: C.danger, marginBottom: 8, padding: '6px 10px', borderRadius: 6, background: C.dangerBg, border: '1px solid ' + C.dangerBorder }}>
          {error}
        </div>
      )}

      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {displayed.map((name) => {
          const mapping = exerciseMap[name];
          const isActive = activeTarget === name;
          return (
            <div key={name} style={{ marginBottom: 6 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', borderRadius: 8,
                background: mapping ? '#0d1f14' : C.bg,
                border: '1px solid ' + (mapping ? '#2ecc71' : C.border),
              }}>
                <div style={{ flex: 1, fontSize: 11, color: mapping ? '#2ecc71' : C.text, minWidth: 0 }}>
                  <div style={{ fontWeight: mapping ? 600 : 400 }}>{name}</div>
                  {mapping && (
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>
                      → {mapping.title} <span style={{ opacity: 0.5 }}>({mapping.templateId})</span>
                    </div>
                  )}
                </div>
                {mapping ? (
                  <button onClick={() => clearMapping(name)} style={smallBtn(C.danger)}>✕</button>
                ) : (
                  <button
                    onClick={() => doSearch(name)}
                    disabled={searching && isActive}
                    style={smallBtn(C.accent)}
                  >
                    {searching && isActive ? '…' : 'Search'}
                  </button>
                )}
              </div>

              {isActive && results && (
                <div style={{ margin: '4px 0 0 16px', border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
                  {results.length === 0 ? (
                    <div style={{ padding: '8px 10px', fontSize: 11, color: C.textMuted }}>No results. Try different name.</div>
                  ) : (
                    results.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => selectMapping(name, t)}
                        style={{
                          padding: '7px 10px', fontSize: 11, cursor: 'pointer',
                          borderBottom: '1px solid ' + C.border,
                          background: C.card, color: C.text,
                          display: 'flex', justifyContent: 'space-between',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = C.bg}
                        onMouseOut={(e) => e.currentTarget.style.background = C.card}
                      >
                        <span>{t.title}</span>
                        <span style={{ fontSize: 10, color: C.textMuted }}>{t.muscle_group || ''}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Routine Sync Row ─────────────────────────────────────────
function RoutineRow({ workoutKey, hevyRoutineId, exercises, apiKey, phase, exerciseMap, onRoutineIdChange }) {
  const [status, setStatus] = useState('idle'); // idle | syncing | ok | error
  const [msg, setMsg] = useState('');

  async function sync() {
    if (!apiKey) { setMsg('No API key'); setStatus('error'); return; }
    const unmapped = exercises.filter((n) => EX[n] && !exerciseMap[n]);
    if (unmapped.length > 0) {
      setMsg(`${unmapped.length} unmapped: ${unmapped.slice(0, 3).join(', ')}${unmapped.length > 3 ? '…' : ''}`);
      setStatus('error');
      return;
    }

    setStatus('syncing');
    setMsg('');
    try {
      const w = WORKOUTS[workoutKey];
      const routine = buildHevyRoutine(w.title, exercises, phase, exerciseMap, EX);

      if (hevyRoutineId) {
        await updateRoutine(apiKey, hevyRoutineId, routine);
        setMsg('Updated');
      } else {
        const res = await createRoutine(apiKey, routine);
        const newId = res?.routine?.id;
        if (newId) onRoutineIdChange(workoutKey, newId);
        setMsg('Created');
      }
      setStatus('ok');
    } catch (e) {
      setMsg(e.message);
      setStatus('error');
    }
  }

  const w = WORKOUTS[workoutKey];
  const mappedCount = exercises.filter((n) => exerciseMap[n]).length;
  const totalCount = exercises.filter((n) => EX[n]).length;

  return (
    <div style={{
      padding: '10px 12px', marginBottom: 6, borderRadius: 10,
      background: C.bg, border: '1px solid ' + C.border,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{w.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: w.color }}>{workoutKey}</div>
          <div style={{ fontSize: 10, color: C.textMuted }}>
            {mappedCount}/{totalCount} exercises mapped
            {hevyRoutineId && <span style={{ marginLeft: 6, opacity: 0.5 }}>ID: {hevyRoutineId.slice(0, 8)}…</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {status === 'ok' && <span style={{ fontSize: 11, color: '#2ecc71' }}>✓ {msg}</span>}
          {status === 'error' && <span style={{ fontSize: 10, color: C.danger, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={msg}>⚠ {msg}</span>}
          {status === 'syncing' && <span style={{ fontSize: 11, color: C.textMuted }}>Syncing…</span>}
          <button
            onClick={sync}
            disabled={status === 'syncing'}
            style={{
              fontSize: 11, padding: '5px 12px', borderRadius: 8,
              background: mappedCount === totalCount ? C.accent + '22' : 'transparent',
              border: '1px solid ' + (mappedCount === totalCount ? C.accent : C.border),
              color: mappedCount === totalCount ? C.accent : C.textMuted,
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            }}
          >
            {hevyRoutineId ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────
export default function HevySyncPanel({ phase, hevyIds, onHevyIdChange, customWorkouts }) {
  const [apiKey, setApiKey] = useState(() => loadState('nwb_hevy_api_key', ''));
  const [showKey, setShowKey] = useState(false);
  const [exerciseMap, setExerciseMap] = useState(() => loadState('nwb_hevy_exercise_map', {}));
  const [activeSection, setActiveSection] = useState('sync'); // sync | map

  function saveKey(k) {
    setApiKey(k);
    saveState('nwb_hevy_api_key', k);
  }

  function updateMapping(appName, mapping) {
    const next = { ...exerciseMap };
    if (mapping === null) {
      delete next[appName];
    } else {
      next[appName] = mapping;
    }
    setExerciseMap(next);
    saveState('nwb_hevy_exercise_map', next);
  }

  function handleRoutineIdChange(workoutKey, newId) {
    onHevyIdChange(workoutKey, newId);
  }

  const workoutKeys = Object.keys(WORKOUTS).filter((k) => k !== 'Recovery');

  return (
    <div>
      {/* API Key */}
      <div style={{
        padding: '12px', marginBottom: 12, borderRadius: 10,
        background: C.card, border: '1px solid ' + C.border,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Hevy API Key
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="Paste API key from hevy.com/settings?developer"
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 8,
              background: C.bg, border: '1px solid ' + (apiKey ? '#2ecc71' : C.border),
              color: C.text, fontSize: 11, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{ ...smallBtn(C.textMuted), padding: '6px 10px' }}
          >
            {showKey ? '🙈' : '👁'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 6 }}>
          Requires Hevy Pro. Get key at{' '}
          <span style={{ color: C.accent, cursor: 'pointer' }}
            onClick={() => window.open('https://hevy.com/settings?developer', '_blank')}
          >
            hevy.com/settings?developer
          </span>
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid ' + C.border }}>
        {[['sync', '⚡ Sync Routines'], ['map', '🗺 Exercise Mapping']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              flex: 1, padding: '8px', fontSize: 11, fontFamily: 'inherit', border: 'none',
              background: activeSection === key ? C.accent + '22' : C.card,
              color: activeSection === key ? C.accent : C.textMuted,
              cursor: 'pointer', fontWeight: activeSection === key ? 700 : 400,
              borderBottom: activeSection === key ? '2px solid ' + C.accent : '2px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'sync' && (
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10, lineHeight: 1.5 }}>
            Maps your customized workout exercise lists to your Hevy routines.
            Exercises must be mapped first (Exercise Mapping tab).
            Sets are pulled from the current phase.
          </div>
          {workoutKeys.map((key) => {
            const w = WORKOUTS[key];
            const exercises = customWorkouts[key] || w.exercises;
            const routineId = hevyIds[key]?.replace(/.*routine\//, '');
            return (
              <RoutineRow
                key={key}
                workoutKey={key}
                hevyRoutineId={routineId}
                exercises={exercises}
                apiKey={apiKey}
                phase={phase}
                exerciseMap={exerciseMap}
                onRoutineIdChange={handleRoutineIdChange}
              />
            );
          })}
        </div>
      )}

      {activeSection === 'map' && (
        <ExerciseMapper
          apiKey={apiKey}
          exerciseMap={exerciseMap}
          onMapChange={updateMapping}
        />
      )}
    </div>
  );
}

function smallBtn(color) {
  return {
    fontSize: 11, padding: '4px 8px', borderRadius: 6,
    background: 'transparent', border: '1px solid ' + color,
    color, cursor: 'pointer', fontFamily: 'inherit',
  };
}
