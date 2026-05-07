# PT HEP Daily Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a "Daily Required HEP" feature that appears on the Today tab (collapsed pill), the Rehab tab (always-expanded block), and at the end of every workout (compact strip), all sharing one source of truth via a shared completion hook.

**Architecture:** Static data file (`lib/hep-exercises.ts`) → date-keyed localStorage hook (`useHEPCompletion`) → one component (`<HEPBlock />`) with three render modes. Three thin call-sites in existing files (`workout-view.tsx` Today tab, `workout-view.tsx` workout body, `rehab-tab.tsx`).

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Playwright/pytest E2E (`e2e/`).

**Spec:** `docs/superpowers/specs/2026-05-07-pt-hep-daily-design.md`

**Branch:** `feat/pt-hep-daily` (already exists with the spec committed)

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `lib/hep-exercises.ts` | Create | Static `HEP_EXERCISES[]` array + `HEPExercise` type + `getActiveHEP()` filter helper. Append-only data file. |
| `components/hep-block.tsx` | Create | Single component with three modes (`pill`, `full`, `strip`). Owns the `useHEPCompletion()` hook (declared in this file, exported for testing). |
| `components/workout-view.tsx` | Modify | Two call-sites: render `<HEPBlock mode="pill" />` near top of Today tab; render `<HEPBlock mode="strip" workoutKey={…} />` inside `renderWorkout()` body just before closing `</Section>`. |
| `components/rehab-tab.tsx` | Modify | One call-site: render `<HEPBlock mode="full" />` at the very top of the Rehab tab body, above the existing phase-picker section. |
| `e2e/test_hep_daily.py` | Create | Three Playwright tests: pill on Today tab, full block on Rehab tab, strip at end of workout, plus a completion-sync test. |

---

## Pre-flight

- [ ] **Step 0.1: Verify branch + clean tree**

```bash
cd /Users/kmx/nwb-plan
git status
git branch --show-current
```

Expected:
```
On branch feat/pt-hep-daily
nothing to commit, working tree clean
```

If on a different branch, `git checkout feat/pt-hep-daily`. If dirty, stash or commit before proceeding.

- [ ] **Step 0.2: Confirm spec is on this branch**

```bash
git log --oneline -3
ls docs/superpowers/specs/2026-05-07-pt-hep-daily-design.md
```

Expected: most recent commit is `e49114b docs(spec): add Rehab tab as third HEP surface` (or descendant). The spec file exists.

---

## Task 1: Data file (`lib/hep-exercises.ts`)

**Files:**
- Create: `lib/hep-exercises.ts`

**Pattern reference:** Mirror the shape conventions of `lib/pt-exercises.ts` (header comment, exported types, exported const array, helper functions). Keep this file self-contained — no imports from `lib/exercises.ts` or `lib/conditions/`.

- [ ] **Step 1.1: Create `lib/hep-exercises.ts` with types, seed data, and helper**

