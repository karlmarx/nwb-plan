# CLAUDE.md — NWB Training Plan (Femur Fracture Fitness)

## What Is This

A PWA for non-weight-bearing (NWB) Push/Pull/Legs training protocol after a left femur stress fracture. Tracks workouts, supplements (left leg rehab + core), nutrition, and equipment availability.

**Live:** https://nwbfit.vercel.app

## Architecture

**As of PR #30 (refactor branch):** Vite + React with JSX components.
**Main branch:** Still single `index.html` with inline React until refactor merges.

### Refactored Structure (refactor/react-app branch)
```
nwb-plan/
├── index.html              ← Minimal Vite entry
├── vite.config.js
├── package.json
├── vercel.json             ← buildCommand: npm run build, outputDirectory: dist
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon.svg
│   ├── manifest.json
│   └── sw.js
├── scripts/
│   └── verify-build.ps1   ← Local build + Playwright smoke test
└── src/
    ├── main.jsx
    ├── App.jsx             ← All state management, tab routing
    ├── App.css
    ├── theme.js            ← Color palette constants
    ├── components/
    │   ├── TodayTab.jsx
    │   ├── WorkoutsTab.jsx
    │   ├── WorkoutView.jsx
    │   ├── ExerciseCard.jsx
    │   ├── SupplementCard.jsx
    │   ├── NutritionSection.jsx
    │   ├── CoreTab.jsx
    │   ├── CardioTab.jsx
    │   ├── EquipmentTab.jsx
    │   ├── SafetyTab.jsx
    │   ├── ProgramClock.jsx
    │   ├── RestTimer.jsx
    │   ├── DiagramModal.jsx
    │   ├── Badge.jsx
    │   ├── Callout.jsx
    │   └── Section.jsx
    ├── data/
    │   ├── exercises.js    ← All exercise definitions (~84KB)
    │   ├── supplements.js  ← Left leg + core supplement data
    │   ├── nutrition.js    ← Daily nutrition checklist items
    │   ├── program.js      ← Workout schedule, phases
    │   └── equipment.js    ← Equipment definitions
    └── utils/
        ├── storage.js      ← localStorage helpers + schema versioning
        ├── dates.js        ← Week/day calculations
        └── timer.js        ← Countdown/countup logic
```

## Development

```bash
npm install
npm run dev              # Vite dev server
npm run build            # Production build → dist/

# Verify build mimics Vercel (includes Playwright smoke test):
.\scripts\verify-build.ps1
```

## Deploy

Push to `main` — Vercel auto-deploys. Or manually:
```bash
npx vercel --yes --prod
```

## Key Features

- **6-tab UI:** Today, Workouts, Cardio, Core, Equipment, Safety
- **3 progression phases** with exercise modifications per phase
- **Equipment toggles** — exercises grey out when equipment unavailable, suggest swaps
- **Exercise variants** — pill selector for different machine types (e.g., plate-loaded vs cable)
- **Supplement supersets** — left leg rehab + core exercises interleaved into main workouts
- **Daily nutrition checklist** — 10 items with streak tracking and escalating alerts
- **Rest timer** with countdown
- **Program clock** — countup from program start date
- **Movement diagrams** — ASCII art exercise guides
- **Hevy deep links** — open workouts in Hevy app

## State (localStorage)

All state persisted to localStorage:
- `nwb_phase` — current training phase (0-2)
- `nwb_equipment` — equipment availability toggles
- `nwb_swaps` — exercise swap selections
- `nwb_variants` — equipment variant selections
- `nwb_supplements` — supplement section toggles (leftLeg, core)
- `nwb_nutrition` — today's nutrition checklist state
- `nwb_nutrition_history` — historical nutrition data (pruned to 90 days)
- `nwb_nutrition_dismissed` — dismissed nutrition alerts
- `nwb_startDay` — week start day preference
- `nwb_hevy` — Hevy workout template IDs
- `nwb_schema_version` — data migration version (currently 4)

## NWB Safety Constraints

This is a medical protocol app. Every exercise has NWB safety cues. Key rules:
- No weight bearing on left leg
- No exercises that load the femur
- Cross-education (training right side to maintain left side neural pathways)
- Modified ROM and positioning for safety

## Related Project

**NWB Yoga:** https://nwb-yoga.vercel.app — yoga companion app (separate repo)

## Open Issues

- #29 — React refactor (PR #30 open)
- #31 — Visual regression testing for deployment pipeline
