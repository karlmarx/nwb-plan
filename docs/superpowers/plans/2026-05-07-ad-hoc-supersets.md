# Ad-Hoc Supersets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the source-stacked complement picker with a universal search + filter chips, add catalog (`lib`) and free-text (`text`) complements, and render both new kinds under their parent exercise.

**Architecture:** Two new `ComplementId` kinds (`lib|<exercise-name>`, `text|<base64>`) layered onto the existing pipe-delimited encoder. The picker keeps its source-availability `useMemo` but wraps the result in a `searchComplements()` helper that returns a flat result list filtered by query + filter-chip set. Render-side gets two new switch arms in `workout-view.tsx`'s two decode sites. No new files in `lib/` or `components/` — all picker logic stays inside `components/complement-picker.tsx`.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript, Tailwind v4, Playwright/pytest E2E.

**Spec:** `docs/superpowers/specs/2026-05-07-ad-hoc-supersets-design.md` (commit `b7a6b83`).

**Branch:** `feat/ad-hoc-supersets`.

---

## File Structure

| File | Why it changes |
|---|---|
| `components/complement-picker.tsx` | Add `encodeLibId` + `encodeTextId`; extend `decodeComplement` union; replace stacked-section render with search + chips + flat list + custom-text mode. |
| `components/workout-view.tsx` | Two decode sites (lines ~990 and ~1319) get new switch arms for `lib` and `text` complement kinds. |
| `e2e/test_ad_hoc_supersets.py` (new) | 7 E2E tests covering search, filter chips, catalog + custom-text add/remove, persistence. |

No `lib/*` changes. No new files outside `components/` and `e2e/`.

---

## Task 1: Encode/decode + type union

Pure additions to `components/complement-picker.tsx`. Adds `encodeLibId` and `encodeTextId` exports and extends `decodeComplement` to recognize the two new kinds. No UI yet.

**Files:**
- Modify: `components/complement-picker.tsx:32-73`

- [ ] **Step 1: Read the existing decoder block to confirm shape**

Run: `sed -n '32,73p' components/complement-picker.tsx`

Expected output: shows `export type ComplementId = string`, `const SEP = "|"`, the five existing encoders, and `decodeComplement` returning a union of `"nearby" | "supp" | "core" | "mobility" | "pt"`.

- [ ] **Step 2: Add `encodeLibId` and `encodeTextId` plus extend the union**

Edit `components/complement-picker.tsx`. Replace the block from the `encodePTId` definition (around line 48) through the end of `decodeComplement` (around line 73) with:

```ts
export function encodePTId(ptId: string): ComplementId {
  return `pt${SEP}${ptId}`;
}

export function encodeLibId(exerciseName: string): ComplementId {
  return `lib${SEP}${exerciseName}`;
}

export function encodeTextId(text: string): ComplementId {
  // base64 keeps the SEP delimiter safe even if the user types pipes
  if (typeof btoa === "function") return `text${SEP}${btoa(text)}`;
  return `text${SEP}${Buffer.from(text, "utf-8").toString("base64")}`;
}

export function decodeComplement(id: ComplementId): {
  kind: "nearby" | "supp" | "core" | "mobility" | "pt" | "lib" | "text";
  value: string;
  sub?: string;
} {
  // Backward compat: try pipe first, fall back to colon for legacy IDs
  const sep = id.includes("|") ? "|" : ":";
  const [kind, ...rest] = id.split(sep);
  if (kind === "nearby") {
    return { kind: "nearby", value: rest[0], sub: rest.slice(1).join(sep) };
  }
  if (kind === "mob") {
    return { kind: "mobility", value: rest.join(sep) };
  }
  if (kind === "core") {
    return { kind: "core", value: rest.join(sep) };
  }
  if (kind === "pt") {
    return { kind: "pt", value: rest.join(sep) };
  }
  if (kind === "lib") {
    return { kind: "lib", value: rest.join(sep) };
  }
  if (kind === "text") {
    const encoded = rest.join(sep);
    let decoded = encoded;
    try {
      decoded =
        typeof atob === "function"
          ? atob(encoded)
          : Buffer.from(encoded, "base64").toString("utf-8");
    } catch {
      decoded = encoded;
    }
    return { kind: "text", value: decoded };
  }
  return { kind: "supp", value: rest.join(sep) };
}
```

- [ ] **Step 3: Typecheck the change**

Run: `npx tsc --noEmit`

Expected: 0 errors. (If errors mention `decodeComplement` consumers in `workout-view.tsx`, that is fine and expected — we will add the missing switch arms in Task 6 and Task 8.)

