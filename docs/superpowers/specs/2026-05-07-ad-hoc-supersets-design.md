# Ad-Hoc Supersets — Design Spec

**Date:** 2026-05-07
**Status:** Approved (pending Karl's spec review)
**Source brainstorm:** This conversation, captured initially in [issue #114](https://github.com/karlmarx/nwb-plan/issues/114)
**Branch:** `feat/ad-hoc-supersets`
**Predecessor:** PT HEP Daily (PR #115, merged to main as of `0c47ef6`)

## Background

The existing `components/complement-picker.tsx` modal lets the user add a complement (superset partner) to any exercise from one of five curated sources: nearby supersets, left-leg supplements, day-specific core, mobility drills, phase-gated PT exercises. Each source has its own section in the modal; finding what you want requires knowing which source-bucket it lives in.

Two real-world gaps:
1. **The full exercise catalog (`lib/exercises.ts`'s `EX`) is not searchable as a complement.** If you want to superset an arbitrary lift (e.g., "Glute Bridge" to pair with "Bench Press"), there's no path — the picker only surfaces curated complements.
2. **One-off custom additions have no path.** If you do a Cossack squat that nobody's built into the data, you can't track it as a complement.

This feature adds catalog search and free-text complements, and at the same time replaces the source-tab UX with a single universal search box + filter chips. The picker becomes "type what you want, find it everywhere" instead of "remember which source-tab it lives in."

## Goals

1. Replace the picker's stacked-by-source layout with a single search input at the top of the modal body.
2. Add filter chips below the search (`All / Catalog / Nearby / Supplement / Core / Mobility / PT`) — toggle-able, multi-select, default `All`.
3. New search hits all sources at once: `EX` (catalog), `SUPPLEMENT_EX`, `MOBILITY_SUPPLEMENTS`, `PT_EXERCISES`, `NEARBY_SUPERSETS`, `SUPPLEMENT_CORE` (current day's only).
4. Substring match on display name, case-insensitive. Exact-prefix matches sorted before substring matches. No fuzzy library — keep it dependency-free.
5. Empty search shows a curated default list (the existing five sections, just rendered as flat cards in source order).
6. Add a "Custom text" toggle that swaps the search input for a single-line text input + Save button. Saves a free-text complement.
7. Two new `ComplementId` kinds and encode/decode functions:
   - `lib|<exercise-id>` — references an entry in `EX` by its `id`
   - `text|<base64-encoded-string>` — embeds the user's free-text inline (so it round-trips through localStorage)
8. Both new complement kinds render under the exercise the same way existing complements do — a card below the exercise row. `lib` complements use the catalog data (sets/reps from `EX[id]`); `text` complements render as a thin card with just the typed string + a check.

## Non-goals

- Reordering complements within an exercise.
- Editing a custom-text complement after it's added (delete + re-add for v1).
- Searching across user-saved workout history (i.e., "show me what I supersetted last time").
- Advanced fuzzy matching (Fuse.js, Levenshtein, etc.).
- Cloud-syncing custom-text complements separately from `dayState`.
- Searching `HEP_EXERCISES` — HEP is a daily floor, not a workout complement. Out of scope.
- Visual redesign of the existing complement card (`ComplementButton`) — same shape, just used in new contexts.

## Architecture

One file heavily modified, three small touch-ups. No new files.

### Modified files

| File | What changes |
|---|---|
| `components/complement-picker.tsx` | Add `encodeLibId`, `encodeTextId` and update `decodeComplement` to handle the two new kinds. Replace the stacked-sections render with a search input, filter chips, and a flat result list. Add a "Custom text" toggle. |
| `components/workout-view.tsx` | In the complement-card render code (existing `decodeComplement` switch around line 990 and 1319), add cases for `lib` and `text` kinds. Render `lib` using `EX[id]` data; render `text` using the inline string. |
| `e2e/test_complement_picker.py` *or* a new file `e2e/test_ad_hoc_supersets.py` | New E2E tests: catalog search, filter chip behavior, custom text add, both render correctly under their parent exercise, persistence. |

(Pick `e2e/test_ad_hoc_supersets.py` if no `test_complement_picker.py` exists, otherwise extend the existing one. Implementation will check.)

## Data model

Two new `ComplementId` kinds appended to the existing union:

```ts
// components/complement-picker.tsx
export function encodeLibId(exId: string): ComplementId {
  return `lib${SEP}${exId}`;
}

export function encodeTextId(text: string): ComplementId {
  return `text${SEP}${btoa(text)}`;  // base64 to survive the SEP delimiter
}

export function decodeComplement(id: ComplementId): {
  kind: "nearby" | "supp" | "core" | "mobility" | "pt" | "lib" | "text";
  value: string;
  sub?: string;
} {
  // existing decoder, plus:
  // - "lib" → returns the exercise id (call site looks up in EX)
  // - "text" → returns base64-decoded user string
}
```

`dayState.complements: Record<exerciseName, ComplementId[]>` storage shape is unchanged. The new kinds are just two more strings in the same array.

## Search algorithm

Single function, called on every keystroke (debounced 100ms via existing patterns or just inline).

```ts
function searchComplements(
  query: string,
  filters: Set<ComplementSource>,  // "catalog" | "nearby" | "supp" | "core" | "mobility" | "pt"
  ctx: { exerciseRequires, exerciseCategory, workoutKey, nearbySelections, ptPhase },
): SearchResult[];

interface SearchResult {
  id: ComplementId;
  title: string;
  source: ComplementSource;
  sets?: string;       // "3×10" or similar
  description: string; // first line of execution / instructions
  color: string;       // existing source-color (NEARBY=teal, CORE=orange, etc.)
}
```

Behavior:
- Empty query, all filters: returns the full curated set (existing nearby/supp/pt/core/mobility lists in source order). Catalog NOT included by default — too long; only surfaces with a non-empty query or when the `Catalog` chip is the only active filter.
- Non-empty query: substring match on `title.toLowerCase()` against `query.toLowerCase()`. Case-insensitive. Sort: exact prefix matches first, then alphabetical within each match group.
- Filters: source must be in the active filter set to be included. `All` chip toggles all on/off.

The existing source-availability logic (`nearbyAvail`, `suppAvail`, etc., from `useMemo`) is reused — wrapped behind `searchComplements`.

## UX

### Picker modal layout

```
┌────────────────────────────────────────┐
│  Add complement                  [×]   │
│  Equipment-aware suggestions           │
├────────────────────────────────────────┤
│  [🔍 Search complements...        ]    │
│  [All] [Catalog] [Nearby] [Supp]       │
│  [Core] [Mobility] [PT]                │
│                                         │
│  [+ Custom text]                       │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ NEARBY  Glute Bridge × 3 reps  ✓ │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ CATALOG Cable Pull-down · 3×10   │  │
│  └──────────────────────────────────┘  │
│  ...                                   │
└────────────────────────────────────────┘
```

- Search input: full-width, sticky to top of body. Placeholder: "Search complements...".
- Filter chips: horizontally scrollable on mobile if overflow. `All` is mutually exclusive with the others (clicking `All` deselects others; clicking a specific source deselects `All`).
- "Custom text" pill: tap → search input morphs into a free-text input + "Save" button. Esc / outside-tap returns to search mode.
- Results list: flat scrollable list, each row uses the existing `ComplementButton` shape, sorted by source-grouping when no query, search-relevance when query present.

### Custom text input mode

```
┌────────────────────────────────────────┐
│  Add complement                  [×]   │
├────────────────────────────────────────┤
│  [Type your superset...     ] [Save]   │
│                                         │
│  Cancel                                 │
└────────────────────────────────────────┘
```

- Single line, `<input>`, Enter or Save button commits.
- "Save" creates a `text|<base64>` complement, calls `onToggle(id)`, and closes the modal.
- Cancel returns to search mode without saving.
- Empty input on Save = no-op (don't add empty complements).

### Rendered complements (under the exercise)

`lib` kind:
- Card uses the catalog name from `EX[id].name`.
- Sets/reps: shows `EX[id].sets[0]` (first set spec — same convention used elsewhere).
- Color: a new accent for catalog complements, e.g. `#3b82f6` (blue) — distinguishes from nearby (teal), core (orange), supp (purple), mobility (cyan), pt (pink). Final color picked during implementation, not blocking.
- Tap to mark done (uses existing `completedSupersets` state).

`text` kind:
- Card uses the typed string as the title.
- No sets/reps line.
- Subtle "Custom" label tag.
- Color: a neutral `#71717a` (gray) — distinct from all curated kinds.
- Tap to mark done. Long-press (or a small × on the card) removes — since custom text can't be re-found via search, removal needs a clear path.

## Testing

E2E tests in `e2e/test_ad_hoc_supersets.py` (new file):

1. **`test_open_picker_shows_search_and_chips`** — open complement picker on any exercise; assert search input + filter chips present.
2. **`test_search_finds_catalog_exercise`** — type "bench"; assert `EX["barbell_floor_press"]` (or similar) appears as a search result with `CATALOG` label.
3. **`test_filter_chip_narrows_results`** — search "press"; toggle off `Catalog` chip; assert no `CATALOG`-labeled rows remain (only nearby/supp/etc. matches).
4. **`test_add_custom_text_complement`** — tap "Custom text"; type "Cossack squat 3x8"; tap Save; assert modal closes; assert custom card renders under the parent exercise with the typed text.
5. **`test_add_lib_complement`** — search and tap a catalog result; assert modal closes; assert the lib card renders under the parent exercise with `EX[id].name` and sets/reps.
6. **`test_complement_persistence`** — add a custom text + a lib complement; reload page; assert both still present under the exercise.
7. **`test_remove_custom_text`** — add custom text; tap remove; assert card disappears, localStorage updated.

## Build sequence

1. **Encode/decode.** Add `encodeLibId`, `encodeTextId`, and extend `decodeComplement`. Type-check passes.
2. **Search function.** Pure helper `searchComplements(query, filters, ctx)` that wraps the existing source-availability logic. Unit-testable conceptually — but no test runner, so behavior gets covered by E2E.
3. **Picker UI v1.** Replace stacked sections with search input + flat result list. No filter chips yet, no custom-text yet. Existing complements still work.
4. **Filter chips.** Add the `All / Catalog / Nearby / Supplement / Core / Mobility / PT` chip row.
5. **Catalog source.** Wire `EX` into `searchComplements`. Empty-query still excludes catalog (too long); non-empty query or `Catalog`-only filter includes it.
6. **Custom-text mode.** Add the toggle + free-text input + Save handler.
7. **Render `lib` kind.** Update the complement-card render in `workout-view.tsx` to handle `lib` complements (look up `EX[id]`, use `EX[id].name`, sets, etc.).
8. **Render `text` kind.** Update render to handle `text` complements (decode base64, render as plain card with custom label).
9. **E2E tests.** All 7 from above.
10. **Manual smoke.** Karl tests on Safari mobile.

## Out of scope (explicit, won't be in this PR)

- Editing custom text after add (delete + re-add).
- Searching workout-session history (lib/workout-log) for "what I did last time."
- Reordering complements within an exercise (drag-to-reorder).
- A "favorites" or "recently used" pinned section in the picker.
- Hotkey to focus search input (mobile-first; keyboard hotkeys are low priority).
- Searching across HEP exercises.

## Open questions

None blocking. The spec answers issue #114's open points by committing to the substring-match algorithm and the always-show-curated-default behavior.
