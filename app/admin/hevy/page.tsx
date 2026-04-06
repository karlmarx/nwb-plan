"use client";

import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { loadState, saveState } from "@/lib/storage";
import { EX, WORKOUTS } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";
import {
  searchExercises,
  updateRoutine,
  createRoutine,
  buildHevyRoutine,
  type ExerciseMapping,
} from "@/lib/hevy";

// ═══════════════════════════════════════════════════════════════
// Exercise Mapper — search Hevy templates, map to app exercises
// ═══════════════════════════════════════════════════════════════
function ExerciseMapper({
  apiKey,
  exerciseMap,
  onMapChange,
}: {
  apiKey: string;
  exerciseMap: Record<string, ExerciseMapping>;
  onMapChange: (name: string, mapping: ExerciseMapping | null) => void;
}) {
  const [results, setResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [error, setError] = useState("");

  const appExercises = Object.keys(EX);
  const workoutExercises = new Set(
    Object.values(WORKOUTS).flatMap((w) => w.exercises)
  );
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll
    ? appExercises
    : appExercises.filter((n) => workoutExercises.has(n));

  const mapped = appExercises.filter((n) => exerciseMap[n]);

  async function doSearch(name: string) {
    if (!apiKey) {
      setError("Enter API key first");
      return;
    }
    setSearching(true);
    setError("");
    setActiveTarget(name);
    try {
      const data = await searchExercises(apiKey, name);
      setResults(data.exercise_templates || []);
    } catch (e: any) {
      setError(e.message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2 text-xs text-text-muted">
        <span>
          {mapped.length} / {appExercises.length} mapped (
          {
            Object.values(WORKOUTS)
              .flatMap((w) => w.exercises)
              .filter((n) => !exerciseMap[n]).length
          }{" "}
          workout exercises unmapped)
        </span>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-text-muted bg-transparent border-none cursor-pointer"
        >
          {showAll ? "Show workout exercises only" : "Show all exercises"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-danger mb-2 px-2.5 py-1.5 rounded-md bg-danger-bg border border-danger-border">
          {error}
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-1.5">
        {displayed.map((name) => {
          const mapping = exerciseMap[name];
          const isActive = activeTarget === name;
          return (
            <div key={name}>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                style={{
                  background: mapping
                    ? "var(--color-safe-bg)"
                    : "var(--color-bg)",
                  borderColor: mapping
                    ? "var(--color-safe-border)"
                    : "var(--color-border)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs"
                    style={{
                      fontWeight: mapping ? 600 : 400,
                      color: mapping
                        ? "var(--color-safe)"
                        : "var(--color-text)",
                    }}
                  >
                    {name}
                  </div>
                  {mapping && (
                    <div className="text-[10px] text-text-muted mt-0.5">
                      → {mapping.title}{" "}
                      <span className="opacity-50">({mapping.templateId})</span>
                    </div>
                  )}
                </div>
                {mapping ? (
                  <button
                    onClick={() => onMapChange(name, null)}
                    className="text-xs px-2 py-0.5 rounded border border-danger text-danger bg-transparent cursor-pointer"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() => doSearch(name)}
                    disabled={searching && isActive}
                    className="text-xs px-2 py-0.5 rounded border border-accent text-accent bg-transparent cursor-pointer"
                  >
                    {searching && isActive ? "…" : "Search"}
                  </button>
                )}
              </div>

              {isActive && results && (
                <div className="ml-4 mt-1 border border-border rounded-lg overflow-hidden">
                  {results.length === 0 ? (
                    <div className="px-2.5 py-2 text-xs text-text-muted">
                      No results. Try different name.
                    </div>
                  ) : (
                    results.map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onMapChange(name, {
                            templateId: t.id,
                            title: t.title,
                          });
                          setResults(null);
                          setActiveTarget(null);
                        }}
                        className="flex justify-between px-2.5 py-1.5 text-xs cursor-pointer border-b border-border bg-card text-text hover:bg-bg"
                      >
                        <span>{t.title}</span>
                        <span className="text-text-muted">
                          {t.muscle_group || ""}
                        </span>
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

// ═══════════════════════════════════════════════════════════════
// Routine Sync Row — one per workout
// ═══════════════════════════════════════════════════════════════
function RoutineRow({
  workoutKey,
  hevyRoutineId,
  exercises,
  apiKey,
  phase,
  exerciseMap,
  onRoutineIdChange,
}: {
  workoutKey: string;
  hevyRoutineId: string | undefined;
  exercises: string[];
  apiKey: string;
  phase: number;
  exerciseMap: Record<string, ExerciseMapping>;
  onRoutineIdChange: (key: string, id: string) => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "syncing" | "ok" | "error"
  >("idle");
  const [msg, setMsg] = useState("");

  const w = WORKOUTS[workoutKey];
  const mappedCount = exercises.filter((n) => exerciseMap[n]).length;
  const totalCount = exercises.filter((n) => EX[n]).length;

  async function sync() {
    if (!apiKey) {
      setMsg("No API key");
      setStatus("error");
      return;
    }
    const unmapped = exercises.filter((n) => EX[n] && !exerciseMap[n]);
    if (unmapped.length > 0) {
      setMsg(
        `${unmapped.length} unmapped: ${unmapped.slice(0, 3).join(", ")}${unmapped.length > 3 ? "…" : ""}`
      );
      setStatus("error");
      return;
    }

    setStatus("syncing");
    setMsg("");
    try {
      const routine = buildHevyRoutine(
        w.title,
        exercises,
        phase,
        exerciseMap,
        EX as any
      );
      if (hevyRoutineId) {
        await updateRoutine(apiKey, hevyRoutineId, routine);
        setMsg("Updated");
      } else {
        const res = await createRoutine(apiKey, routine);
        const newId = res?.routine?.id;
        if (newId) onRoutineIdChange(workoutKey, newId);
        setMsg("Created");
      }
      setStatus("ok");
    } catch (e: any) {
      setMsg(e.message);
      setStatus("error");
    }
  }

  return (
    <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-bg border border-border">
      <div className="flex items-center gap-2">
        <span className="text-base">{w.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold" style={{ color: w.color }}>
            {workoutKey}
          </div>
          <div className="text-[10px] text-text-muted">
            {mappedCount}/{totalCount} mapped
            {hevyRoutineId && (
              <span className="ml-1.5 opacity-50">
                ID: {hevyRoutineId.slice(0, 8)}…
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {status === "ok" && (
            <span className="text-xs text-safe">✓ {msg}</span>
          )}
          {status === "error" && (
            <span
              className="text-[10px] text-danger max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap"
              title={msg}
            >
              ⚠ {msg}
            </span>
          )}
          {status === "syncing" && (
            <span className="text-xs text-text-muted">Syncing…</span>
          )}
          <button
            onClick={sync}
            disabled={status === "syncing"}
            className="text-xs px-3 py-1 rounded-lg font-semibold cursor-pointer border"
            style={{
              background:
                mappedCount === totalCount
                  ? "var(--color-accent-dim)"
                  : "transparent",
              borderColor:
                mappedCount === totalCount
                  ? "var(--color-accent)"
                  : "var(--color-border)",
              color:
                mappedCount === totalCount
                  ? "var(--color-accent)"
                  : "var(--color-text-muted)",
            }}
          >
            {hevyRoutineId ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Admin Hevy Page
// ═══════════════════════════════════════════════════════════════
export default function AdminHevyPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin";

  const [apiKey, setApiKey] = useState(() =>
    loadState("nwb_hevy_api_key", "")
  );
  const [showKey, setShowKey] = useState(false);
  const [exerciseMap, setExerciseMap] = useState<
    Record<string, ExerciseMapping>
  >(() => loadState("nwb_hevy_exercise_map", {}));
  const [hevyIds, setHevyIds] = useState<Record<string, string>>(() =>
    loadState("nwb_hevy_ids", {})
  );
  const [phase, setPhase] = useState(() => loadState("nwb_phase", 0));
  const [activeSection, setActiveSection] = useState<"sync" | "map">("sync");

  function saveKey(k: string) {
    setApiKey(k);
    saveState("nwb_hevy_api_key", k);
  }

  function updateMapping(name: string, mapping: ExerciseMapping | null) {
    const next = { ...exerciseMap };
    if (mapping === null) delete next[name];
    else next[name] = mapping;
    setExerciseMap(next);
    saveState("nwb_hevy_exercise_map", next);
  }

  function handleRoutineIdChange(key: string, id: string) {
    const next = { ...hevyIds, [key]: id };
    setHevyIds(next);
    saveState("nwb_hevy_ids", next);
  }

  // ── Loading / Auth gates ──
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-dim">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-text mb-2">Not signed in</h1>
          <p className="text-text-dim">
            Please sign in with your Google account to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="bg-danger-bg border border-danger-border rounded-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-danger mb-2">Access denied</h1>
          <p className="text-text-dim">
            This page is only accessible to the admin.
          </p>
        </div>
      </div>
    );
  }

  const workoutKeys = Object.keys(WORKOUTS).filter((k) => k !== "Recovery");

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a
            href="/admin"
            className="text-text-muted hover:text-text text-sm"
          >
            ← Admin
          </a>
          <h1 className="text-2xl font-bold text-text">Hevy Sync</h1>
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-safe-bg text-safe border border-safe-border">
            admin
          </span>
        </div>

        {/* API Key */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Hevy API Key
          </div>
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="Paste API key from hevy.com/settings?developer"
              className="flex-1 px-2.5 py-2 rounded-lg bg-bg border text-text text-xs outline-none"
              style={{
                borderColor: apiKey
                  ? "var(--color-safe)"
                  : "var(--color-border)",
              }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-border text-text-muted bg-transparent cursor-pointer"
            >
              {showKey ? "🙈" : "👁"}
            </button>
          </div>
          <div className="text-[10px] text-text-muted mt-1.5">
            Requires Hevy Pro. Get key at{" "}
            <a
              href="https://hevy.com/settings?developer"
              target="_blank"
              rel="noopener"
              className="text-accent"
            >
              hevy.com/settings?developer
            </a>
          </div>
        </div>

        {/* Phase selector */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Phase (for set generation)
          </div>
          <div className="flex gap-2">
            {["Wk 1-2", "Wk 3-4", "Wk 5-6"].map((label, i) => (
              <button
                key={i}
                onClick={() => {
                  setPhase(i);
                  saveState("nwb_phase", i);
                }}
                className="flex-1 px-2 py-2 rounded-lg text-xs font-semibold cursor-pointer border"
                style={{
                  background:
                    phase === i ? "var(--color-accent-dim)" : "transparent",
                  borderColor:
                    phase === i
                      ? "var(--color-accent)"
                      : "var(--color-border)",
                  color:
                    phase === i
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sync / Map toggle */}
        <div className="flex mb-4 rounded-lg overflow-hidden border border-border">
          {(
            [
              ["sync", "⚡ Sync Routines"],
              ["map", "🗺 Exercise Mapping"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className="flex-1 py-2 text-xs border-none cursor-pointer"
              style={{
                background:
                  activeSection === key
                    ? "var(--color-accent-dim)"
                    : "var(--color-card)",
                color:
                  activeSection === key
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                fontWeight: activeSection === key ? 700 : 400,
                borderBottom:
                  activeSection === key
                    ? "2px solid var(--color-accent)"
                    : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeSection === "sync" && (
          <div>
            <p className="text-xs text-text-muted mb-3 leading-relaxed">
              Syncs your workout exercise lists to Hevy routines. Map exercises
              first in the Exercise Mapping tab. Sets come from the selected
              phase.
            </p>
            {workoutKeys.map((key) => {
              const w = WORKOUTS[key];
              return (
                <RoutineRow
                  key={key}
                  workoutKey={key}
                  hevyRoutineId={hevyIds[key]}
                  exercises={w.exercises}
                  apiKey={apiKey}
                  phase={phase}
                  exerciseMap={exerciseMap}
                  onRoutineIdChange={handleRoutineIdChange}
                />
              );
            })}
          </div>
        )}

        {activeSection === "map" && (
          <ExerciseMapper
            apiKey={apiKey}
            exerciseMap={exerciseMap}
            onMapChange={updateMapping}
          />
        )}
      </div>
    </div>
  );
}