If `tsc` complains that the consumer-side `decoded.kind` switch is non-exhaustive, the project does not enforce exhaustiveness — those switches are if/else-if chains that fall through, so the new kinds will simply produce no card until Tasks 6/8. Confirm by running `npm run build` next.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: build succeeds. The new exports compile, the switch chains in `workout-view.tsx` ignore the new kinds for now (no card rendered), no warnings.

- [ ] **Step 5: Commit**

```bash
git add components/complement-picker.tsx
git commit -m "feat(supersets): encode/decode for lib and text complement kinds"
```

---

## Task 2: `searchComplements` helper

Pure helper inside `components/complement-picker.tsx`. Wraps the existing source-availability `useMemo` results into a single typed list and applies query + filter-chip filtering. No UI changes yet — the helper is unused after this task.

**Files:**
- Modify: `components/complement-picker.tsx` — append helper before the `ComplementButton` block

- [ ] **Step 1: Read the picker imports + source-availability useMemo**

Run: `sed -n '1,20p;165,215p' components/complement-picker.tsx`

Expected: shows imports of `NEARBY_SUPERSETS`, `SUPPLEMENT_LEFT_LEG`, `SUPPLEMENT_CORE`, `SUPPLEMENT_EX`, `MOBILITY_SUPPLEMENTS` and the `useMemo` block populating `nearbyAvail`, `suppAvail`, `ptAvail`, `coreAvail`, `coreSubtitle`, `mobilityAvail`.

- [ ] **Step 2: Add the `ComplementSource` type and `SearchResult` interface**

Edit `components/complement-picker.tsx`. After the `decodeComplement` function definition (around line 95 after Task 1), insert:

```ts
// ── Search helpers ───────────────────────────────────────────────────────

export type ComplementSource =
  | "catalog"
  | "nearby"
  | "supp"
  | "core"
  | "mobility"
  | "pt";

export interface SearchResult {
  id: ComplementId;
  source: ComplementSource;
  /** Short uppercase label shown on the chip (NEARBY / CATALOG / etc.). */
  label: string;
  /** Source accent color (matches existing color scheme). */
  color: string;
  /** Display title — exercise name or supplement name. */
  title: string;
  /** "3×10" or similar; empty string if not applicable. */
  sets: string;
  /** First line of execution / instruction. */
  description: string;
}

interface SearchInputs {
  nearbyAvail: NearbySuperset[];
  suppAvail: Array<{ name: string; data: (typeof SUPPLEMENT_EX)[string] }>;
  coreAvail: Array<{
    name: string;
    region: string;
    data: (typeof SUPPLEMENT_EX)[string];
  }>;
  ptAvail: Array<{ id: string; name: string; sets: string; execution: string }>;
  mobilityAvail: MobilitySupplement[];
  /** All exercise display-names from EX (only searched when query is non-empty). */
  catalogNames: string[];
  /** EX lookup so we can build sets/description for catalog hits. */
  catalogLookup: Record<string, { name: string; sets: [string, string][]; execution?: string }>;
}

const SOURCE_META: Record<ComplementSource, { label: string; color: string }> = {
  catalog: { label: "CATALOG", color: "#3b82f6" },
  nearby: { label: "NEARBY", color: "#14b8a6" },
  supp: { label: "L-LEG", color: "#14b8a6" },
  core: { label: "CORE", color: "#f97316" },
  mobility: { label: "MOBILITY", color: "#0ea5e9" },
  pt: { label: "PT", color: "#34d399" },
};

export function searchComplements(
  query: string,
  filters: Set<ComplementSource>,
  inputs: SearchInputs,
): SearchResult[] {
  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  const want = (s: ComplementSource) => filters.size === 0 || filters.has(s);

  if (want("nearby")) {
    for (const ns of inputs.nearbyAvail) {
      results.push({
        id: encodeNearbyId(ns),
        source: "nearby",
        label: SOURCE_META.nearby.label,
        color: SOURCE_META.nearby.color,
        title: ns.title,
        sets: ns.sets,
        description: ns.instruction,
      });
    }
  }

  if (want("supp")) {
    for (const { name, data } of inputs.suppAvail) {
      const s = data.sets[0];
      results.push({
        id: encodeSuppId(name),
        source: "supp",
        label: SOURCE_META.supp.label,
        color: SOURCE_META.supp.color,
        title: name,
        sets: `${s[0]}×${s[1]}`,
        description: data.execution,
      });
    }
  }

  if (want("core")) {
    for (const { name, region, data } of inputs.coreAvail) {
      const s = data.sets[0];
      results.push({
        id: encodeCoreId(name),
        source: "core",
        label: region.toUpperCase(),
        color: SOURCE_META.core.color,
        title: name,
        sets: `${s[0]}×${s[1]}`,
        description: data.execution,
      });
    }
  }

  if (want("pt")) {
    for (const ex of inputs.ptAvail) {
      results.push({
        id: encodePTId(ex.id),
        source: "pt",
        label: SOURCE_META.pt.label,
        color: SOURCE_META.pt.color,
        title: ex.name,
        sets: ex.sets,
        description: ex.execution,
      });
    }
  }

  if (want("mobility")) {
    for (const m of inputs.mobilityAvail) {
      const color =
        m.kind === "breathing"
          ? "#8b5cf6"
          : m.kind === "stretch"
            ? "#f59e0b"
            : SOURCE_META.mobility.color;
      const label =
        m.kind === "breathing"
          ? "BREATH"
          : m.kind === "stretch"
            ? "STRETCH"
            : SOURCE_META.mobility.label;
      results.push({
        id: encodeMobilityId(m),
        source: "mobility",
        label,
        color,
        title: m.name,
        sets: m.sets,
        description: m.instruction,
      });
    }
  }

  // Catalog only surfaces when the user has typed something, OR when the
  // catalog filter is the only one active (so they explicitly opted into
  // browsing the full catalog without a query).
  const catalogOnly = filters.size === 1 && filters.has("catalog");
  if (want("catalog") && (q.length > 0 || catalogOnly)) {
    for (const name of inputs.catalogNames) {
      const data = inputs.catalogLookup[name];
      if (!data) continue;
      const s = data.sets[0];
      results.push({
        id: encodeLibId(name),
        source: "catalog",
        label: SOURCE_META.catalog.label,
        color: SOURCE_META.catalog.color,
        title: name,
        sets: s ? `${s[0]}×${s[1]}` : "",
        description: data.execution ?? "",
      });
    }
  }

  if (q.length === 0) return results;

  // Substring match on title; exact-prefix matches sort before substring matches.
  const filtered = results.filter((r) => r.title.toLowerCase().includes(q));
  filtered.sort((a, b) => {
    const aPrefix = a.title.toLowerCase().startsWith(q) ? 0 : 1;
    const bPrefix = b.title.toLowerCase().startsWith(q) ? 0 : 1;
    if (aPrefix !== bPrefix) return aPrefix - bPrefix;
    return a.title.localeCompare(b.title);
  });
  return filtered;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

Expected: 0 errors. The helper is exported but unused, which TypeScript permits.

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: build succeeds, no new warnings.

- [ ] **Step 5: Commit**

```bash
git add components/complement-picker.tsx
git commit -m "feat(supersets): searchComplements helper for unified query + filter"
```

---

## Task 3: Picker UI — search input + flat result list

Replace the stacked-by-source render block (lines ~272–429 of `complement-picker.tsx`) with a single search input on top and a flat list below. Filter chips and custom-text mode come in later tasks. The result list uses `searchComplements()` with no filters set, empty query → existing five sources flat-rendered; non-empty query → substring filter on title.

**Files:**
- Modify: `components/complement-picker.tsx:272-429` (replace render block)
- Test: `e2e/test_ad_hoc_supersets.py` (new file)

- [ ] **Step 1: Write the failing test for search input + flat list**

Create `e2e/test_ad_hoc_supersets.py` with:

```python
"""E2E tests for the ad-hoc supersets / universal complement picker."""

from playwright.sync_api import Page, expect


def open_picker_for_first_exercise(page: Page) -> None:
    """Open the complement picker for the first exercise on Today."""
    page.get_by_test_id("tab-workout").click()
    # Expand first exercise so its "+ complement" button is visible
    first_row = page.get_by_test_id("exercise-row").first
    first_row.click()
    first_row.get_by_role("button", name="Add complement").first.click()
    expect(page.get_by_test_id("complement-picker")).to_be_visible()


def test_picker_has_search_and_results(app_page: Page):
    """Picker renders a search input and shows a flat list of curated results."""
    open_picker_for_first_exercise(app_page)
    expect(app_page.get_by_test_id("complement-search")).to_be_visible()
    # At least one result row appears with a source label
    rows = app_page.get_by_test_id("complement-result")
    expect(rows.first).to_be_visible()
```

- [ ] **Step 2: Run the new test (expect RED)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_picker_has_search_and_results -v`

Expected: FAIL — `complement-search` testid is not present yet.

- [ ] **Step 3: Replace the stacked-section render with search input + flat list**

Edit `components/complement-picker.tsx`. First, add `useState` and `useEffect` to the React import at the top:

```ts
import React, { useEffect, useMemo, useState } from "react";
```

Then add the EX import near the existing `@/lib/supplements` import (around line 12):

