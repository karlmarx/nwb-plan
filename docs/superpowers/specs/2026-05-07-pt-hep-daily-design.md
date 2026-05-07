# PT HEP Daily — Design Spec

**Date:** 2026-05-07
**Status:** Approved (pending Karl's spec review)
**Source brainstorm:** This conversation
**Related issues:** [#113](https://github.com/karlmarx/nwb-plan/issues/113) (better-add UX), [#114](https://github.com/karlmarx/nwb-plan/issues/114) (ad-hoc supersets — deferred)

## Background

Karl's PT (Justin Joaquin, DPT, CSCS) prescribes a daily HEP (home exercise program) via HEP2GO. As of May 6, 2026 the prescription is six exercises, all 3 sets × 10 reps, performed once daily. The list will grow roughly weekly as recovery progresses through the PWB phase.

The existing `lib/pt-exercises.ts` library is a phase-gated PWB rehab supplement (TTWB → FWB) layered on top of strength training as a flexible "if you have time, try this" option. The new HEP is different: daily prescribed work, no phase gating, separate cadence. Needs its own surface and its own data file so the two ideas don't collide.

## Goals

1. A collapsed-by-default "Daily Required HEP" pill on the Today tab — expands inline to show full per-row list.
2. A full-width "Daily HEP" block on the Rehab tab — natural home for PT-flavored content, shows the same full per-row list expanded by default.
3. A compact one-line-per-exercise strip rendered at the end of every workout view.
4. All three surfaces share completion state — check off once, all three update.
5. Per-exercise per-day completion tracking, persisted in localStorage by date.
6. Append-only friendly data shape so a new HEP entry next week is a one-line file edit.
7. Optional video link rendered as a `▶ Video` icon per row (HEP2GO QR code URL when available).

## Non-goals

- Admin form / photo-in pipeline for adding HEP entries (issue #113 — revisit later).
- Sets/reps logging beyond the per-exercise daily checkmark (no per-set tap counter).
- Cloud sync of HEP completion. Lives in localStorage only — daily resets at midnight, no archive.
- Phase gating, condition predicates, or coupling to `lib/conditions/`.
- Diagram animations (HEP entries surface a static figure URL or fall back to no figure).
- Replacing or modifying `lib/pt-exercises.ts` or the existing Rehab tab content.

## Architecture

Two new files plus targeted edits to two existing files.

### New files

#### `lib/hep-exercises.ts`

The data file. Append-only friendly shape — one entry per prescribed HEP exercise.

```ts
export type HEPSide = "left" | "right" | "bilateral";

export interface HEPExercise {
  /** Stable slug — `hep_<lower_snake>`. Used as localStorage key. */
  id: string;
  /** Display name as written on the HEP2GO printout. */
  name: string;
  /** Plain-text instructions, one paragraph. */
  instructions: string;
  /** Sets count, e.g. 3. */
  sets: number;
  /** Reps per set, e.g. 10. Optional for hold-only exercises. */
  reps?: number;
  /** Hold seconds, e.g. 5. Optional. */
  holdSeconds?: number;
  /** Frequency note — defaults to "1× daily" if omitted. */
  frequency?: string;
  /** Which leg is loaded; "bilateral" for both. */
  side: HEPSide;
  /** HEP2GO video URL (decoded from the QR code). Optional — fill in later. */
  videoUrl?: string;
  /** Optional reference image URL (cropped from the printout). */
  figureUrl?: string;
  /** Date the exercise was added to the prescription (ISO `YYYY-MM-DD`). */
  prescribedOn: string;
  /** Date the exercise was retired, if any. Filters it out of the active list. */
  retiredOn?: string;
}

export const HEP_EXERCISES: HEPExercise[] = [
  // Seed list from May 6 prescription — see below
];

/** All currently-prescribed HEP exercises (excludes retired). */
export function getActiveHEP(): HEPExercise[];
```

#### `components/hep-block.tsx`

The shared HEP component. One file, three render modes:

- `mode="pill"` — collapsed pill (Today tab). Expands inline to show full per-row list.
- `mode="full"` — full-width block (Rehab tab). Always expanded.
- `mode="strip"` — compact one-line-per-exercise strip (end of each workout).
- (Internal) row component shared by all three modes.

API:

```tsx
<HEPBlock mode="pill" />                       // Today tab
<HEPBlock mode="full" />                       // Rehab tab
<HEPBlock mode="strip" workoutKey="Push A" />  // end-of-workout
```

State source: `useHEPCompletion()` hook (defined inside this component file or in a sibling) that reads/writes `localStorage["nwb_hep_done_<YYYY-MM-DD>"]: string[]` (array of HEP ids done today).

### Edited files

#### `components/workout-view.tsx`

- Render `<HEPBlock mode="pill" />` near the top of the Today tab — directly under the workout header, above the exercise list.
- Render `<HEPBlock mode="strip" workoutKey={…} />` at the bottom of the workout body for every workout (Today/Push/Pull/Legs/Freestyle), after the last exercise but before the footer/cross-education panel.
- No state owned in `workout-view.tsx` for HEP — `HEPBlock` self-manages its localStorage hook.

#### `components/rehab-tab.tsx`

- Render `<HEPBlock mode="full" />` at the top of the Rehab tab content area, above the existing phase-gated PT progression. The "Daily HEP" block is the new permanent header section; the existing Rehab content stays intact below.

## Data flow

```
                    ┌──────────────────────────┐
                    │ lib/hep-exercises.ts     │  static data, append-only
                    │  HEP_EXERCISES[]         │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ getActiveHEP()           │  filters retiredOn
                    └────────────┬─────────────┘
                                 │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼───────────┐ ┌───────▼────────────┐ ┌──────▼───────────────┐
│ <HEPBlock          │ │ <HEPBlock          │ │ <HEPBlock            │
│  mode=pill>        │ │  mode=full>        │ │  mode=strip>         │
│ Today tab          │ │ Rehab tab (top)    │ │ end of every workout │
└────────┬───────────┘ └───────┬────────────┘ └──────┬───────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────▼─────────────┐
                    │ useHEPCompletion()     │  shared hook
                    │  localStorage          │
                    │   nwb_hep_done_<date>  │
                    └────────────────────────┘
```

Single source of truth — the shared hook means tapping a checkbox in the Today block updates the workout-strip view immediately and vice versa, no prop-drilling, no event bus.

## UX

### Today-tab pill (collapsed default)

- Pill: rounded rectangle near top of Today tab, single line.
  - Left: "🏥 HEP — 3/6 done today"
  - Right: chevron `▶` rotates to `▼` on expand
- Expanded: vertically stacked rows, one per active HEP exercise.
  - Row layout (left → right): checkbox · name (bold) · "3 × 10" or "3 × 10 · 5s hold" · `▶ Video` icon (only if `videoUrl` set) · `ℹ` info icon (taps reveal `instructions` inline)
  - Row tap on info expands instructions inline below the row, second tap collapses.
  - Row checkbox toggles `done` for that exercise on today's date.
- Color: subtle neutral, quiet floor. Doesn't compete with the workout content.

### Rehab-tab full block (always expanded)

- Renders at the top of the Rehab tab body, above the existing phase-gated PT progression.
- Header: "Daily Required HEP — 3/6 done today"
- Same row layout as the expanded Today pill (checkbox · name · sets/reps · ▶ video · ℹ instructions). Always expanded — no collapse toggle here, this surface IS the canonical detailed view.
- Visually distinct from the existing Rehab content below (different background tint or a divider) so the user reads it as "your daily floor" vs "phase-gated supplements."

### End-of-workout strip

- Header: "Don't forget — Daily HEP · 3/6 done"
- Compact rows, one per exercise:
  - Tiny checkbox · name · `▶` icon (if video available)
  - No reps/sets shown (saves space — Today/Rehab blocks have the full info)
  - Tap a row → expands instructions inline below, same as Today block
- Renders at the end of every workout view (Push A, Pull A, Legs B, Freestyle, Today). Does NOT render in Equipment / Safety / History tabs.

### Completion tracking

- `localStorage["nwb_hep_done_<YYYY-MM-DD>"]: string[]` — HEP ids checked off for that date.
- Date key is local-time ISO date.
- Past days' keys remain in localStorage (small footprint — 6+ ids × 365 days = ~3KB/year). No cleanup needed for years.
- "3/6 done today" reads `getActiveHEP().length` and the count of intersection between done ids and active ids.

## Seed data — May 6, 2026 prescription

The six entries seeded into `HEP_EXERCISES`. `videoUrl` left blank pending Karl scanning the QR codes; `figureUrl` blank pending HEP2GO source images.

| `id` | Name | Sets × Reps | Hold | Side |
|---|---|---|---|---|
| `hep_prone_hip_extension` | Prone Hip Extension | 3 × 10 | — | left |
| `hep_hip_abduction_sidelying` | Hip Abduction - Sidelying | 3 × 10 | — | left |
| `hep_straight_leg_raise` | Straight Leg Raise (SLR) | 3 × 10 | — | left |
| `hep_bridging_ball_squeeze` | Bridging with Rubber Ball Squeeze | 3 × 10 | — | bilateral |
| `hep_isometric_hip_er_prone_ball` | Isometric Hip ER - Prone - Ball Squeeze | 3 × 10 | 5s | bilateral |
| `hep_band_sidelying_clamshell` | Elastic Band - Side-Lying Clamshell | 3 × 10 | — | left |

All seeded with `prescribedOn: "2026-05-06"`. Instructions copied from the printouts verbatim.

## Testing

### Unit / component
- `lib/hep-exercises.ts`: `getActiveHEP()` excludes entries with `retiredOn` set; ordering preserved.
- `useHEPCompletion()` hook: writes to correct date-keyed localStorage key; reads back the same key on remount; handles date rollover at midnight.

### E2E (Playwright/pytest in `e2e/`)
- `test_hep_block_today.py`: Today tab pill renders, shows "0/6 done", expands on click, checkboxes toggle and persist across reload.
- `test_hep_block_workout_strip.py`: end-of-workout strip renders on Push A, count matches Today block, checking a row in the strip reflects in the Today pill on tab switch.

## Build sequence

1. **Data layer** — write `lib/hep-exercises.ts` with seed data and `getActiveHEP()`. Tests for the helper.
2. **Hook** — `useHEPCompletion()` with localStorage date-keyed persistence. Unit tests for the hook.
3. **Component, pill mode** — `<HEPBlock mode="pill" />` with collapsed pill + expanded list. Wire into Today tab in `workout-view.tsx`. Visual check.
4. **Component, full mode** — extend with `mode="full"` (same row layout, always expanded). Wire into `components/rehab-tab.tsx` at top of body.
5. **Component, strip mode** — extend with `mode="strip"`. Wire into workout-body render in `workout-view.tsx`.
6. **E2E tests** — three surfaces, plus completion-sync test (check off in pill, see it reflected in strip).
7. **Manual smoke** — Karl checks Safari mobile across Today / Rehab / mid-workout + adds video URLs after scanning QR codes.

## Open questions

None blocking. Two non-blocking follow-ups already filed:
- [#113](https://github.com/karlmarx/nwb-plan/issues/113) — better add-new-entry UX once Karl gets sick of editing the file by hand
- [#114](https://github.com/karlmarx/nwb-plan/issues/114) — ad-hoc supersets feature (separate branch, post-merge)

## Out of scope decisions made

- HEP exercises do **not** count toward workout completion (workout completion remains a separate tracker).
- HEP completion does **not** push to the cloud-sync `workout_sessions` table — different lifecycle (daily floor vs per-workout history).
- HEP rest timer is **not** integrated with the existing `RestTimer` component (the prescriptions don't specify rest between sets).
- The full focus-mode rewrite (separate brainstorm — see chat history) is sequenced AFTER this feature ships and merges to dev + main.