```ts
// ============================================================================
// DAILY REQUIRED HEP — PT-PRESCRIBED HOME EXERCISE PROGRAM
// ============================================================================
//
// Daily floor of PT-prescribed exercises (HEP2GO printouts from Justin Joaquin,
// DPT, CSCS).  Distinct from lib/pt-exercises.ts (which is a phase-gated,
// flexible supplement layer).  HEP is non-phase-gated, daily-required work.
//
// CONVENTION:
//   - All ids prefixed `hep_` to disambiguate from EX[] / pt_*
//   - Per-day completion is tracked in localStorage by date key
//     (`nwb_hep_done_<YYYY-MM-DD>`) — see useHEPCompletion in
//     components/hep-block.tsx
//   - Append-only: adding next week's prescription is one entry below.
//   - Retiring an exercise: set `retiredOn` instead of deleting.
//
// ============================================================================

export type HEPSide = "left" | "right" | "bilateral";

export interface HEPExercise {
  /** Stable slug — `hep_<lower_snake>`. */
  id: string;
  /** Display name as written on the HEP2GO printout. */
  name: string;
  /** Plain-text instructions, one paragraph. */
  instructions: string;
  /** Sets count, e.g. 3. */
  sets: number;
  /** Reps per set. Optional for hold-only exercises. */
  reps?: number;
  /** Hold seconds. Optional. */
  holdSeconds?: number;
  /** Frequency note. Defaults to "1× daily" if omitted. */
  frequency?: string;
  /** Which leg is loaded; "bilateral" for both. */
  side: HEPSide;
  /** HEP2GO video URL (decoded from QR code). Optional — fill in later. */
  videoUrl?: string;
  /** Optional reference image URL. */
  figureUrl?: string;
  /** Date the exercise was added to the prescription (ISO `YYYY-MM-DD`). */
  prescribedOn: string;
  /** Date the exercise was retired, if any. Filters out of the active list. */
  retiredOn?: string;
}

export const HEP_EXERCISES: HEPExercise[] = [
  {
    id: "hep_prone_hip_extension",
    name: "Prone Hip Extension",
    instructions:
      "While lying face down with your knee straight, slowly raise your leg up off the ground. Maintain a straight knee the entire time.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_hip_abduction_sidelying",
    name: "Hip Abduction - Sidelying",
    instructions:
      "While lying on your side, slowly raise up your top leg towards the sky. Keep your knee straight and maintain your toes pointed forward the entire time. Keep your leg in-line with your body. The bottom leg can be bent to stabilize your body.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_straight_leg_raise",
    name: "Straight Leg Raise (SLR)",
    instructions:
      "While lying on your back, raise up your leg with a straight knee. Keep the opposite knee bent with the foot planted on the ground.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_bridging_ball_squeeze",
    name: "Bridging with Rubber Ball Squeeze",
    instructions:
      "Lie on your back with knees bent. Place a small rubber ball between your knees. Squeeze the ball with your knees and hold the pressure. While holding this pressure, press through your heels as you raise your buttocks off the floor/bed creating a bridge with your body. Return to starting position and repeat.",
    sets: 3,
    reps: 10,
    side: "bilateral",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_isometric_hip_er_prone_ball",
    name: "Isometric Hip External Rotation - Prone - Ball Squeeze",
    instructions:
      "While lying face down, place a ball between your ankles and press your feet together. Hold, relax and repeat.",
    sets: 3,
    reps: 10,
    holdSeconds: 5,
    side: "bilateral",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_band_sidelying_clamshell",
    name: "Elastic Band - Side-Lying Clamshell",
    instructions:
      "While lying on your side with your knees bent and an elastic band wrapped around your knees, draw up the top knee while keeping contact of your feet together as shown. Do not let your pelvis roll back during the lifting movement.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
];

/** Active HEP exercises — excludes anything with `retiredOn` set. */
export function getActiveHEP(): HEPExercise[] {
  return HEP_EXERCISES.filter((e) => !e.retiredOn);
}
```

- [ ] **Step 1.2: Verify the file type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 1.3: Verify import works in a Node REPL**

Run: `node --input-type=module -e "import('./lib/hep-exercises.ts').catch(()=>console.log('expected — TS only at edit time'))"`

(Don't fail if Node can't import .ts directly — this is just a sanity check that the file parses. The real check is `tsc --noEmit` above.)

- [ ] **Step 1.4: Commit**

```bash
git add lib/hep-exercises.ts
git commit -m "feat(hep): add HEP_EXERCISES data file with May 6 prescription seed"
```

---

## Task 2: HEPBlock component skeleton + `useHEPCompletion` hook

**Files:**
- Create: `components/hep-block.tsx`

This task creates the component file and the hook it depends on, but with only the plumbing — no real UI yet. The render output is a stub div with `data-testid="hep-block-{mode}"` so subsequent E2E tests have a hook.

- [ ] **Step 2.1: Create `components/hep-block.tsx` skeleton**

```tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { loadState, saveState } from "@/lib/storage";
import { getActiveHEP, type HEPExercise } from "@/lib/hep-exercises";

// ----- Date helper -------------------------------------------------------

/** ISO date in local time (YYYY-MM-DD). Stable per calendar day. */
function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ----- Hook --------------------------------------------------------------

interface HEPCompletionApi {
  doneIds: string[];
  totalCount: number;
  doneCount: number;
  toggle: (id: string) => void;
  isDone: (id: string) => boolean;
}

export function useHEPCompletion(): HEPCompletionApi {
  const dateKey = todayKey();
  const storageKey = `nwb_hep_done_${dateKey}`;
  const total = getActiveHEP().length;

  const [doneIds, setDoneIds] = useState<string[]>(() =>
    loadState<string[]>(storageKey, []),
  );

  // Listen for storage events from other tabs / components on same page.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setDoneIds(loadState<string[]>(storageKey, []));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setDoneIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        saveState(storageKey, next);
        // Manually fire a same-tab storage event so other <HEPBlock /> instances
        // on the same page re-read. (Native StorageEvent only fires across tabs.)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: storageKey,
            newValue: JSON.stringify(next),
          }),
        );
        return next;
      });
    },
    [storageKey],
  );

  const isDone = useCallback((id: string) => doneIds.includes(id), [doneIds]);

  return {
    doneIds,
    totalCount: total,
    doneCount: doneIds.length,
    toggle,
    isDone,
  };
}

// ----- Component ---------------------------------------------------------

export type HEPBlockMode = "pill" | "full" | "strip";

interface HEPBlockProps {
  mode: HEPBlockMode;
  /** Only meaningful for mode="strip" — used in the test-id for that surface. */
  workoutKey?: string;
}

export default function HEPBlock({ mode, workoutKey }: HEPBlockProps) {
  const exercises = getActiveHEP();
  const completion = useHEPCompletion();

  // Stub — real UI comes in Tasks 3, 4, 5.
  return (
    <div
      data-testid={mode === "strip" ? `hep-strip-${workoutKey ?? "unknown"}` : `hep-block-${mode}`}
      data-hep-total={completion.totalCount}
      data-hep-done={completion.doneCount}
    >
      {/* HEP {mode} placeholder — {exercises.length} exercises */}
    </div>
  );
}
```