```ts
import { EX } from "@/lib/exercises";
```

Now find the existing `useMemo` block ending with `return { nearbyAvail, suppAvail, ptAvail, coreAvail, coreSubtitle, mobilityAvail };` (around line 211). Immediately AFTER that closing brace and the dependency array `}, [...])`, add:

```ts
  const catalogNames = useMemo(() => Object.keys(EX), []);
  const catalogLookup = useMemo(() => EX as unknown as SearchInputs["catalogLookup"], []);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Set<ComplementSource>>(() => new Set());

  const results = useMemo(
    () =>
      searchComplements(query, filters, {
        nearbyAvail,
        suppAvail,
        coreAvail,
        ptAvail: ptAvail.map((p) => ({
          id: p.id,
          name: p.name,
          sets: p.sets,
          execution: p.execution,
        })),
        mobilityAvail,
        catalogNames,
        catalogLookup,
      }),
    [query, filters, nearbyAvail, suppAvail, coreAvail, ptAvail, mobilityAvail, catalogNames, catalogLookup],
  );
```

Next, replace the entire body block from the opening of the body div (around line 270, the `{/* Body */}` comment) through the closing `</div>` of that body div (around line 430, just before `{/* Footer */}`). The replacement:

```tsx
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 pt-3">
          <input
            data-testid="complement-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search complements..."
            className="w-full mb-3 px-3 py-2 rounded-lg text-sm font-[inherit]"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />

          {results.length === 0 && (
            <div className="text-[12px] text-text-muted py-3 leading-relaxed">
              {query
                ? `No matches for "${query}".`
                : "Nothing in reach right now. Open the edit sheet and select nearby equipment, or try adding generic quad sets below."}
            </div>
          )}

          <div className="space-y-1.5">
            {results.map((r) => (
              <div data-testid="complement-result" key={r.id}>
                <ComplementButton
                  label={r.label}
                  color={r.color}
                  title={r.title}
                  sets={r.sets}
                  description={r.description}
                  active={activeSet.has(r.id)}
                  onClick={() => onToggle(r.id)}
                />
              </div>
            ))}
          </div>
        </div>
```

Finally, delete the now-unused `hasAny` variable (around line 214).

- [ ] **Step 4: Run the test (expect GREEN)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_picker_has_search_and_results -v`

Expected: PASS.

- [ ] **Step 5: Run the full e2e suite to make sure nothing else regressed**

Run: `cd e2e && uv run pytest -x --timeout=60 -q`

Expected: all tests pass. Existing test files do not assert on the stacked-section testids (we use `complement-picker` testid only), so the suite stays green.

If any test fails because it asserted on a stacked-section heading like "In reach (N)", treat it as test debt — patch the test to use `complement-result` instead and note in the commit.

- [ ] **Step 6: Commit**

```bash
git add components/complement-picker.tsx e2e/test_ad_hoc_supersets.py
git commit -m "feat(supersets): universal search input + flat result list"
```

---

## Task 4: Filter chip row

Adds the `All / Catalog / Nearby / Supp / Core / Mobility / PT` chip row beneath the search input. `All` = empty filter set (the default); clicking a specific source replaces the set with that single source; clicking `All` clears.

**Files:**
- Modify: `components/complement-picker.tsx` (chip row insertion)
- Test: `e2e/test_ad_hoc_supersets.py`

- [ ] **Step 1: Write the failing test**

Append to `e2e/test_ad_hoc_supersets.py`:

```python
def test_filter_chip_narrows_results(app_page: Page):
    """Activating a single filter chip removes results from other sources."""
    open_picker_for_first_exercise(app_page)
    # Establish baseline: at least one non-catalog row exists
    pre_count = app_page.get_by_test_id("complement-result").count()
    assert pre_count > 0

    # Activate the Nearby chip — only NEARBY-labeled rows should remain
    app_page.get_by_test_id("filter-chip-nearby").click()
    rows = app_page.get_by_test_id("complement-result")
    # Every visible result row's label badge must say NEARBY
    for i in range(rows.count()):
        badge = rows.nth(i).locator("span", has_text="NEARBY")
        expect(badge).to_be_visible()
```

- [ ] **Step 2: Run the test (expect RED)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_filter_chip_narrows_results -v`

Expected: FAIL — `filter-chip-nearby` does not exist.

- [ ] **Step 3: Add the chip row**

Edit `components/complement-picker.tsx`. Inside the body div, AFTER the search input and BEFORE the `{results.length === 0 && ...}` check, insert:

```tsx
          <div className="flex flex-wrap gap-1.5 mb-3">
            {([
              ["all", "All"],
              ["catalog", "Catalog"],
              ["nearby", "Nearby"],
              ["supp", "L-Leg"],
              ["core", "Core"],
              ["mobility", "Mobility"],
              ["pt", "PT"],
            ] as const).map(([key, label]) => {
              const isAll = key === "all";
              const active = isAll
                ? filters.size === 0
                : filters.has(key as ComplementSource);
              return (
                <button
                  key={key}
                  data-testid={`filter-chip-${key}`}
                  onClick={() => {
                    if (isAll) {
                      setFilters(new Set());
                    } else {
                      setFilters(new Set([key as ComplementSource]));
                    }
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 cursor-pointer font-[inherit]"
                  style={{
                    background: active
                      ? "var(--color-accent)22"
                      : "var(--color-bg)",
                    border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
                    color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
```

- [ ] **Step 4: Run the test (expect GREEN)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_filter_chip_narrows_results -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/complement-picker.tsx e2e/test_ad_hoc_supersets.py
git commit -m "feat(supersets): filter chips for source-narrowing"
```

---

## Task 5: Catalog source — search EX

Wire the full `EX` exercise catalog into search results. Empty query keeps the catalog hidden (too long); typed query OR `Catalog`-only filter surfaces matching catalog entries. The `searchComplements` helper from Task 2 already handles both branches — this task just needs an E2E to confirm.

**Files:**
- Test: `e2e/test_ad_hoc_supersets.py`

- [ ] **Step 1: Write the failing test**

Append to `e2e/test_ad_hoc_supersets.py`:

```python
def test_search_finds_catalog_exercise(app_page: Page):
    """Typing 'bench' surfaces a CATALOG-labeled result from EX."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("complement-search").fill("bench")
    # Wait for re-render
    rows = app_page.get_by_test_id("complement-result")
    # At least one row exists with the CATALOG label
    catalog_rows = rows.filter(has_text="CATALOG")
    expect(catalog_rows.first).to_be_visible()
```

- [ ] **Step 2: Run the test**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_search_finds_catalog_exercise -v`

Expected: PASS — Tasks 2 + 3 already wired this. If it fails, double-check that `catalogNames` and `catalogLookup` are passed to `searchComplements()` in Task 3 and that `EX` is imported.

- [ ] **Step 3: Commit (test only — no code change)**

```bash
git add e2e/test_ad_hoc_supersets.py
git commit -m "test(supersets): catalog search surfaces EX entries"
```

---

## Task 6: Render `lib` complement in workout-view

Adds the missing switch arm for `decoded.kind === "lib"` to BOTH decode sites in `components/workout-view.tsx` (around lines 990 and 1319). A `lib` complement looks up `EX[name]`, renders with sets from `EX[name].sets[0]`, and is removable like other user-opted complements.

**Files:**
- Modify: `components/workout-view.tsx` (two switch insertions)
- Test: `e2e/test_ad_hoc_supersets.py`

- [ ] **Step 1: Write the failing test**

Append to `e2e/test_ad_hoc_supersets.py`:

```python
def test_add_lib_complement(app_page: Page):
    """Tapping a CATALOG result adds a lib-kind card under the parent exercise."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("complement-search").fill("bench")
    catalog_rows = app_page.get_by_test_id("complement-result").filter(has_text="CATALOG")
    first = catalog_rows.first
    title = first.locator("span.text-sm").inner_text()  # exercise name
    first.click()
    # Close picker
    app_page.get_by_role("button", name="Done").click()
    # The first exercise row now has a superset-card with that title
    cards = app_page.get_by_test_id("superset-card")
    expect(cards.filter(has_text=title).first).to_be_visible()
```

- [ ] **Step 2: Run the test (expect RED)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_add_lib_complement -v`

Expected: FAIL — the `lib` card does not render yet (decode falls through).

- [ ] **Step 3: Add the `lib` arm to the first decode site**

Edit `components/workout-view.tsx`. Find the `else if (decoded.kind === "pt")` block ending around line 1085 (right before the closing `}` of the `for (const id of userComps)` loop in `buildSupersetCards`). Insert AFTER the `pt` block and BEFORE the loop's closing `}`:

```ts
        } else if (decoded.kind === "lib") {
          const data = EX[decoded.value];
          if (!data) continue;
          const s = data.sets[0];
          cards.push({
            key: id,
            kind: "leftleg",
            label: "CATALOG",
            color: "#3b82f6",
            title: decoded.value,
            sets: s ? `${s[0]}×${s[1]}` : "",
            instruction: data.execution ?? "",
            removable: true,
            complementId: id,
          });
```

- [ ] **Step 4: Add the `lib` arm to the second decode site (focus mode)**

