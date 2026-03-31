# NWB Workout Plan

A Progressive Web App for MRI-adjusted non-weight-bearing (NWB) Push/Pull/Legs training. Built around a femoral neck stress fracture + L4-L5 DDD protocol — every exercise selected and modified to protect the injured hip, spine, and labrum while maximising upper body and unilateral leg development.

**Live:** [nwbfit.vercel.app](https://nwbfit.vercel.app)
**Companion yoga app:** [nwb-yoga.vercel.app](https://nwb-yoga.vercel.app)

---

## Features

- **Today tab** — shows today's scheduled workout in the PPL rotation, with a 42-day ProgressClock (week + day tracker)
- **Push / Pull / Legs / Recovery** — 6-day PPL split with A/B variants
- **3 progression phases** — Foundation → Build → Peak (sets/reps auto-adjust per phase)
- **Equipment-aware swaps** — toggle gear on/off; exercises auto-route to available alternatives
- **HEVY deep-links** — paste your routine URLs once, get a one-tap "Open in HEVY" button on every workout
- **Flexible week start** — shift the PPL rotation to begin on any day of the week
- **SVG visual guides** — inline position diagrams for core and compound movements
- **Rest timer** — per-exercise countdown with pulse animation at completion
- **Offline-capable PWA** — installs to home screen, works without internet

## Tabs

| Tab | Purpose |
|-----|---------|
| **Today** | Today's scheduled workout + 42-day ProgressClock |
| **Workouts** | Full exercise library (Push / Pull / Legs), all phases |
| **Cardio** | NWB cardio options (arm bike, battle rope, etc.) |
| **Core** | Core & ab routines safe for the protocol |
| **Equip** | Toggle available equipment; updates swaps throughout |
| **Safety** | Injury cues, NWB rules, and red-flag checklist |

## Protocol Constraints

Every exercise satisfies all of the following:

| Constraint | Reason |
|---|---|
| Zero weight-bearing on left leg | Compression-sided medial femoral neck stress fracture |
| No hip flexion past 90° | Bilateral FAI + anterosuperior labral tears |
| No spinal flexion/rotation under load | L4-L5 degenerative disc disease |
| No active left hip flexor recruitment | Protect stress fracture site during healing |

Exercises are tagged `safe` / `caution` and flagged when required equipment is unavailable.

## Stack

Pure static site — no build step, no bundler, no package manager.

| | |
|---|---|
| **Framework** | React 18.2 via CDN (no JSX — uses `React.createElement` aliased as `e()`) |
| **Styling** | Inline JS style objects with a centralised `C` colour palette |
| **State** | `React.useState` hooks, all in one `App` component |
| **Persistence** | `localStorage` (see keys below) |
| **PWA** | `sw.js` cache-first service worker, `manifest.json` standalone dark theme |
| **Deployment** | Vercel — push to `main`, no build command, output dir is `.` |

**No tests, no linter, no type checking configured.**

## Development

No setup required. Any static file server works:

```bash
python -m http.server 8080
# open http://localhost:8080
```

Or open `index.html` directly in a browser.

## Architecture

Everything lives in a single `index.html` (~1950 lines):

```
index.html
├── Data         EX_DETAILS (50+ exercises), WORKOUTS, SCHED, PHASES, EQUIPMENT
├── Components   Badge, Section, ExRow, Callout, EqTable, ProgressClock — all stateless
├── App          Tab UI (Today/Workouts/Cardio/Core/Equip/Safety), phase/day picker,
│                equipment toggles, swap system, HEVY links
└── Styles       Dark theme, mobile-first inline style objects, centralised C palette

sw.js           Service worker (cache-first, cache name nwb-plan-v1)
manifest.json   PWA manifest (standalone mode, dark theme, maskable icons)
```

**Sub-components are stateless** to avoid React Error 310 in the CDN/no-JSX environment.

## localStorage Keys

| Key | Contents |
|-----|---------|
| `nwb_phase` | Active progression phase (0 = Foundation, 1 = Build, 2 = Peak) |
| `nwb_equipment` | Map of equipment id → boolean (available/unavailable) |
| `nwb_swaps` | Map of exercise name → selected swap exercise name |
| `nwb_hevy` | Map of workout key → HEVY routine URL |
| `nwb_startDay` | Day-of-week index the PPL rotation starts on |

## Deployment

Push to `main` — Vercel auto-deploys with no build command. Output directory is the repo root.