- [ ] **Step 2.2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add components/hep-block.tsx
git commit -m "feat(hep): add HEPBlock component skeleton + useHEPCompletion hook"
```

---

## Task 3: Pill mode (Today tab)

**Files:**
- Create: `e2e/test_hep_daily.py` (new test file, only adds the pill test in this task)
- Modify: `components/hep-block.tsx` (replace placeholder with pill UI)
- Modify: `components/workout-view.tsx` (add the call-site)

**Reference:** Look at `components/section.tsx` for collapse/expand idioms used elsewhere in the app. The pill should have its own self-contained collapsed/expanded state.

- [ ] **Step 3.1: Write the failing E2E test for the Today-tab pill**

Create `e2e/test_hep_daily.py`:

```python
"""HEP Daily section E2E tests.

Covers: Today-tab collapsed pill, Rehab-tab full block, end-of-workout strip,
and completion-sync across all three surfaces.

Storage:
  nwb_hep_done_<YYYY-MM-DD>: string[]   # HEP exercise ids checked off today
"""

from __future__ import annotations

from datetime import date

from playwright.sync_api import Page, expect

from conftest import click_tab


# Today's HEP date key — must match components/hep-block.tsx::todayKey().
def _today_key() -> str:
    return date.today().isoformat()


def _storage_key() -> str:
    return f"nwb_hep_done_{_today_key()}"


# ---------------------------------------------------------------------------
# Today tab — collapsed pill
# ---------------------------------------------------------------------------

def test_hep_pill_renders_on_today_tab(page: Page):
    """Pill renders at the top of the Today tab with correct count."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    pill = page.get_by_test_id("hep-block-pill")
    expect(pill).to_be_visible()

    # Count should match the seeded HEP_EXERCISES length (6 as of May 6).
    expect(pill).to_have_attribute("data-hep-total", "6")
    expect(pill).to_have_attribute("data-hep-done", "0")


def test_hep_pill_starts_collapsed_and_expands(page: Page):
    """Pill is collapsed by default; clicking it expands the row list."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    pill = page.get_by_test_id("hep-block-pill")
    expect(pill).to_have_attribute("data-hep-expanded", "false")

    # Rows should not be visible while collapsed.
    expect(page.get_by_test_id("hep-row-hep_prone_hip_extension")).to_have_count(0)

    page.get_by_test_id("hep-pill-toggle").click()

    expect(pill).to_have_attribute("data-hep-expanded", "true")
    expect(page.get_by_test_id("hep-row-hep_prone_hip_extension")).to_be_visible()