In the same file, find the `else if (decoded.kind === "pt")` block in the focus-mode supps loop ending around line 1380 (right before the closing `}` of `for (const id of userComps)` inside the focus-mode block, which itself ends with `return { name: nm, ex: exItem, supplements: ... }`). Insert AFTER the `pt` block and BEFORE the loop's closing `}`:

```ts
              } else if (decoded.kind === "lib") {
                const data = EX[decoded.value];
                if (!data) continue;
                const s = data.sets[0];
                supps.push({
                  type: "leftleg",
                  name: decoded.value,
                  sets: s ? `${s[0]}×${s[1]}` : "",
                  instruction: data.execution ?? "",
                });
```

- [ ] **Step 5: Run the test (expect GREEN)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_add_lib_complement -v`

Expected: PASS.

- [ ] **Step 6: Run the full e2e suite**

Run: `cd e2e && uv run pytest -x --timeout=60 -q`

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add components/workout-view.tsx e2e/test_ad_hoc_supersets.py
git commit -m "feat(supersets): render catalog (lib) complement cards under exercises"
```

---

## Task 7: Custom-text input mode in picker

Adds a "Custom text" pill below the chips that swaps the search input for a free-text input + Save button. Save creates a `text|<base64>` complement and closes the picker. No render-side change yet — that lands in Task 8.

**Files:**
- Modify: `components/complement-picker.tsx`

- [ ] **Step 1: Add custom-text mode state and the toggle UI**

Edit `components/complement-picker.tsx`. Near the existing `useState` calls (added in Task 3), add:

```ts
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
```

Inside the body div, immediately AFTER the filter chip row and BEFORE the search input (note: when `customMode` is true, we hide the search input + chips and show the custom UI instead), refactor to wrap conditionally. The body block becomes:

```tsx
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 pt-3">
          {!customMode && (
            <>
              <input
                data-testid="complement-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search complements..."
                className="w-full mb-3 px-3 py-2 rounded-lg text-sm font-[inherit]"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />

              <div className="flex flex-wrap gap-1.5 mb-3">
                {/* (chip row from Task 4 — unchanged) */}
              </div>

              <button
                data-testid="custom-text-toggle"
                onClick={() => setCustomMode(true)}
                className="mb-3 text-[11px] font-bold rounded-full px-2.5 py-1 cursor-pointer font-[inherit]"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                + Custom text
              </button>

              {results.length === 0 && (
                <div className="text-[12px] text-text-muted py-3 leading-relaxed">
                  {query
                    ? `No matches for "${query}".`
                    : "Nothing in reach right now. Open the edit sheet and select nearby equipment, or try adding generic quad sets below."}
                </div>
              )}

              <div className="space-y-1.5">
                {results.map((r) => (
                  <div data-testid="complement-result" key={r.id}>
                    <ComplementButton
                      label={r.label}
                      color={r.color}
                      title={r.title}
                      sets={r.sets}
                      description={r.description}
                      active={activeSet.has(r.id)}
                      onClick={() => onToggle(r.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {customMode && (
            <div data-testid="custom-text-form">
              <div className="flex gap-2 mb-3">
                <input
                  data-testid="custom-text-input"
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type your superset..."
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-[inherit]"
                  style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
                <button
                  data-testid="custom-text-save"
                  onClick={() => {
                    const trimmed = customText.trim();
                    if (!trimmed) return;
                    onToggle(encodeTextId(trimmed));
                    setCustomText("");
                    setCustomMode(false);
                    onClose();
                  }}
                  className="px-3 rounded-lg text-sm font-bold cursor-pointer font-[inherit]"
                  style={{
                    background: "var(--color-accent)22",
                    border: "1px solid var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                >
                  Save
                </button>
              </div>
              <button
                data-testid="custom-text-cancel"
                onClick={() => {
                  setCustomMode(false);
                  setCustomText("");
                }}
                className="text-[11px] text-text-muted cursor-pointer font-[inherit]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
```

