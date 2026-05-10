"use client";

import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { useEffect } from "react";
import { loadState, saveState } from "@/lib/storage";
import { EX, WORKOUTS } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";
import {
  searchExercises,
  updateRoutine,
  createRoutine,
  buildHevyRoutine,
  fetchAllWorkouts,
  fetchAllExerciseTemplates,
  getHevyStatus,
  type ExerciseMapping,
  type HevyExerciseTemplate,
} from "@/lib/hevy";
import { HEVY_NAME_MAP } from "@/lib/hevy-name-map";

// ═══════════════════════════════════════════════════════════════
// Exercise Mapper — search Hevy templates, map to app exercises
// ═══════════════════════════════════════════════════════════════
function ExerciseMapper({
  exerciseMap,
  onMapChange,
}: {
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
    setSearching(true);
    setError("");
    setActiveTarget(name);
    try {
      const data = await searchExercises(name);
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
  phase,
  exerciseMap,
  onRoutineIdChange,
}: {
  workoutKey: string;
  hevyRoutineId: string | undefined;
  exercises: string[];
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
        await updateRoutine(hevyRoutineId, routine);
        setMsg("Updated");
      } else {
        const res = await createRoutine(routine);
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
// Exercise Audit — diff Hevy history against EX + HEVY_NAME_MAP
// ═══════════════════════════════════════════════════════════════
interface AuditBucket {
  /** Exercise title as it appears in Hevy (preserved casing from first occurrence). */
  title: string;
  /** How many sets across all workouts logged this title. */
  count: number;
  /** Hevy template id observed for this title. */
  templateId: string;
  /** Whether the Hevy template is user-created (Karl made it). */
  isCustom: boolean;
}

interface AuditResult {
  totalWorkouts: number;
  mapped: AuditBucket[];
  unmapped: AuditBucket[];
  custom: AuditBucket[];
}

function HevyAudit() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{
    phase: "workouts" | "templates" | "done";
    current: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);

  async function runAudit() {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      // Step 1: pull all workouts.
      setProgress({ phase: "workouts", current: 0, total: 1 });
      const workouts = await fetchAllWorkouts((cur, tot) =>
        setProgress({ phase: "workouts", current: cur, total: tot })
      );

      // Step 2: pull the user's exercise template catalog so we can flag custom entries.
      setProgress({ phase: "templates", current: 0, total: 1 });
      const templates = await fetchAllExerciseTemplates((cur, tot) =>
        setProgress({ phase: "templates", current: cur, total: tot })
      );
      const templateById = new Map<string, HevyExerciseTemplate>();
      for (const t of templates) templateById.set(t.id, t);

      // Aggregate exercise titles + counts from workout history.
      const agg = new Map<string, AuditBucket>();
      for (const w of workouts) {
        for (const ex of w.exercises ?? []) {
          const key = ex.title.toLowerCase().trim().replace(/\s+/g, " ");
          const tmpl = templateById.get(ex.exercise_template_id);
          const setCount = ex.sets?.length ?? 1;
          const existing = agg.get(key);
          if (existing) {
            existing.count += setCount;
          } else {
            agg.set(key, {
              title: ex.title,
              count: setCount,
              templateId: ex.exercise_template_id,
              isCustom: tmpl?.is_custom === true,
            });
          }
        }
      }

      // Bucket each entry. "Mapped" = HEVY_NAME_MAP knows the lowercased title.
      // "Custom" = Hevy template flagged is_custom (Karl made it). Custom entries
      // are surfaced in their own bucket regardless of mapping status — Karl wants
      // those in front of him so he can decide whether to add them to EX.
      const mapped: AuditBucket[] = [];
      const unmapped: AuditBucket[] = [];
      const custom: AuditBucket[] = [];
      for (const [key, bucket] of agg) {
        if (bucket.isCustom) {
          custom.push(bucket);
        } else if (HEVY_NAME_MAP[key]) {
          mapped.push(bucket);
        } else {
          unmapped.push(bucket);
        }
      }
      // Sort by count desc — most-logged first.
      const byCount = (a: AuditBucket, b: AuditBucket) => b.count - a.count;
      mapped.sort(byCount);
      unmapped.sort(byCount);
      custom.sort(byCount);

      setResult({ totalWorkouts: workouts.length, mapped, unmapped, custom });
      setProgress({ phase: "done", current: 1, total: 1 });
    } catch (e: any) {
      setError(e.message || "Audit failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-text-muted mb-3 leading-relaxed">
        Pulls every workout from Hevy and diffs the exercise titles against
        the static name map (<code className="text-[10px]">lib/hevy-name-map.ts</code>)
        and the EX catalog. Custom (user-created) entries are bucketed
        separately — those are the ones most likely worth adding to{" "}
        <code className="text-[10px]">lib/exercises.ts</code>.
      </p>

      <button
        onClick={runAudit}
        disabled={running}
        className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border"
        style={{
          background: running ? "var(--color-bg)" : "var(--color-accent-dim)",
          borderColor: "var(--color-accent)",
          color: "var(--color-accent)",
        }}
      >
        {running ? "Running…" : "Run audit"}
      </button>

      {progress && (
        <div className="text-[11px] text-text-muted mt-2">
          {progress.phase === "workouts" &&
            `Pulling workouts: page ${progress.current} / ${progress.total}`}
          {progress.phase === "templates" &&
            `Pulling exercise templates: page ${progress.current} / ${progress.total}`}
          {progress.phase === "done" && "Done."}
        </div>
      )}

      {error && (
        <div className="text-xs text-danger mt-2 px-2.5 py-1.5 rounded-md bg-danger-bg border border-danger-border">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="text-[11px] text-text-muted">
            {result.totalWorkouts} workouts · {result.mapped.length} mapped ·{" "}
            <span className="text-warning">
              {result.unmapped.length} unmapped
            </span>{" "}
            ·{" "}
            <span className="text-accent">
              {result.custom.length} custom
            </span>
          </div>

          <AuditList
            label="⭐ Custom (user-created)"
            color="var(--color-accent)"
            buckets={result.custom}
            emptyMessage="None — you haven't created any exercises in Hevy."
          />

          <AuditList
            label="❌ Unmapped (stock Hevy templates not in HEVY_NAME_MAP)"
            color="var(--color-warning)"
            buckets={result.unmapped}
            emptyMessage="Every stock Hevy template you've used is mapped."
          />

          <AuditList
            label="✅ Mapped"
            color="var(--color-safe)"
            buckets={result.mapped}
            emptyMessage="No mapped entries yet."
            collapsedByDefault
          />
        </div>
      )}
    </div>
  );
}

function AuditList({
  label,
  color,
  buckets,
  emptyMessage,
  collapsedByDefault = false,
}: {
  label: string;
  color: string;
  buckets: AuditBucket[];
  emptyMessage: string;
  collapsedByDefault?: boolean;
}) {
  const [open, setOpen] = useState(!collapsedByDefault);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-left text-xs font-bold cursor-pointer flex items-center justify-between"
        style={{ color, background: "var(--color-card)" }}
      >
        <span>
          {label} ({buckets.length})
        </span>
        <span className="text-text-muted">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="px-3 py-2 max-h-[320px] overflow-y-auto">
          {buckets.length === 0 ? (
            <div className="text-[11px] text-text-muted italic">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-1">
              {buckets.map((b) => (
                <div
                  key={b.templateId + b.title}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-text">{b.title}</span>
                  <span className="text-text-muted tabular-nums ml-3">
                    {b.count} sets
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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

  const [exerciseMap, setExerciseMap] = useState<
    Record<string, ExerciseMapping>
  >(() => loadState("nwb_hevy_exercise_map", {}));
  const [hevyIds, setHevyIds] = useState<Record<string, string>>(() =>
    loadState("nwb_hevy_ids", {})
  );
  const [phase, setPhase] = useState(() => loadState("nwb_phase", 0));
  const [activeSection, setActiveSection] = useState<"sync" | "map" | "audit">(
    "sync"
  );

  // Server-side env-var status. Drives the "configured" badge + lets us warn
  // before a user clicks anything that would 503.
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isAdmin) return;
    getHevyStatus()
      .then((s) => setKeyConfigured(s.configured))
      .catch(() => setKeyConfigured(false));
    // One-time migration: clear the orphaned localStorage key from when the
    // API key lived browser-side. Removes Karl's actual Hevy secret from
    // his device on first visit after this refactor lands.
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nwb_hevy_api_key");
    }
  }, [isAdmin]);

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

        {/* API Key — now server-side */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Hevy API Key
          </div>
          {keyConfigured === null && (
            <div className="text-xs text-text-muted">Checking…</div>
          )}
          {keyConfigured === true && (
            <div className="text-xs text-safe flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-safe" />
              Configured server-side ({"`"}HEVY_API_KEY{"`"} env var). Browser never sees the key.
            </div>
          )}
          {keyConfigured === false && (
            <div className="text-xs text-danger leading-relaxed">
              <div className="font-bold mb-1">Not configured.</div>
              Set <code className="text-[10px]">HEVY_API_KEY</code> in Vercel
              project settings (Production + Preview), then redeploy. For local
              dev, add it to <code className="text-[10px]">.env.local</code>.
              Get a key at{" "}
              <a
                href="https://hevy.com/settings?developer"
                target="_blank"
                rel="noopener"
                className="text-accent"
              >
                hevy.com/settings?developer
              </a>
              .
            </div>
          )}
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
              ["sync", "⚡ Sync"],
              ["map", "🗺 Map"],
              ["audit", "🔍 Audit"],
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
            exerciseMap={exerciseMap}
            onMapChange={updateMapping}
          />
        )}

        {activeSection === "audit" && <HevyAudit />}
      </div>
    </div>
  );
}