def test_hep_pill_checkbox_toggles_completion(page: Page):
    """Tapping a row checkbox marks it done and updates the count."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    page.get_by_test_id("hep-pill-toggle").click()
    page.get_by_test_id("hep-checkbox-hep_prone_hip_extension").click()

    pill = page.get_by_test_id("hep-block-pill")
    expect(pill).to_have_attribute("data-hep-done", "1")

    # Reload and verify persistence.
    page.reload()
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)
    expect(page.get_by_test_id("hep-block-pill")).to_have_attribute(
        "data-hep-done", "1",
    )
```

- [ ] **Step 3.2: Run the test, verify it fails**

```bash
npm run test:e2e -- e2e/test_hep_daily.py::test_hep_pill_renders_on_today_tab
```

Expected: FAIL because either:
- `hep-block-pill` testid is not on the page (HEPBlock not yet rendered in Today tab)
- OR it renders but `data-hep-expanded` attr doesn't exist yet

This is the failing-test signal we want.

- [ ] **Step 3.3: Implement the pill UI in `components/hep-block.tsx`**

Replace the entire return statement of `HEPBlock` (and add a small helper) so the file looks like this (only the changed bottom portion shown — keep the imports and `useHEPCompletion` hook from Task 2):

```tsx
// ----- Component ---------------------------------------------------------

export type HEPBlockMode = "pill" | "full" | "strip";

interface HEPBlockProps {
  mode: HEPBlockMode;
  workoutKey?: string;
}

function HEPRow({
  ex,
  done,
  onToggle,
  compact,
}: {
  ex: HEPExercise;
  done: boolean;
  onToggle: () => void;
  compact: boolean;
}) {
  const [showInfo, setShowInfo] = useState(false);

  const setsReps = ex.holdSeconds
    ? `${ex.sets} × ${ex.reps ?? "—"} · ${ex.holdSeconds}s hold`
    : `${ex.sets} × ${ex.reps ?? "—"}`;

  return (
    <div
      data-testid={`hep-row-${ex.id}`}
      className="flex items-center gap-2 py-1.5"
    >
      <button
        data-testid={`hep-checkbox-${ex.id}`}
        onClick={onToggle}
        aria-label={done ? `Uncheck ${ex.name}` : `Check ${ex.name}`}
        className="w-5 h-5 rounded border flex items-center justify-center cursor-pointer"
        style={{
          background: done ? "#34d399" : "transparent",
          borderColor: done ? "#34d399" : "var(--color-border)",
          color: done ? "#0a0a0a" : "transparent",
        }}
      >
        {done ? "✓" : ""}
      </button>
      <span className="font-semibold flex-1 text-sm">{ex.name}</span>
      {!compact && (
        <span className="text-xs text-text-dim">{setsReps}</span>
      )}
      {ex.videoUrl && (
        <a
          data-testid={`hep-video-${ex.id}`}
          href={ex.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs"
          aria-label={`Video for ${ex.name}`}
        >
          ▶
        </a>
      )}
      <button
        data-testid={`hep-info-${ex.id}`}
        onClick={() => setShowInfo((v) => !v)}
        aria-label={`Instructions for ${ex.name}`}
        className="text-xs text-text-dim cursor-pointer"
      >
        ℹ
      </button>
      {showInfo && (
        <div
          data-testid={`hep-instructions-${ex.id}`}
          className="basis-full text-xs text-text-dim pl-7 pt-1"
        >
          {ex.instructions}
        </div>
      )}
    </div>
  );
}

export default function HEPBlock({ mode, workoutKey }: HEPBlockProps) {
  const exercises = getActiveHEP();
  const completion = useHEPCompletion();
  const [expanded, setExpanded] = useState(mode !== "pill");

  if (mode === "pill") {
    return (
      <div
        data-testid="hep-block-pill"
        data-hep-total={completion.totalCount}
        data-hep-done={completion.doneCount}
        data-hep-expanded={expanded}
        className="rounded-xl border my-3 px-3 py-2"
        style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
      >
        <button
          data-testid="hep-pill-toggle"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between cursor-pointer"
          aria-expanded={expanded}
        >
          <span className="text-sm font-semibold">
            🏥 HEP — {completion.doneCount}/{completion.totalCount} done today
          </span>
          <span className="text-xs">{expanded ? "▼" : "▶"}</span>
        </button>
        {expanded && (
          <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--color-border)" }}>
            {exercises.map((ex) => (
              <HEPRow
                key={ex.id}
                ex={ex}
                done={completion.isDone(ex.id)}
                onToggle={() => completion.toggle(ex.id)}
                compact={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // full and strip modes implemented in Tasks 4 and 5
  return (
    <div
      data-testid={mode === "strip" ? `hep-strip-${workoutKey ?? "unknown"}` : `hep-block-${mode}`}
      data-hep-total={completion.totalCount}
      data-hep-done={completion.doneCount}
    />
  );
}
```

- [ ] **Step 3.4: Wire `<HEPBlock mode="pill" />` into `components/workout-view.tsx`**

Add the import near the top of the file (after the existing imports for similar components, around the same area as the `Section` import):

```tsx
import HEPBlock from "@/components/hep-block";
```

Then in `renderTodayTab()`, immediately before `{WORKOUTS[selSched.t] && renderWorkout(selSched.t)}` (around line 1671), add:

```tsx
        {/* Daily HEP pill */}
        <HEPBlock mode="pill" />

        {/* Selected workout */}
        {WORKOUTS[selSched.t] && renderWorkout(selSched.t)}
```

- [ ] **Step 3.5: Run the pill tests, verify they pass**

```bash
npm run test:e2e -- e2e/test_hep_daily.py::test_hep_pill_renders_on_today_tab e2e/test_hep_daily.py::test_hep_pill_starts_collapsed_and_expands e2e/test_hep_daily.py::test_hep_pill_checkbox_toggles_completion
```

Expected: 3 PASSED.

If the persistence test fails because the test browser context carries state between runs, add a `localStorage.clear()` in a fixture or in the first line of the test (the existing pattern uses `set_local_storage` from conftest).

- [ ] **Step 3.6: Commit**

```bash
git add components/hep-block.tsx components/workout-view.tsx e2e/test_hep_daily.py
git commit -m "feat(hep): pill mode on Today tab with persistent completion state"
```

---

## Task 4: Full mode (Rehab tab)

**Files:**
- Modify: `e2e/test_hep_daily.py` (add Rehab-tab tests)
- Modify: `components/hep-block.tsx` (implement `mode="full"`)
- Modify: `components/rehab-tab.tsx` (add the call-site)

- [ ] **Step 4.1: Add the failing E2E tests for the Rehab-tab full block**

Append to `e2e/test_hep_daily.py`:

```python
# ---------------------------------------------------------------------------
# Rehab tab — always-expanded full block
# ---------------------------------------------------------------------------

def test_hep_full_block_renders_on_rehab_tab(page: Page):
    """Full block renders at the top of the Rehab tab, always expanded."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    click_tab(page, "rehab")
    page.wait_for_selector("[data-testid='rehab-tab']", timeout=8000)

    full = page.get_by_test_id("hep-block-full")
    expect(full).to_be_visible()
    expect(full).to_have_attribute("data-hep-total", "6")

    # All six rows should be visible immediately (no toggle).
    for ex_id in [
        "hep_prone_hip_extension",
        "hep_hip_abduction_sidelying",
        "hep_straight_leg_raise",
        "hep_bridging_ball_squeeze",
        "hep_isometric_hip_er_prone_ball",
        "hep_band_sidelying_clamshell",
    ]:
        expect(page.get_by_test_id(f"hep-row-{ex_id}")).to_be_visible()


