# NWB Workout Plan

A Progressive Web App for MRI-adjusted non-weight-bearing (NWB) Push/Pull/Legs training. Built around a femoral neck stress fracture + L4-L5 DDD protocol — every exercise selected and modified to protect the injured hip, spine, and labrum while maximising upper body and unilateral leg development.

**Live:** [nwbfit.vercel.app](https://nwbfit.vercel.app)

---

## Features

- **Push / Pull / Legs / Recovery** — 6-day PPL split with A/B variants
- **3 progression phases** — Foundation → Build → Peak (sets/reps auto-adjust per phase)
- **Equipment-aware swaps** — toggle gear on/off; exercises auto-route to available alternatives
- **HEVY deep-links** — paste your routine URLs once, get a one-tap "Open in HEVY" button on every workout
- **Flexible week start** — shift the PPL rotation to begin on any day of the week
- **ASCII visual guides** — inline position diagrams for core and compound movements
- **Rest timer** — per-exercise countdown with pulse animation at completion
- **Offline-capable PWA** — installs to home screen, works without internet

## Protocol constraints

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
| **Framework** | React 18.2 via CDN (no JSX — uses `React.createElement`) |
| **Styling** | Inline JS style objects with a centralised `C` colour palette |
| **State** | `React.useState` hooks, all in one `App` component |
| **Persistence** | `localStorage` (phase, equipment, swaps, week start day, HEVY IDs) |
| **PWA** | `sw.js` cache-first service worker, `manifest.json` standalone dark theme |
| **Deployment** | Vercel — push to `main`, no build command, output dir is `.` |

## Development

No setup required. Any static file server works:

```bash
python -m http.server 8080
# open http://localhost:8080
```

Or open `index.html` directly in a browser.

## Architecture

Everything lives in a single `index.html` (~1100 lines):

```
index.html
├── Data        EX (50+ exercises), WORKOUTS, SCHED, PHASES, EQUIPMENT
├── Components  Badge, Section, ExRow, Callout, EqTable — all stateless
├── App         tab UI, phase/day picker, equipment toggles, swap system, HEVY links
└── Styles      dark theme, mobile-first inline style objects

sw.js           service worker (cache-first, versioned cache key)
manifest.json   PWA manifest (standalone mode, dark theme, maskable icons)
```

Sub-components are stateless to avoid React Error 310 in the CDN/no-JSX environment.