The chip row inside the `<>` fragment must keep the actual chip-rendering code from Task 4 (don't ship the placeholder comment). The literal chip block to use:

```tsx
              <div className="flex flex-wrap gap-1.5 mb-3">
                {([
                  ["all", "All"],
                  ["catalog", "Catalog"],
                  ["nearby", "Nearby"],
                  ["supp", "L-Leg"],
                  ["core", "Core"],
                  ["mobility", "Mobility"],
                  ["pt", "PT"],
                ] as const).map(([key, label]) => {
                  const isAll = key === "all";
                  const active = isAll
                    ? filters.size === 0
                    : filters.has(key as ComplementSource);
                  return (
                    <button
                      key={key}
                      data-testid={`filter-chip-${key}`}
                      onClick={() => {
                        if (isAll) {
                          setFilters(new Set());
                        } else {
                          setFilters(new Set([key as ComplementSource]));
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 cursor-pointer font-[inherit]"
                      style={{
                        background: active
                          ? "var(--color-accent)22"
                          : "var(--color-bg)",
                        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
                        color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
```

- [ ] **Step 2: Typecheck and build**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 3: Confirm existing tests still pass**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py -v`

Expected: all 4 tests so far pass (`test_picker_has_search_and_results`, `test_filter_chip_narrows_results`, `test_search_finds_catalog_exercise`, `test_add_lib_complement`).

- [ ] **Step 4: Commit**

```bash
git add components/complement-picker.tsx
git commit -m "feat(supersets): custom-text input mode in picker"
```

---

## Task 8: Render `text` complement in workout-view

Adds the `decoded.kind === "text"` switch arm to BOTH decode sites in `components/workout-view.tsx`. A `text` complement renders as a thin gray card with the user's typed string and a remove button.

**Files:**
- Modify: `components/workout-view.tsx`
- Test: `e2e/test_ad_hoc_supersets.py`

- [ ] **Step 1: Write the failing tests**

Append to `e2e/test_ad_hoc_supersets.py`:

```python
def test_add_custom_text_complement(app_page: Page):
    """Custom-text save creates a card with the typed string under the exercise."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("custom-text-toggle").click()
    app_page.get_by_test_id("custom-text-input").fill("Cossack squat 3x8")
    app_page.get_by_test_id("custom-text-save").click()
    expect(app_page.get_by_test_id("complement-picker")).not_to_be_visible()
    cards = app_page.get_by_test_id("superset-card")
    expect(cards.filter(has_text="Cossack squat 3x8").first).to_be_visible()


def test_remove_custom_text(app_page: Page):
    """Tapping the × on a custom-text card removes it from the workout."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("custom-text-toggle").click()
    app_page.get_by_test_id("custom-text-input").fill("My custom move")
    app_page.get_by_test_id("custom-text-save").click()
    card = app_page.get_by_test_id("superset-card").filter(has_text="My custom move").first
    expect(card).to_be_visible()
    card.get_by_role("button", name="Remove complement").click()
    expect(app_page.get_by_test_id("superset-card").filter(has_text="My custom move")).to_have_count(0)
```

- [ ] **Step 2: Run the tests (expect RED)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_add_custom_text_complement test_ad_hoc_supersets.py::test_remove_custom_text -v`

Expected: FAIL — text decode falls through, no card renders.

- [ ] **Step 3: Add the `text` arm to the first decode site**

Edit `components/workout-view.tsx`. Find the `lib` arm added in Task 6 inside `buildSupersetCards`. Immediately AFTER it (still inside the `for (const id of userComps)` loop), add:

```ts
        } else if (decoded.kind === "text") {
          cards.push({
            key: id,
            kind: "leftleg",
            label: "CUSTOM",
            color: "#71717a",
            title: decoded.value,
            sets: "",
            instruction: "",
            removable: true,
            complementId: id,
          });
```

- [ ] **Step 4: Add the `text` arm to the second decode site (focus mode)**

In the same file, find the `lib` arm added in Task 6 inside the focus-mode supps loop. Immediately AFTER it, add:

```ts
              } else if (decoded.kind === "text") {
                supps.push({
                  type: "leftleg",
                  name: decoded.value,
                  sets: "",
                  instruction: "",
                });
```

- [ ] **Step 5: Run the tests (expect GREEN)**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_add_custom_text_complement test_ad_hoc_supersets.py::test_remove_custom_text -v`

Expected: both PASS.

- [ ] **Step 6: Run the full file**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py -v`

Expected: 6 tests passing.

- [ ] **Step 7: Commit**

```bash
git add components/workout-view.tsx e2e/test_ad_hoc_supersets.py
git commit -m "feat(supersets): render custom (text) complement cards under exercises"
```

---

## Task 9: Persistence E2E

Confirms both `lib` and `text` complements survive a page reload (they ride on the existing `dayState.complements` localStorage path so this should pass without code changes — but the spec calls it out as a required test, and it guards against future regressions).

**Files:**
- Test: `e2e/test_ad_hoc_supersets.py`

- [ ] **Step 1: Write the test**

Append to `e2e/test_ad_hoc_supersets.py`:

```python
def test_complement_persistence(app_page: Page):
    """A lib complement and a text complement both survive a page reload."""
    open_picker_for_first_exercise(app_page)

    # Add a lib complement
    app_page.get_by_test_id("complement-search").fill("bench")
    catalog_rows = app_page.get_by_test_id("complement-result").filter(has_text="CATALOG")
    catalog_title = catalog_rows.first.locator("span.text-sm").inner_text()
    catalog_rows.first.click()

    # Switch to custom-text and add one
    app_page.get_by_test_id("custom-text-toggle").click()
    app_page.get_by_test_id("custom-text-input").fill("Persisted custom move")
    app_page.get_by_test_id("custom-text-save").click()

    # Reload
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']", timeout=15000)

    # Both cards still visible (re-expand the first row first)
    first_row = app_page.get_by_test_id("exercise-row").first
    first_row.click()
    cards = app_page.get_by_test_id("superset-card")
    expect(cards.filter(has_text=catalog_title).first).to_be_visible()
    expect(cards.filter(has_text="Persisted custom move").first).to_be_visible()
```

- [ ] **Step 2: Run the test**

Run: `cd e2e && uv run pytest test_ad_hoc_supersets.py::test_complement_persistence -v`

Expected: PASS — `dayState.complements` already persists via the existing `nwb_complements_<date>` localStorage key, no code change needed.

- [ ] **Step 3: Commit (test only)**

```bash
git add e2e/test_ad_hoc_supersets.py
git commit -m "test(supersets): persistence across reload for lib + text complements"
```

---

## Task 10: Build, full regression, PR, merge

Final gate. Confirms typecheck + production build + full E2E suite + cleanup, then ships to dev and dev → main.

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`

Expected: 0 errors.

- [ ] **Step 2: Production build**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 3: Full E2E suite**

Run: `cd e2e && uv run pytest --timeout=60`

Expected: all tests pass (97 existing + 7 new from `test_ad_hoc_supersets.py` = 104 total).

If any pre-existing test fails, investigate before proceeding. Likely culprits: a test that asserted on the now-removed source-section heading copy (e.g. "In reach (N)" or "Left-leg rehab (N)"). Patch those tests to use `complement-result` testid.

- [ ] **Step 4: Push the branch and open a PR to dev**

```bash
git push -u origin feat/ad-hoc-supersets
gh pr create --base dev --title "feat: ad-hoc supersets — universal search + free-text complement" --body "$(cat <<'EOF'
## Summary
- Replaces the source-stacked complement picker with a universal search input + filter chips
- Adds two new ComplementId kinds: `lib|<exercise-name>` (any catalog exercise) and `text|<base64>` (free text)
- Renders both new kinds as cards under the parent exercise; both removable like existing complements

## Test plan
- [x] `e2e/test_ad_hoc_supersets.py` — 7 new tests covering search, filter chips, catalog/text add, removal, persistence
- [x] Full E2E suite green
- [x] Manual smoke on Safari mobile

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Wait for CI green, then merge to dev**

Run: `gh pr checks --watch` (block until green)

Then: `gh pr merge --squash --delete-branch`

- [ ] **Step 6: Fast-forward dev → main**

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git merge --ff-only origin/dev
git push origin main
```

- [ ] **Step 7: Verify Vercel production deploy**

Run: `vercel inspect $(vercel ls --prod -1 nwb-plan | tail -1)` or check https://nfit.93.fyi for the new picker.

Expected: production reflects the new picker UX.

---

## Self-review checklist

**Spec coverage (against `docs/superpowers/specs/2026-05-07-ad-hoc-supersets-design.md`):**
- ✅ Universal search input (Goal #1) → Task 3
- ✅ Filter chips (Goal #2, #3) → Task 4
- ✅ Substring match + prefix-first sort (Goal #4) → Task 2
- ✅ Empty search shows curated default (Goal #5) → Task 2 + 3
- ✅ Custom-text toggle (Goal #6) → Task 7
- ✅ Two new ComplementId kinds + encode/decode (Goal #7) → Task 1
- ✅ Render `lib` and `text` under exercise (Goal #8) → Task 6 + 8
- ✅ All 7 E2E tests from spec → Tasks 3, 4, 5, 6, 8, 9 (test 7 `test_remove_custom_text` is in Task 8)

**Non-goals (explicitly NOT covered, matching spec):**
- ✅ HEP search excluded — `searchComplements` does not iterate `HEP_EXERCISES`
- ✅ Reordering, editing custom text, fuzzy matching, history search — none included

**Type consistency:**
- `ComplementSource` defined in Task 2 and used in Tasks 3, 4 — consistent.
- `SearchResult` defined in Task 2 and consumed in Task 3 — fields (`id`, `source`, `label`, `color`, `title`, `sets`, `description`) match.
- `encodeLibId(name: string)` and `encodeTextId(text: string)` signatures consistent across Tasks 1, 7.