def test_hep_full_block_above_phase_picker(page: Page):
    """The full block sits above the existing rehab-phase-picker."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    click_tab(page, "rehab")
    page.wait_for_selector("[data-testid='rehab-tab']", timeout=8000)

    full_box = page.get_by_test_id("hep-block-full").bounding_box()
    picker_box = page.get_by_test_id("rehab-phase-picker").bounding_box()
    assert full_box is not None and picker_box is not None
    assert full_box["y"] < picker_box["y"], (
        f"HEP full block should be above the phase picker "
        f"(full y={full_box['y']}, picker y={picker_box['y']})"
    )
```

- [ ] **Step 4.2: Run the new tests, verify they fail**

```bash
npm run test:e2e -- e2e/test_hep_daily.py::test_hep_full_block_renders_on_rehab_tab e2e/test_hep_daily.py::test_hep_full_block_above_phase_picker
```

Expected: FAIL — `hep-block-full` exists from the placeholder but doesn't render rows yet, and isn't placed inside the Rehab tab.

- [ ] **Step 4.3: Implement `mode="full"` in `components/hep-block.tsx`**

Replace the `// full and strip modes implemented in Tasks 4 and 5` comment block at the bottom of `HEPBlock` with the following branch (keep the strip placeholder for now):

```tsx
  if (mode === "full") {
    return (
      <div
        data-testid="hep-block-full"
        data-hep-total={completion.totalCount}
        data-hep-done={completion.doneCount}
        className="rounded-xl border my-4 px-3 py-3"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)",
        }}
      >
        <div className="text-sm font-semibold mb-2">
          🏥 Daily Required HEP — {completion.doneCount}/{completion.totalCount} done today
        </div>
        <div className="border-t pt-2" style={{ borderColor: "var(--color-border)" }}>
          {exercises.map((ex) => (
            <HEPRow
              key={ex.id}
              ex={ex}
              done={completion.isDone(ex.id)}
              onToggle={() => completion.toggle(ex.id)}
              compact={false}
            />
          ))}
        </div>
      </div>
    );
  }

  // strip mode implemented in Task 5
  return (
    <div
      data-testid={`hep-strip-${workoutKey ?? "unknown"}`}
      data-hep-total={completion.totalCount}
      data-hep-done={completion.doneCount}
    />
  );
```

- [ ] **Step 4.4: Wire `<HEPBlock mode="full" />` into `components/rehab-tab.tsx`**

Add the import at the top:

```tsx
import HEPBlock from "@/components/hep-block";
```

Then in the `RehabTab()` function, find the `return (` of the main component (the one whose top-level div has `data-testid="rehab-tab"`). Insert the `<HEPBlock mode="full" />` as the first child inside that wrapper, before any existing content. Example shape:

```tsx
  return (
    <div data-testid="rehab-tab">
      <HEPBlock mode="full" />
      {/* existing rehab content (phase picker, sections, etc.) stays unchanged */}
      ...
    </div>
  );
```

(If the existing return wrapper is a `<>` fragment instead of a div, wrap the existing content in a `<div data-testid="rehab-tab">` so HEPBlock can sit cleanly above it. But verify by reading the current file first — the test at Step 4.1 already asserts `data-testid='rehab-tab'` exists.)

- [ ] **Step 4.5: Run the Rehab-tab tests, verify they pass**

```bash
npm run test:e2e -- e2e/test_hep_daily.py::test_hep_full_block_renders_on_rehab_tab e2e/test_hep_daily.py::test_hep_full_block_above_phase_picker
```

Expected: 2 PASSED.

- [ ] **Step 4.6: Re-run Task 3's tests to make sure nothing regressed**

```bash
npm run test:e2e -- e2e/test_hep_daily.py
```

Expected: 5 PASSED so far.

- [ ] **Step 4.7: Commit**

```bash
git add components/hep-block.tsx components/rehab-tab.tsx e2e/test_hep_daily.py
git commit -m "feat(hep): full mode at top of Rehab tab"
```

---

## Task 5: Strip mode (end of every workout)

**Files:**
- Modify: `e2e/test_hep_daily.py` (add strip tests)
- Modify: `components/hep-block.tsx` (implement `mode="strip"`)
- Modify: `components/workout-view.tsx` (add the strip call-site inside `renderWorkout()`)

**Anchor for the strip call-site:** Inside the `renderWorkout(workoutKey)` function in `components/workout-view.tsx`, the workout body ends with a closing `</Section>` around line 1588 (right after `{buildSupersetCards(name, ex, "__finisher__", null)}`). The strip goes inside that Section, immediately before the closing `</Section>` tag, so it renders below the last finisher row of every workout.

- [ ] **Step 5.1: Add the failing E2E tests for the strip**

Append to `e2e/test_hep_daily.py`:

```python
# ---------------------------------------------------------------------------
# End-of-workout strip
# ---------------------------------------------------------------------------

def test_hep_strip_renders_at_end_of_today_workout(page: Page):
    """The HEP strip appears at the bottom of today's workout."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    # Today's workoutKey can vary by day-of-week — assert at least one strip exists.
    strips = page.locator("[data-testid^='hep-strip-']")
    expect(strips.first).to_be_visible()
    expect(strips.first).to_have_attribute("data-hep-total", "6")


