# NWB Workout Plan

A Progressive Web App for MRI-adjusted non-weight-bearing (NWB) Push/Pull/Legs training. Built around a femoral neck stress fracture + L4-L5 DDD protocol — every exercise selected and modified to protect the injured hip, spine, and labrum while maximising upper body and unilateral leg development.

**Live:** [nfit.93.fyi](https://nfit.93.fyi)
**Companion yoga app:** [nyoga.93.fyi](https://nyoga.93.fyi)

---

## Features

- **Today tab** — shows today's scheduled workout in the PPL rotation, with a 42-day ProgressClock
- **Upper Body tab** — Push A/B + Pull A/B workouts with inline diagram gallery access
- **Lower Body tab** — Legs A/B + Recovery workouts with inline diagram gallery access
- **Core tab** — 35+ core exercises organized by body part (anterior, obliques, posterior, integrated) with equipment-aware nearby picker
- **Cardio tab** — NWB cardio schedule (SkiErg, arm ergo, battle ropes, boxing) with weekly planner
- **3 progression phases** — Foundation → Build → Peak (sets/reps auto-adjust per phase)
- **35+ animated SVG exercise diagrams** — full gallery across 8 categories: rack core, supine, prone, glute, TRX, arm balance, yoga, and equipment
- **Left leg & core supersets** — interleaved rehab exercises with toggle controls, equipment-aware suggestions
- **Machine type picker** — visual card selector per exercise (e.g., plate-loaded vs selectorized)
- **Nearby equipment chips** — "What's within reach?" drives context-aware superset suggestions (11 equipment types including TRX)
- **Equipment-specific core blocks** — captain's chair, parallel bars, barbell, and hanging exercises that appear when you select nearby equipment
- **Equipment-aware swaps** — toggle gear on/off; exercises auto-route to available alternatives
- **HEVY deep-links** — one-tap "Open in HEVY" button on every workout
- **Dark/light theme** — toggle in header, persisted to localStorage
- **Rest timer** — per-exercise countdown with pulse animation
- **Offline-capable PWA** — installs to home screen, works without internet
- **AI suggestions** — Claude-powered exercise suggestions (behind feature flag)

## How to Use

### First-Time Setup

1. **Open the app** — visit the URL or install as a PWA from your browser's "Add to Home Screen"
2. **Go to the Equip tab** — toggle OFF any equipment your gym doesn't have. Exercises that need unavailable gear will show swap alternatives automatically
3. **Set your week start** — in the Equip tab, shift the PPL rotation to match when your training week begins (defaults to Monday)
4. **Paste HEVY links** (optional) — if you use [Hevy](https://hevy.com), each workout has an "Open in HEVY" button. The default links are pre-configured

### Daily Gym Workflow

```
Open app → Today tab shows your scheduled workout
    │
    ▼
Tap workout to expand → see all exercises with sets/reps for current phase
    │
    ▼
Tap an exercise to expand its detail panel:
    ├── Setup instructions (how to get into position safely)
    ├── Execution cues (how to perform the rep)
    ├── NWB safety cues (what your left leg should be doing)
    ├── Machine type picker (if multiple machine options exist)
    ├── "What's within reach?" chips (mark nearby equipment)
    └── Swap buttons (switch to an alternative exercise)
    │
    ▼
Between sets:
    ├── Tap "Start Rest Timer" → countdown with pulse alert
    ├── Superset cards appear below (if L-Leg or Core toggles are ON):
    │   ├── Teal cards = left leg rehab (quad sets, ankle pumps, etc.)
    │   └── Orange cards = core supplement (region-tagged: upper/lower/obliques)
    └── Equipment-specific supersets show automatically:
        ├── On leg machines → "Same machine, switch legs" suggestions
        ├── On cable stations → ankle dorsiflexion superset
        └── Nearby equipment → context-aware rehab suggestions
```

### Superset Toggles

Each workout has two toggle buttons at the top:

- **L-Leg Supersets** (teal) — interleaves left leg rehabilitation exercises between your main sets. 3 base exercises on all days, 5 on leg days. Also activates equipment-specific supersets (e.g., "same machine, switch legs" on leg extension)
- **Core Supersets** (orange) — interleaves core exercises between your main sets. Each training day has a unique 4-exercise core routine targeting upper abs, lower abs, and obliques

Both are ON by default. Toggle OFF if you want to focus on the main workout only.

### Phase Progression

Tap the phase selector below the header to switch between:

| Phase | Weeks | Focus |
|-------|-------|-------|
| **Foundation** | 1-2 | Higher reps, learn safe movement patterns |
| **Build** | 3-4 | Increase load, 4-sec eccentrics, drop sets |
| **Peak** | 5-6 | Maximum safe output, heavy singles |

Sets and reps update automatically throughout the app when you change phases.

### Exercise Diagrams

The app includes 35+ animated SVG exercise diagrams organized into 8 categories:

| Category | Exercises | Examples |
|----------|-----------|---------|
| **Rack Core** | 5 | Landmine rotations, plate halos, barbell rollouts |
| **Supine** | 4 | Cross-body reach, supine twist, modified navasana |
| **Prone / Box** | 4 | Prone hip extension, prone Y-T-W, back extension |
| **Glute** | 3 | Glute bridge, banded clamshell, cable kickback |
| **TRX** | 7 | TRX pike, body saw, mountain climber, fallout |
| **Arm Balance** | 6 | L-sit, crow, pseudo planche push-up |
| **Yoga** | 4 | Dolphin pose, warrior III, chair pose |
| **Equipment** | 2 | Pseudo planche push-up, side plank |

Access the gallery from the diagram buttons on the Upper, Lower, and Core tabs. All diagrams support tap-to-pause animation.

### Offline Use

The app works fully offline after the first load. All exercise data, equipment state, and UI preferences are stored locally. Only AI suggestions (if enabled) require an internet connection.

## Tabs

| Tab | Purpose |
|-----|---------|
| **Today** | Today's scheduled workout + 42-day ProgressClock |
| **Upper** | Push A/B + Pull A/B exercises with diagram gallery |
| **Lower** | Legs A/B + Recovery exercises with diagram gallery |
| **Core** | Core exercises by body part + equipment-aware nearby picker |
| **Cardio** | NWB cardio options + weekly schedule |
| **Equip** | Toggle available equipment; updates swaps throughout |
| **Safety** | Injury cues, NWB rules, nutrition, and red-flag checklist |

## Protocol Constraints

Every exercise satisfies all of the following:

| Constraint | Reason |
|---|---|
| Zero weight-bearing on left leg | Compression-sided medial femoral neck stress fracture |
| No hip flexion past 90 degrees | Bilateral FAI + anterosuperior labral tears |
| No spinal flexion/rotation under load | L4-L5 degenerative disc disease |
| No active left hip flexor recruitment | Protect stress fracture site during healing |

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge                              │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Static Assets  │  │        Serverless Functions          │ │
│  │   Next.js SSG    │  │                                      │ │
│  │   ┌──────────┐   │  │  /api/auth/[...nextauth]  (Google)  │ │
│  │   │ app/     │   │  │  /api/suggest             (Claude)  │ │
│  │   │ page.tsx │   │  │  /api/users               (stub)    │ │
│  │   └──────────┘   │  │  /api/saved-suggestions   (stub)    │ │
│  │   public/sw.js   │  │                                      │ │
│  │   public/*.png   │  └──────────────────────────────────────┘ │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (PWA)                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  WorkoutView (client component — all UI state)            │  │
│  │                                                           │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────┐ ┌───────┐ │  │
│  │  │ Section │ │ExerciseRow│ │RestTimer│ │Badge │ │Callout│ │  │
│  │  └─────────┘ └──────────┘ └────────┘ └──────┘ └───────┘ │  │
│  │  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐   │  │
│  │  │MachineSelector│ │NearbyPicker │ │  DiagramModal    │   │  │
│  │  └──────────────┘ └─────────────┘ │  ├ PlancheDiagram │   │  │
│  │  ┌──────────────┐ ┌─────────────┐ │  ├ SidePlankDiag  │   │  │
│  │  │ProgressClock │ │DiagramGallery│ │  ├ GluteBridgeDiag│  │  │
│  │  └──────────────┘ │ 35+ animated│ │  ├ ClamshellDiag  │   │  │
│  │                   │ SVG diagrams│ │  └ CoreDemoGuide  │   │  │
│  │                   └─────────────┘ └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                    ┌─────────┴─────────┐                        │
│                    │   localStorage    │                        │
│                    │   (all UI state)  │                        │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────────────┐
│  lib/exercises.ts    │──── 80+ exercises, typed, with safety constraints,
│  (~120KB)            │     machine variants, swap chains, diagram keys
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐     ┌──────────────────────┐
│  lib/supplements.ts  │     │    lib/storage.ts     │
│  Left leg rehab      │     │  loadState/saveState  │
│  Core daily routines │     │  ← localStorage →     │
│  Nearby supersets    │     └──────────┬───────────┘
│  Cable supersets     │                │
└────────┬─────────────┘                │
         │                              │
         ▼                              ▼
┌─────────────────────────────────────────────────────┐
│              WorkoutView (client)                    │
│                                                     │
│  State:                                             │
│  ├ tab, phase, openSections, expandedEx             │
│  ├ equipment (toggles), swaps                       │
│  ├ machineSelections, nearbySelections              │
│  ├ supplementToggles { leftLeg, core }              │
│  ├ hevyIds, startDay, theme                         │
│  └ timer, diagramOpen                               │
│                                                     │
│  Derives:                                           │
│  ├ suppMap (interleaved left leg + core per exercise)│
│  ├ ssInfo (equipment-specific superset suggestion)  │
│  ├ nearbySupersets (from nearby chips + in-use)     │
│  └ availableSwaps (filtered to prevent duplicates)  │
└─────────────────────────────────────────────────────┘
```

### Directory Structure

```
nwb-plan/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, PWA meta, theme script
│   ├── page.tsx                  # Home → renders WorkoutView
│   ├── globals.css               # Tailwind + theme vars + desktop scaling
│   ├── admin/page.tsx            # Admin panel (role-gated)
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth v5 Google OAuth
│       ├── suggest/              # Claude AI suggestions (feature-flagged)
│       │   ├── route.ts
│       │   └── system-prompt.ts  # NWB safety constraints for AI
│       ├── users/route.ts        # User management (stub)
│       └── saved-suggestions/    # Saved suggestions (stub)
│
├── components/                   # React client components
│   ├── workout-view.tsx          # Main app shell, all state, 7 tabs
│   ├── exercise-row.tsx          # Exercise detail panel with safety cues
│   ├── machine-selector.tsx      # Visual machine type picker cards
│   ├── nearby-picker.tsx         # Multi-select nearby equipment chips
│   ├── diagram-modal.tsx         # Diagram registry + modal wrapper
│   ├── core-demo-guide.tsx       # 17 animated core exercise SVGs
│   ├── exercise-diagrams.tsx     # Glute Bridge + Clamshells animated SVGs
│   ├── diagrams/                 # Unified diagram gallery system
│   │   ├── gallery.tsx           # Main gallery component with category tabs
│   │   ├── data.ts              # Exercise diagram metadata (35 exercises, 8 categories)
│   │   ├── helpers.tsx          # Shared SVG primitives and animation helpers
│   │   ├── rack-core.tsx        # Rack core animations (5)
│   │   ├── supine.tsx           # Supine animations (4)
│   │   ├── prone.tsx            # Prone/box animations (4)
│   │   ├── glute.tsx            # Glute animations (3)
│   │   ├── trx.tsx              # TRX animations (7)
│   │   ├── arm-balance.tsx      # Arm balance animations (6)
│   │   ├── yoga.tsx             # Yoga animations (4)
│   │   ├── equipment.tsx        # Equipment animations (2)
│   │   └── index.ts             # Re-exports
│   ├── suggestion-card.tsx       # AI suggestion display (feature-flagged)
│   ├── progress-clock.tsx        # 6-week program timer
│   ├── rest-timer.tsx            # Post-exercise countdown
│   ├── section.tsx               # Collapsible section wrapper
│   ├── callout.tsx               # Info/warning/danger callout cards
│   ├── badge.tsx                 # Status pill badges
│   ├── removed-row.tsx           # Removed exercise display
│   ├── auth-button.tsx           # NextAuth sign-in/out (lazy-loaded)
│   └── providers.tsx             # SessionProvider wrapper
│
├── lib/                          # Data & configuration
│   ├── exercises.ts              # 80+ exercises, types, workouts, schedule
│   ├── supplements.ts            # Left leg rehab, core routines, supersets
│   ├── auth.ts                   # NextAuth v5 config (Google OAuth)
│   ├── anthropic.ts              # Anthropic SDK client
│   └── storage.ts                # localStorage helpers
│
├── public/                       # Static PWA assets
│   ├── sw.js                     # Service worker (cache-first, v6)
│   ├── manifest.json             # PWA manifest (standalone, dark)
│   ├── icon.svg                  # Lotus flower SVG icon
│   ├── icon-192.png              # PWA icon 192x192
│   └── icon-512.png              # PWA icon 512x512 (maskable)
│
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript strict mode
├── postcss.config.mjs            # PostCSS for Tailwind
├── vercel.json                   # Vercel deployment (framework: nextjs)
└── package.json                  # Next.js 16, React 19, Tailwind v4
```

### Superset System

```
Exercise expanded
    │
    ├── Machine type selected? ──→ Show variant-specific superset
    │   (machineVariants[].superset)   e.g. "Same machine — switch legs"
    │
    ├── Cable exercise? ──→ First cable per workout gets ankle dorsiflexion
    │   (cableSuperset flag)
    │
    ├── Nearby equipment selected? ──→ Show nearby-driven suggestions
    │   (NEARBY_SUPERSETS[])          e.g. cable station → ankle dorsiflexion
    │                                      bench → quad sets
    │
    └── Supplement toggles ON? ──→ Interleaved left leg + core cards
        (suppMap built from SUPPLEMENT_LEFT_LEG + SUPPLEMENT_CORE)
        Left leg: teal accent, 3 base + 2 extra on leg days
        Core: orange accent, 4 exercises per day with region tags
```

### PWA & Offline

```
Install → sw.js registers → precaches /, manifest, icons
    │
    Request arrives
    ├── /api/* or /_next/* → network only (always fresh)
    ├── Navigation request → cache first, fallback to cached /
    └── Static asset → cache first, fallback to network

Cache: nwb-plan-v6 (bumped on deploy, old caches auto-cleaned)
```

## Stack

| | |
|---|---|
| **Framework** | Next.js 16 App Router with Turbopack |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 + CSS custom properties for theming |
| **State** | React hooks in WorkoutView, localStorage persistence |
| **Auth** | NextAuth v5, Google OAuth |
| **AI** | Anthropic Claude (behind feature flag) |
| **PWA** | Service worker (cache-first), standalone manifest |
| **Deployment** | Vercel — push to `main`, auto-deploys |

## localStorage Keys

| Key | Contents |
|-----|---------|
| `nwb_tab` | Active tab index |
| `nwb_phase` | Progression phase (0=Foundation, 1=Build, 2=Peak) |
| `nwb_equipment` | Equipment id → boolean (available/unavailable) |
| `nwb_swaps` | Exercise swap selections |
| `nwb_hevy` | Workout key → HEVY routine URL |
| `nwb_startDay` | Day-of-week index the PPL rotation starts on |
| `nwb_machines` | Exercise → selected machine variant id |
| `nwb_nearby` | Exercise → selected nearby equipment ids |
| `nwb_core_nearby` | Selected nearby equipment in Core tab |
| `nwb_supplements` | `{ leftLeg: bool, core: bool }` toggle state |
| `nwb_theme` | `"dark"` or `"light"` |

## Development

```bash
npm install
npm run dev          # Turbopack dev server
npm run build        # Production build
```

## Environment Variables

```bash
# Feature flags
NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS=false

# AI (set in Vercel dashboard when ready)
ANTHROPIC_API_KEY=

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=

# See .env.local.example for full list
```

## Deploy

Push to `main` — Vercel auto-deploys.