def test_hep_strip_completion_syncs_with_pill(page: Page):
    """Checking off a HEP exercise in the pill reflects in the strip immediately."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    # Expand the pill and check off one exercise.
    page.get_by_test_id("hep-pill-toggle").click()
    page.get_by_test_id("hep-checkbox-hep_prone_hip_extension").click()

    # The strip's done counter should bump to 1.
    strips = page.locator("[data-testid^='hep-strip-']")
    expect(strips.first).to_have_attribute("data-hep-done", "1")


def test_hep_strip_completion_syncs_with_rehab_tab(page: Page):
    """Checking off in the strip reflects on the Rehab-tab full block."""
    page.goto("http://localhost:3000")
    page.wait_for_selector("[data-testid='day-header']", timeout=8000)

    # Tap a checkbox via the strip — the strip uses the same hep-checkbox-* testids
    # because the row component is shared. Force-scroll to it first.
    page.get_by_test_id("hep-checkbox-hep_straight_leg_raise").last.scroll_into_view_if_needed()
    page.get_by_test_id("hep-checkbox-hep_straight_leg_raise").last.click()

    # Switch to the Rehab tab and verify the count.
    click_tab(page, "rehab")
    page.wait_for_selector("[data-testid='rehab-tab']", timeout=8000)
    expect(page.get_by_test_id("hep-block-full")).to_have_attribute("data-hep-done", "1")
```

- [ ] **Step 5.2: Run the strip tests, verify they fail**

```bash
npm run test:e2e -- e2e/test_hep_daily.py::test_hep_strip_renders_at_end_of_today_workout e2e/test_hep_daily.py::test_hep_strip_completion_syncs_with_pill e2e/test_hep_daily.py::test_hep_strip_completion_syncs_with_rehab_tab
```

Expected: FAIL — strip not yet rendered into the workout body.

- [ ] **Step 5.3: Implement `mode="strip"` in `components/hep-block.tsx`**

Replace the strip placeholder return at the bottom of `HEPBlock` with:

```tsx
  // strip mode
  return (
    <div
      data-testid={`hep-strip-${workoutKey ?? "unknown"}`}
      data-hep-total={completion.totalCount}
      data-hep-done={completion.doneCount}
      className="rounded-xl border mt-4 px-3 py-2"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-card)",
      }}
    >
      <div className="text-xs font-semibold mb-1.5 text-text-dim">
        Don&rsquo;t forget — Daily HEP · {completion.doneCount}/{completion.totalCount} done
      </div>
      <div className="border-t pt-1" style={{ borderColor: "var(--color-border)" }}>
        {exercises.map((ex) => (
          <HEPRow
            key={ex.id}
            ex={ex}
            done={completion.isDone(ex.id)}
            onToggle={() => completion.toggle(ex.id)}
            compact={true}
          />
        ))}
      </div>
    </div>
  );
```

- [ ] **Step 5.4: Wire `<HEPBlock mode="strip" workoutKey={workoutKey} />` into `components/workout-view.tsx`**

Locate the `renderWorkout(workoutKey: string)` function. Inside it, find the closing `</Section>` of the main workout body (around line 1588 — the one immediately after `{buildSupersetCards(name, ex, "__finisher__", null)}` and its surrounding map). Insert the strip just before that closing tag:

```tsx
          {/* (existing finisher map ends here) */}
          ...
        )}

        {/* Daily HEP reminder strip */}
        <HEPBlock mode="strip" workoutKey={workoutKey} />
      </Section>
    );
  }
```

(The exact line will shift slightly depending on prior edits — search for the Section that wraps the finisher block inside `renderWorkout` to confirm placement.)

- [ ] **Step 5.5: Run the strip tests, verify they pass**

```bash
npm run test:e2e -- e2e/test_hep_daily.py::test_hep_strip_renders_at_end_of_today_workout e2e/test_hep_daily.py::test_hep_strip_completion_syncs_with_pill e2e/test_hep_daily.py::test_hep_strip_completion_syncs_with_rehab_tab
```

Expected: 3 PASSED.

If `test_hep_strip_completion_syncs_with_pill` fails because the strip's `data-hep-done` doesn't update without a re-render, the manual `StorageEvent` dispatch in `useHEPCompletion`'s `toggle` should fix it. Verify with browser devtools that the storage event fires; if it doesn't, replace the synthetic `StorageEvent` with a custom event:

```tsx
window.dispatchEvent(new CustomEvent("hep-completion-changed", { detail: { storageKey, next } }));
```

…and listen for `hep-completion-changed` instead of (or in addition to) `storage` in the `useEffect` hook. Run the test again after that fix.

- [ ] **Step 5.6: Run the full suite to make sure nothing else broke**

```bash
npm run test:e2e -- e2e/test_hep_daily.py
```

Expected: 8 PASSED.

- [ ] **Step 5.7: Commit**

```bash
git add components/hep-block.tsx components/workout-view.tsx e2e/test_hep_daily.py
git commit -m "feat(hep): end-of-workout reminder strip + cross-surface completion sync"
```

---

## Task 6: Build, lint, and broader regression check

- [ ] **Step 6.1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6.2: Production build**

```bash
npm run build
```

Expected: build succeeds, no warnings about HEP files.

- [ ] **Step 6.3: Run the full E2E suite (not just HEP) to catch regressions in workout-view / rehab-tab**

```bash
npm run test:e2e
```

Expected: all tests pass. Pay attention to:
- `test_tabs.py` — confirms tab nav still works after we touched workout-view + rehab-tab
- `test_workout_history.py`, `test_workout_tab.py` — confirm the workout body still renders
- `test_persistence.py` — confirm no localStorage key collision

If anything fails, the most likely culprit is the `<HEPBlock mode="strip" />` insertion — verify it's inside the right Section's children and not breaking layout flow.

- [ ] **Step 6.4: Manual smoke (you, not the agent)**

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Verify:
1. Today tab — pill renders at top, expands, checkboxes work, ▶ video links appear only for entries with `videoUrl` set (none for now since QR codes aren't scanned yet)
2. Rehab tab — full block at top, all 6 rows visible, checking syncs back to Today pill on tab switch
3. Workout body — strip renders below the finisher block on whichever workout is scheduled today

Take the dev server down with `Ctrl+C` after you're done.

---

## Task 7: Open PR to dev, then promote dev → main

**Pre-condition:** All tests green, build clean, manual smoke passed.

- [ ] **Step 7.1: Push the branch**

```bash
git push -u origin feat/pt-hep-daily
```

- [ ] **Step 7.2: Open the PR against `dev`**

```bash
gh pr create --base dev --head feat/pt-hep-daily \
  --title "feat(hep): Daily Required HEP — Today pill, Rehab tab block, end-of-workout strip" \
  --body "$(cat <<'EOF'
## Summary
- New `lib/hep-exercises.ts` data file with 6 exercises seeded from Justin Joaquin's May 6 prescription
- New `components/hep-block.tsx` with `useHEPCompletion()` hook (date-keyed localStorage) and three render modes
- Three call-sites: Today tab pill (collapsed), Rehab tab full block (always expanded), end-of-every-workout strip (compact)
- All three surfaces share one source of truth — check off in any place, all update

## Spec
docs/superpowers/specs/2026-05-07-pt-hep-daily-design.md

## Test plan
- [x] `e2e/test_hep_daily.py` — 8 tests covering all three surfaces + cross-surface sync + persistence
- [x] Full E2E suite green (no regressions in workout/rehab/persistence tests)
- [x] Manual smoke on local dev: Today pill, Rehab block, workout-end strip all work
- [ ] Karl scans QR codes on his HEP2GO printout and adds the 6 video URLs (follow-up commit, not blocking)

## Follow-ups (not in this PR)
- Issue #113 — better add-new-entry UX once weekly file edits get tedious
- Issue #114 — ad-hoc supersets feature (separate branch, queued for after this merges)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Capture the PR URL printed by `gh pr create` for Karl.

- [ ] **Step 7.3: Wait for CI, address any failures**

```bash
gh pr checks <PR-NUMBER> --watch
```

Expected: Playwright Tests, WearOS Build, GitGuardian, Vercel Preview all SUCCESS.

- [ ] **Step 7.4: Karl reviews the Vercel preview**

Karl opens the Vercel preview URL printed by `gh pr view <PR-NUMBER>`, checks the three surfaces in Safari mobile, and signs off.

- [ ] **Step 7.5: Merge to `dev` (regular merge commit, matching prior PR style)**

```bash
gh pr merge <PR-NUMBER> --merge --delete-branch=false
```

- [ ] **Step 7.6: After dev merge, fetch fresh and merge dev → main**

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git merge --no-ff origin/dev -m "Merge branch 'dev' into main

Promotes feat/pt-hep-daily — Daily Required HEP feature with Today pill,
Rehab tab block, end-of-workout strip, and cross-surface completion sync."
git push origin main
```

- [ ] **Step 7.7: Verify Vercel production build deploys**

```bash
sleep 8
vercel ls nwb-plan 2>&1 | grep -E "Production" | head -3
```

Wait until the most recent Production deploy is `Ready`. Smoke-test on `nfit.93.fyi`:
- Pill renders at top of Today tab
- Rehab tab full block renders
- Workout-end strip renders

- [ ] **Step 7.8: Karl scans QR codes and adds video URLs (follow-up)**

Once Karl scans his HEP2GO printout QR codes, edit `lib/hep-exercises.ts` and fill in the `videoUrl` field for each entry. One commit, push to dev, fast-forward to main. The `▶ Video` icon only renders for entries with `videoUrl` set, so the data lights up incrementally with no code changes.

---

## Self-review checklist (already performed)

- **Spec coverage:** Goals 1–7 all map to tasks (data file → 1; `useHEPCompletion` → 2; pill → 3; full → 4; strip → 5; sync → 5; video link rendering → 3 via `HEPRow`).
- **No placeholders:** No "TBD" / "implement later" — every step has the actual code or command.
- **Type consistency:** `HEPExercise`, `HEPSide`, `HEPBlockMode`, `HEPCompletionApi` types are defined in their introducing tasks and re-used consistently in later tasks.
- **Test-first:** Every UI task has the failing test written BEFORE the implementation step.
- **Idempotent commits:** Each task ends with a commit; the build is green at every commit boundary.
